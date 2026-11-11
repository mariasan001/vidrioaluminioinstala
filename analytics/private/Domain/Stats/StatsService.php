<?php

declare(strict_types=1);

namespace Avi\Domain\Stats;

use DateTimeImmutable;

/**
 * Stats use-cases. Return data arrays (the controller wraps them in the HTTP envelope).
 *
 * @phpstan-type Filters array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool}
 */
final class StatsService
{
    private const VISITS_PER_PAGE = 20;

    public function __construct(private readonly StatsRepository $repository)
    {
    }

    public static function rate(int $part, int $total): float
    {
        if ($total < 1) {
            return 0.0;
        }

        return round($part * 100 / $total, 1);
    }

    /**
     * @param Filters $filters
     * @return list<string>
     */
    public function options(array $filters): array
    {
        return $this->repository->pageOptions($filters);
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function resumen(array $filters): array
    {
        $visitas = $this->repository->countVisits($filters);
        $ads = $filters;
        $ads['ads'] = true;
        $conClic = $this->repository->countContactVisits($filters);

        return [
            'visitas' => $visitas,
            'visitas_google_ads' => $this->repository->countVisits($ads),
            'clics_whatsapp' => $this->repository->countEvents($filters, 'click_whatsapp'),
            'clics_llamada' => $this->repository->countEvents($filters, 'click_llamada'),
            'formularios' => $this->repository->countEvents($filters, 'envio_formulario'),
            'tasa_contacto' => self::rate($conClic, $visitas),
            'por_dia' => $this->daily($filters),
        ];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function clics(array $filters, string $canal): array
    {
        $canal = strtolower(trim($canal));
        $type = $canal === 'llamada' ? 'click_llamada' : ($canal === 'whatsapp' ? 'click_whatsapp' : '');
        $clics = [];

        foreach ($this->repository->clickRows($filters, $type) as $row) {
            $eventType = (string) ($row['type'] ?? '');
            $when = (string) ($row['created_at'] ?? '');
            $page = (string) ($row['page'] ?? '');
            $clics[] = [
                'id' => (string) ((int) ($row['id'] ?? 0)),
                'canal' => $eventType === 'click_llamada' ? 'llamada' : 'whatsapp',
                'pagina' => $page,
                'pagina_etiqueta' => StatsLabels::page($page),
                'fecha' => substr($when, 0, 10),
                'hora' => StatsLabels::hour($when),
                'cuando' => $when,
            ];
        }

        return ['clics' => $clics];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function paginas(array $filters): array
    {
        $paginas = [];

        foreach ($this->repository->pageRows($filters) as $row) {
            $visitas = (int) ($row['visitas'] ?? 0);
            $page = (string) ($row['pagina'] ?? '');
            $whatsapp = (int) ($row['clics_whatsapp'] ?? 0);
            $calls = (int) ($row['clics_llamada'] ?? 0);
            $paginas[] = [
                'pagina' => $page,
                'etiqueta' => StatsLabels::page($page),
                'visitas' => $visitas,
                'visitas_google_ads' => (int) ($row['visitas_google_ads'] ?? 0),
                'clics_whatsapp' => $whatsapp,
                'clics_llamada' => $calls,
                'clics' => $whatsapp + $calls,
                'formularios' => (int) ($row['formularios'] ?? 0),
                'tasa_contacto' => self::rate((int) ($row['con_clic'] ?? 0), $visitas),
            ];
        }

        return ['paginas' => $paginas];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function embudo(array $filters): array
    {
        if ($filters['pagina'] === '') {
            return ['pasos' => []];
        }

        $pasos = [];

        foreach (StatsLabels::SECTIONS as $section => $label) {
            $pasos[] = [
                'seccion' => $section,
                'etiqueta' => $label,
                'visitas' => $this->repository->sectionVisits($filters, $section),
            ];
        }

        $pasos[] = [
            'seccion' => 'clic',
            'etiqueta' => 'Clic',
            'visitas' => $this->repository->countContactVisits($filters),
        ];

        return [
            'pagina' => $filters['pagina'],
            'pagina_etiqueta' => StatsLabels::page($filters['pagina']),
            'pasos' => $pasos,
        ];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function referidos(array $filters): array
    {
        $referidos = [];

        foreach ($this->repository->referralRows($filters) as $row) {
            $visitas = (int) ($row['visitas'] ?? 0);
            $referidos[] = [
                'origen' => (string) ($row['origen'] ?? ''),
                'visitas' => $visitas,
                'con_clic' => (int) ($row['con_clic'] ?? 0),
                'tasa_contacto' => self::rate((int) ($row['con_clic'] ?? 0), $visitas),
            ];
        }

        return ['referidos' => $referidos];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>
     */
    public function visitas(array $filters, int $page): array
    {
        $limit = self::VISITS_PER_PAGE;
        $offset = ($page - 1) * $limit;
        $total = $this->repository->visitTotal($filters);
        $visitas = [];

        foreach ($this->repository->visitRows($filters, $limit, $offset) as $row) {
            $section = is_string($row['seccion'] ?? null) ? $row['seccion'] : '';
            $source = (string) ($row['source'] ?? '');
            $device = (string) ($row['device'] ?? '');
            $landing = (string) ($row['landing_page'] ?? '');
            $visitas[] = [
                'id' => (int) ($row['id'] ?? 0),
                'fecha' => (string) ($row['started_at'] ?? ''),
                'hora' => StatsLabels::hour((string) ($row['started_at'] ?? '')),
                'fuente' => $source,
                'fuente_etiqueta' => StatsLabels::source($source),
                'dispositivo' => $device,
                'dispositivo_etiqueta' => StatsLabels::device($device),
                'entrada' => $landing,
                'entrada_etiqueta' => StatsLabels::page($landing),
                'seccion' => $section,
                'seccion_etiqueta' => $section === '' ? '' : StatsLabels::section($section),
                'clic' => (int) ($row['clic'] ?? 0) === 1,
            ];
        }

        return [
            'total' => $total,
            'pagina_lista' => $page,
            'paginas_lista' => max(1, (int) ceil($total / $limit)),
            'visitas' => $visitas,
        ];
    }

    /**
     * @param Filters $filters
     * @return array<string,mixed>|null null when the visit does not exist for the site
     */
    public function visita(array $filters, int $visitId): ?array
    {
        $visit = $this->repository->findVisit($visitId, $filters['site_id']);

        if ($visit === null) {
            return null;
        }

        $timeline = [];

        foreach ($this->repository->visitEvents($visitId, $filters['site_id']) as $event) {
            $type = (string) ($event['type'] ?? '');
            $section = is_string($event['section'] ?? null) ? $event['section'] : '';
            $page = (string) ($event['page'] ?? '');
            $when = (string) ($event['created_at'] ?? '');
            $timeline[] = [
                'tipo' => $type,
                'tipo_etiqueta' => StatsLabels::type($type),
                'pagina' => $page,
                'pagina_etiqueta' => StatsLabels::page($page),
                'seccion' => $section,
                'seccion_etiqueta' => $section === '' ? '' : StatsLabels::section($section),
                'producto' => StatsLabels::product(is_string($event['meta'] ?? null) ? $event['meta'] : ''),
                'fecha' => $when,
                'hora' => StatsLabels::hour($when),
            ];
        }

        $source = (string) ($visit['source'] ?? '');
        $device = (string) ($visit['device'] ?? '');

        return [
            'visita' => [
                'id' => (int) $visit['id'],
                'fecha' => (string) ($visit['started_at'] ?? ''),
                'fuente' => $source,
                'fuente_etiqueta' => StatsLabels::source($source),
                'dispositivo' => $device,
                'dispositivo_etiqueta' => StatsLabels::device($device),
                'pagina' => (string) ($visit['landing_page'] ?? ''),
                'pagina_etiqueta' => StatsLabels::page((string) ($visit['landing_page'] ?? '')),
                'hora' => StatsLabels::hour((string) ($visit['started_at'] ?? '')),
            ],
            'eventos' => $timeline,
        ];
    }

    /**
     * @param Filters $filters
     * @return list<array{fecha:string,visitas:int,horas:list<array{hora:string,visitas:int}>}>
     */
    private function daily(array $filters): array
    {
        $counts = $this->repository->dailyCounts($filters);
        $hours = $this->repository->dailyHours($filters);
        $cursor = new DateTimeImmutable($filters['desde']);
        $end = new DateTimeImmutable($filters['hasta']);
        $days = [];

        while ($cursor <= $end) {
            $key = $cursor->format('Y-m-d');
            $days[] = [
                'fecha' => $key,
                'visitas' => $counts[$key] ?? 0,
                'horas' => $hours[$key] ?? [],
            ];
            $cursor = $cursor->modify('+1 day');
        }

        return $days;
    }
}
