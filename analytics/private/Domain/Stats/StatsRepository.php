<?php

declare(strict_types=1);

namespace Avi\Domain\Stats;

use PDO;
use PDOStatement;

/**
 * SQL access for stats. Every query is scoped by the filters array:
 * @phpstan-type Filters array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool}
 */
final class StatsRepository
{
    private const SECTION_LIST = "'hero','usos','ventajas','tipos','confianza','trabajos','preguntas','contacto'";

    /**
     * @param list<array{0:mixed,1:int}> $params
     */
    public function run(string $sql, array $params): PDOStatement
    {
        $statement = avi_pdo()->prepare($sql);
        $index = 1;

        foreach ($params as [$value, $type]) {
            $statement->bindValue($index, $value, $type);
            $index++;
        }

        $statement->execute();

        return $statement;
    }

    /**
     * @param Filters $filters
     * @return array{0:string,1:list<array{0:mixed,1:int}>}
     */
    public function visitSql(array $filters, bool $withPage): array
    {
        $sql = 'v.site_id = ? AND v.started_at >= ? AND v.started_at < ?';
        $params = [
            [$filters['site_id'], PDO::PARAM_INT],
            [$filters['desde_dt'], PDO::PARAM_STR],
            [$filters['hasta_dt'], PDO::PARAM_STR],
        ];

        if ($filters['ads']) {
            $sql .= " AND v.source = 'google_ads'";
        }

        if ($withPage && $filters['pagina'] !== '') {
            $sql .= ' AND EXISTS (SELECT 1 FROM events ep WHERE ep.visit_id = v.id AND ep.site_id = v.site_id AND ep.page = ?)';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        return [$sql, $params];
    }

    /**
     * @param Filters $filters
     */
    public function countVisits(array $filters): int
    {
        [$where, $params] = $this->visitSql($filters, true);

        return (int) $this->run('SELECT COUNT(*) FROM visits v WHERE ' . $where, $params)->fetchColumn();
    }

    /**
     * @param Filters $filters
     */
    public function countEvents(array $filters, string $type): int
    {
        [$where, $params] = $this->visitSql($filters, true);
        $sql = 'SELECT COUNT(*) FROM events e INNER JOIN visits v ON v.id = e.visit_id AND e.site_id = v.site_id WHERE '
            . $where . ' AND e.type = ?';
        $params[] = [$type, PDO::PARAM_STR];

        if ($filters['pagina'] !== '') {
            $sql .= ' AND e.page = ?';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        return (int) $this->run($sql, $params)->fetchColumn();
    }

    /**
     * @param Filters $filters
     */
    public function countContactVisits(array $filters): int
    {
        [$where, $params] = $this->visitSql($filters, true);
        $sql = "SELECT COUNT(DISTINCT v.id) FROM visits v INNER JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id WHERE {$where} AND e.type IN ('click_whatsapp', 'click_llamada')";

        if ($filters['pagina'] !== '') {
            $sql .= ' AND e.page = ?';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        return (int) $this->run($sql, $params)->fetchColumn();
    }

    /**
     * @param Filters $filters
     */
    public function sectionVisits(array $filters, string $section): int
    {
        [$where, $params] = $this->visitSql($filters, true);
        $sql = "SELECT COUNT(DISTINCT v.id) FROM visits v INNER JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id WHERE {$where} AND e.type = 'section_view' AND e.section = ?";
        $params[] = [$section, PDO::PARAM_STR];

        if ($filters['pagina'] !== '') {
            $sql .= ' AND e.page = ?';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        return (int) $this->run($sql, $params)->fetchColumn();
    }

    /**
     * @param Filters $filters
     * @return array<string,int> visits keyed by Y-m-d
     */
    public function dailyCounts(array $filters): array
    {
        [$where, $params] = $this->visitSql($filters, true);
        $rows = $this->run(
            'SELECT DATE(v.started_at) AS dia, COUNT(*) AS total FROM visits v WHERE ' . $where . ' GROUP BY DATE(v.started_at)',
            $params
        )->fetchAll();
        $counts = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $counts[(string) ($row['dia'] ?? '')] = (int) ($row['total'] ?? 0);
        }

        return $counts;
    }

    /**
     * @param Filters $filters
     * @return array<string,list<array{hora:string,visitas:int}>> keyed by Y-m-d
     */
    public function dailyHours(array $filters): array
    {
        [$where, $params] = $this->visitSql($filters, true);
        $rows = $this->run(
            "SELECT DATE(v.started_at) AS dia, DATE_FORMAT(v.started_at, '%H:00') AS hora, COUNT(*) AS total
             FROM visits v WHERE {$where}
             GROUP BY DATE(v.started_at), DATE_FORMAT(v.started_at, '%H:00')
             ORDER BY dia, hora",
            $params
        )->fetchAll();
        $hours = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $day = (string) ($row['dia'] ?? '');
            $hours[$day][] = [
                'hora' => (string) ($row['hora'] ?? ''),
                'visitas' => (int) ($row['total'] ?? 0),
            ];
        }

        return $hours;
    }

    /**
     * Distinct pages seen in the date range (page filter ignored).
     *
     * @param Filters $filters
     * @return list<string>
     */
    public function pageOptions(array $filters): array
    {
        $open = $filters;
        $open['pagina'] = '';
        [$where, $params] = $this->visitSql($open, false);
        $rows = $this->run(
            'SELECT DISTINCT e.page AS pagina
             FROM events e
             INNER JOIN visits v ON v.id = e.visit_id
             WHERE ' . $where . '
             ORDER BY e.page ASC
             LIMIT 100',
            $params
        )->fetchAll();
        $pages = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $page = (string) ($row['pagina'] ?? '');

            if ($page !== '') {
                $pages[] = $page;
            }
        }

        return $pages;
    }

    /**
     * @param Filters $filters
     * @return list<array<string,mixed>>
     */
    public function clickRows(array $filters, string $type): array
    {
        [$where, $params] = $this->visitSql($filters, true);
        $sql = "SELECT e.id, e.type, e.page, e.created_at
                FROM events e
                INNER JOIN visits v ON v.id = e.visit_id AND e.site_id = v.site_id
                WHERE {$where} AND e.type IN ('click_whatsapp', 'click_llamada')";

        if ($type !== '') {
            $sql .= ' AND e.type = ?';
            $params[] = [$type, PDO::PARAM_STR];
        }

        if ($filters['pagina'] !== '') {
            $sql .= ' AND e.page = ?';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        $sql .= ' ORDER BY e.created_at DESC, e.id DESC LIMIT 200';
        $rows = $this->run($sql, $params)->fetchAll();

        return is_array($rows) ? $rows : [];
    }

    /**
     * @param Filters $filters
     * @return list<array<string,mixed>>
     */
    public function pageRows(array $filters): array
    {
        [$where, $params] = $this->visitSql($filters, false);
        $sql = "SELECT e.page AS pagina,
                COUNT(DISTINCT CASE WHEN e.type = 'page_view' THEN e.visit_id END) AS visitas,
                SUM(CASE WHEN e.type = 'click_whatsapp' THEN 1 ELSE 0 END) AS clics_whatsapp,
                SUM(CASE WHEN e.type = 'click_llamada' THEN 1 ELSE 0 END) AS clics_llamada,
                SUM(CASE WHEN e.type = 'envio_formulario' THEN 1 ELSE 0 END) AS formularios,
                COUNT(DISTINCT CASE WHEN e.type = 'page_view' AND v.source = 'google_ads' THEN e.visit_id END) AS visitas_google_ads,
                COUNT(DISTINCT CASE WHEN e.type IN ('click_whatsapp', 'click_llamada') THEN e.visit_id END) AS con_clic
            FROM events e
            INNER JOIN visits v ON v.id = e.visit_id
            WHERE {$where}";

        if ($filters['pagina'] !== '') {
            $sql .= ' AND e.page = ?';
            $params[] = [$filters['pagina'], PDO::PARAM_STR];
        }

        $sql .= ' GROUP BY e.page ORDER BY visitas DESC, pagina ASC LIMIT 100';
        $rows = $this->run($sql, $params)->fetchAll();

        return is_array($rows) ? $rows : [];
    }

    /**
     * @param Filters $filters
     * @return list<array<string,mixed>>
     */
    public function referralRows(array $filters): array
    {
        [$where, $params] = $this->visitSql($filters, false);
        $sql = "SELECT COALESCE(NULLIF(v.utm_source, ''), 'Sin nombre') AS origen,
                COUNT(DISTINCT v.id) AS visitas,
                COUNT(DISTINCT CASE WHEN e.type IN ('click_whatsapp', 'click_llamada') THEN v.id END) AS con_clic
            FROM visits v
            LEFT JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id
            WHERE {$where} AND v.source = 'referido'
            GROUP BY COALESCE(NULLIF(v.utm_source, ''), 'Sin nombre')
            ORDER BY visitas DESC
            LIMIT 40";
        $rows = $this->run($sql, $params)->fetchAll();

        return is_array($rows) ? $rows : [];
    }

    /**
     * @param Filters $filters
     */
    public function visitTotal(array $filters): int
    {
        [$where, $params] = $this->visitSql($filters, true);

        return (int) $this->run('SELECT COUNT(*) FROM visits v WHERE ' . $where, $params)->fetchColumn();
    }

    /**
     * @param Filters $filters
     * @return list<array<string,mixed>>
     */
    public function visitRows(array $filters, int $limit, int $offset): array
    {
        [$where, $params] = $this->visitSql($filters, true);
        $sections = self::SECTION_LIST;
        $sql = "SELECT v.id, v.started_at, v.source, v.device, v.landing_page,
                (SELECT e.section
                   FROM events e
                  WHERE e.visit_id = v.id
                    AND e.type = 'section_view'
                    AND e.section IN ({$sections})
                  ORDER BY FIELD(e.section, {$sections}) DESC, e.id DESC
                  LIMIT 1) AS seccion,
                EXISTS(
                    SELECT 1 FROM events e
                    WHERE e.visit_id = v.id AND e.type IN ('click_whatsapp', 'click_llamada')
                ) AS clic
            FROM visits v
            WHERE {$where}
            ORDER BY v.started_at DESC, v.id DESC
            LIMIT {$limit} OFFSET {$offset}";
        $rows = $this->run($sql, $params)->fetchAll();

        return is_array($rows) ? $rows : [];
    }

    /**
     * @return array<string,mixed>|null
     */
    public function findVisit(int $visitId, int $siteId): ?array
    {
        $visit = $this->run(
            'SELECT id, started_at, source, device, landing_page
             FROM visits
             WHERE id = ? AND site_id = ?
             LIMIT 1',
            [
                [$visitId, PDO::PARAM_INT],
                [$siteId, PDO::PARAM_INT],
            ]
        )->fetch();

        return is_array($visit) ? $visit : null;
    }

    /**
     * @return list<array<string,mixed>>
     */
    public function visitEvents(int $visitId, int $siteId): array
    {
        $events = $this->run(
            'SELECT type, page, section, meta, created_at
             FROM events
             WHERE visit_id = ? AND site_id = ?
             ORDER BY created_at ASC, id ASC',
            [
                [$visitId, PDO::PARAM_INT],
                [$siteId, PDO::PARAM_INT],
            ]
        )->fetchAll();

        return is_array($events) ? $events : [];
    }
}
