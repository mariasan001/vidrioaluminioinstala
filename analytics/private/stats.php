<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/auth.php';

const AVI_STATS_SECTIONS = [
    'hero' => 'Inicio',
    'usos' => 'Usos',
    'ventajas' => 'Ventajas',
    'tipos' => 'Tipos',
    'confianza' => 'Confianza',
    'trabajos' => 'Trabajos',
    'preguntas' => 'Preguntas',
    'contacto' => 'Contacto',
];

function avi_stats_resumen(): void
{
    try {
        $filters = avi_stats_guard();
        $visitas = avi_stats_count_visits($filters);
        $ads = $filters;
        $ads['ads'] = true;
        $conClic = avi_stats_count_contact_visits($filters);
        avi_stats_ok($filters, [
            'visitas' => $visitas,
            'visitas_google_ads' => avi_stats_count_visits($ads),
            'clics_whatsapp' => avi_stats_count_events($filters, 'click_whatsapp'),
            'clics_llamada' => avi_stats_count_events($filters, 'click_llamada'),
            'formularios' => avi_stats_count_events($filters, 'envio_formulario'),
            'tasa_contacto' => avi_stats_rate($conClic, $visitas),
            'por_dia' => avi_stats_daily($filters),
        ]);
    } catch (Throwable $error) {
        avi_log('stats_resumen ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_stats_paginas(): void
{
    try {
        $filters = avi_stats_guard();
        [$where, $params] = avi_stats_visit_sql($filters, false);
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
        $rows = avi_stats_run($sql, $params)->fetchAll();
        $paginas = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $visitas = (int) ($row['visitas'] ?? 0);
            $page = (string) ($row['pagina'] ?? '');
            $whatsapp = (int) ($row['clics_whatsapp'] ?? 0);
            $calls = (int) ($row['clics_llamada'] ?? 0);
            $paginas[] = [
                'pagina' => $page,
                'etiqueta' => avi_stats_page_label($page),
                'visitas' => $visitas,
                'visitas_google_ads' => (int) ($row['visitas_google_ads'] ?? 0),
                'clics_whatsapp' => $whatsapp,
                'clics_llamada' => $calls,
                'clics' => $whatsapp + $calls,
                'formularios' => (int) ($row['formularios'] ?? 0),
                'tasa_contacto' => avi_stats_rate((int) ($row['con_clic'] ?? 0), $visitas),
            ];
        }

        avi_stats_ok($filters, ['paginas' => $paginas]);
    } catch (Throwable $error) {
        avi_log('stats_paginas ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_stats_embudo(): void
{
    try {
        $filters = avi_stats_guard();

        if ($filters['pagina'] === '') {
            avi_stats_ok($filters, ['pasos' => []]);
            return;
        }

        $pasos = [];

        foreach (AVI_STATS_SECTIONS as $section => $label) {
            $pasos[] = [
                'seccion' => $section,
                'etiqueta' => $label,
                'visitas' => avi_stats_section_visits($filters, $section),
            ];
        }

        $pasos[] = [
            'seccion' => 'clic',
            'etiqueta' => 'Clic',
            'visitas' => avi_stats_count_contact_visits($filters),
        ];
        avi_stats_ok($filters, [
            'pagina' => $filters['pagina'],
            'pagina_etiqueta' => avi_stats_page_label($filters['pagina']),
            'pasos' => $pasos,
        ]);
    } catch (Throwable $error) {
        avi_log('stats_embudo ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_stats_referidos(): void
{
    try {
        $filters = avi_stats_guard();
        $filters['ads'] = false;
        [$where, $params] = avi_stats_visit_sql($filters, false);
        $sql = "SELECT COALESCE(NULLIF(v.utm_source, ''), 'Sin nombre') AS origen,
                COUNT(DISTINCT v.id) AS visitas,
                COUNT(DISTINCT CASE WHEN e.type IN ('click_whatsapp', 'click_llamada') THEN v.id END) AS con_clic
            FROM visits v
            LEFT JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id
            WHERE {$where} AND v.source = 'referido'
            GROUP BY COALESCE(NULLIF(v.utm_source, ''), 'Sin nombre')
            ORDER BY visitas DESC
            LIMIT 40";
        $rows = avi_stats_run($sql, $params)->fetchAll();
        $referidos = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $visitas = (int) ($row['visitas'] ?? 0);
            $referidos[] = [
                'origen' => (string) ($row['origen'] ?? ''),
                'visitas' => $visitas,
                'con_clic' => (int) ($row['con_clic'] ?? 0),
                'tasa_contacto' => avi_stats_rate((int) ($row['con_clic'] ?? 0), $visitas),
            ];
        }

        avi_stats_ok($filters, ['referidos' => $referidos]);
    } catch (Throwable $error) {
        avi_log('stats_referidos ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_stats_visitas(): void
{
    try {
        $filters = avi_stats_guard();
        $page = avi_stats_list_page();
        $limit = 20;
        $offset = ($page - 1) * $limit;
        [$where, $params] = avi_stats_visit_sql($filters, true);
        $total = (int) avi_stats_run('SELECT COUNT(*) FROM visits v WHERE ' . $where, $params)->fetchColumn();
        $sql = "SELECT v.id, v.started_at, v.source, v.device, v.landing_page,
                (SELECT e.section
                   FROM events e
                  WHERE e.visit_id = v.id
                    AND e.type = 'section_view'
                    AND e.section IN ('hero','usos','ventajas','tipos','confianza','trabajos','preguntas','contacto')
                  ORDER BY FIELD(e.section, 'hero','usos','ventajas','tipos','confianza','trabajos','preguntas','contacto') DESC, e.id DESC
                  LIMIT 1) AS seccion,
                EXISTS(
                    SELECT 1 FROM events e
                    WHERE e.visit_id = v.id AND e.type IN ('click_whatsapp', 'click_llamada')
                ) AS clic
            FROM visits v
            WHERE {$where}
            ORDER BY v.started_at DESC, v.id DESC
            LIMIT {$limit} OFFSET {$offset}";
        $rows = avi_stats_run($sql, $params)->fetchAll();
        $visitas = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            $section = is_string($row['seccion'] ?? null) ? $row['seccion'] : '';
            $source = (string) ($row['source'] ?? '');
            $device = (string) ($row['device'] ?? '');
            $landing = (string) ($row['landing_page'] ?? '');
            $visitas[] = [
                'id' => (int) ($row['id'] ?? 0),
                'fecha' => (string) ($row['started_at'] ?? ''),
                'hora' => avi_stats_hour((string) ($row['started_at'] ?? '')),
                'fuente' => $source,
                'fuente_etiqueta' => avi_stats_source_label($source),
                'dispositivo' => $device,
                'dispositivo_etiqueta' => avi_stats_device_label($device),
                'entrada' => $landing,
                'entrada_etiqueta' => avi_stats_page_label($landing),
                'seccion' => $section,
                'seccion_etiqueta' => $section === '' ? '' : avi_stats_section_label($section),
                'clic' => (int) ($row['clic'] ?? 0) === 1,
            ];
        }

        avi_stats_ok($filters, [
            'total' => $total,
            'pagina_lista' => $page,
            'paginas_lista' => max(1, (int) ceil($total / $limit)),
            'visitas' => $visitas,
        ]);
    } catch (Throwable $error) {
        avi_log('stats_visitas ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_stats_visita(): void
{
    try {
        $filters = avi_stats_guard();
        $id = $_GET['id'] ?? '';

        if (!is_string($id) || !ctype_digit($id) || (int) $id < 1) {
            avi_json(400);
        }

        $visitId = (int) $id;
        $visit = avi_stats_run(
            'SELECT id, started_at, source, device, landing_page
             FROM visits
             WHERE id = ? AND site_id = ?
             LIMIT 1',
            [
                [$visitId, PDO::PARAM_INT],
                [$filters['site_id'], PDO::PARAM_INT],
            ]
        )->fetch();

        if (!is_array($visit)) {
            avi_json(404);
        }

        $events = avi_stats_run(
            'SELECT type, page, section, meta, created_at
             FROM events
             WHERE visit_id = ? AND site_id = ?
             ORDER BY created_at ASC, id ASC',
            [
                [$visitId, PDO::PARAM_INT],
                [$filters['site_id'], PDO::PARAM_INT],
            ]
        )->fetchAll();
        $timeline = [];

        foreach (is_array($events) ? $events : [] as $event) {
            $type = (string) ($event['type'] ?? '');
            $section = is_string($event['section'] ?? null) ? $event['section'] : '';
            $page = (string) ($event['page'] ?? '');
            $when = (string) ($event['created_at'] ?? '');
            $timeline[] = [
                'tipo' => $type,
                'tipo_etiqueta' => avi_stats_type_label($type),
                'pagina' => $page,
                'pagina_etiqueta' => avi_stats_page_label($page),
                'seccion' => $section,
                'seccion_etiqueta' => $section === '' ? '' : avi_stats_section_label($section),
                'producto' => avi_stats_product(is_string($event['meta'] ?? null) ? $event['meta'] : ''),
                'fecha' => $when,
                'hora' => avi_stats_hour($when),
            ];
        }

        $source = (string) ($visit['source'] ?? '');
        $device = (string) ($visit['device'] ?? '');
        avi_stats_ok($filters, [
            'visita' => [
                'id' => (int) $visit['id'],
                'fecha' => (string) ($visit['started_at'] ?? ''),
                'fuente' => $source,
                'fuente_etiqueta' => avi_stats_source_label($source),
                'dispositivo' => $device,
                'dispositivo_etiqueta' => avi_stats_device_label($device),
                'pagina' => (string) ($visit['landing_page'] ?? ''),
                'pagina_etiqueta' => avi_stats_page_label((string) ($visit['landing_page'] ?? '')),
                'hora' => avi_stats_hour((string) ($visit['started_at'] ?? '')),
            ],
            'eventos' => $timeline,
        ]);
    } catch (Throwable $error) {
        avi_log('stats_visita ' . $error->getMessage());
        avi_json(500);
    }
}

/**
 * @return array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool}
 */
function avi_stats_guard(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
        avi_json(405);
    }

    avi_session_start();

    if (avi_user_id() === null) {
        avi_json(401);
    }

    return avi_stats_filters();
}

/**
 * @return array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool}
 */
function avi_stats_filters(): array
{
    avi_config();
    $today = new DateTimeImmutable('today');
    $desdeRaw = $_GET['desde'] ?? '';
    $hastaRaw = $_GET['hasta'] ?? '';
    $desdeRaw = is_string($desdeRaw) ? $desdeRaw : '';
    $hastaRaw = is_string($hastaRaw) ? $hastaRaw : '';

    if ($desdeRaw === '' && $hastaRaw === '') {
        $desde = $today->modify('-29 days');
        $hasta = $today;
    } else {
        $desde = avi_stats_day($desdeRaw);
        $hasta = avi_stats_day($hastaRaw);

        if ($desde === null || $hasta === null || $desde > $hasta || $hasta > $today) {
            avi_json(400);
        }

        if ($desde->diff($hasta)->days === false || $desde->diff($hasta)->days > 400) {
            avi_json(400);
        }
    }

    $page = $_GET['pagina'] ?? '';
    $page = is_string($page) ? $page : '';

    if ($page !== '' && (!preg_match('#^/[a-z0-9/_-]*$#', $page) || strlen($page) > 200)) {
        avi_json(400);
    }

    $source = $_GET['fuente'] ?? 'todas';
    $source = is_string($source) ? strtolower(trim($source)) : '';

    if (!in_array($source, ['', 'todas', 'google_ads'], true)) {
        avi_json(400);
    }

    $next = $hasta->modify('+1 day');

    return [
        'site_id' => avi_stats_site_id(),
        'desde' => $desde->format('Y-m-d'),
        'hasta' => $hasta->format('Y-m-d'),
        'desde_dt' => $desde->format('Y-m-d') . ' 00:00:00',
        'hasta_dt' => $next->format('Y-m-d') . ' 00:00:00',
        'pagina' => $page,
        'ads' => $source === 'google_ads',
    ];
}

function avi_stats_day(string $value): ?DateTimeImmutable
{
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

    if (!$date instanceof DateTimeImmutable || $date->format('Y-m-d') !== $value) {
        return null;
    }

    $errors = DateTimeImmutable::getLastErrors();

    if ($errors !== false && (($errors['warning_count'] ?? 0) > 0 || ($errors['error_count'] ?? 0) > 0)) {
        return null;
    }

    return $date;
}

function avi_stats_site_id(): int
{
    $statement = avi_pdo()->prepare('SELECT id FROM sites WHERE dominio = ? LIMIT 1');
    $statement->execute(['aluminioyvidrioinstala.mx']);
    $id = $statement->fetchColumn();

    return $id === false ? 0 : (int) $id;
}

function avi_stats_list_page(): int
{
    $page = $_GET['p'] ?? '1';
    $page = is_string($page) ? $page : '';

    if (!ctype_digit($page) || (int) $page < 1 || (int) $page > 200) {
        avi_json(400);
    }

    return (int) $page;
}

/**
 * @param list<array{0:mixed,1:int}> $params
 */
function avi_stats_run(string $sql, array $params): PDOStatement
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
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 * @return array{0:string,1:list<array{0:mixed,1:int}>}
 */
function avi_stats_visit_sql(array $filters, bool $withPage): array
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
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 */
function avi_stats_count_visits(array $filters): int
{
    [$where, $params] = avi_stats_visit_sql($filters, true);

    return (int) avi_stats_run('SELECT COUNT(*) FROM visits v WHERE ' . $where, $params)->fetchColumn();
}

/**
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 */
function avi_stats_count_events(array $filters, string $type): int
{
    [$where, $params] = avi_stats_visit_sql($filters, true);
    $sql = 'SELECT COUNT(*) FROM events e INNER JOIN visits v ON v.id = e.visit_id AND e.site_id = v.site_id WHERE '
        . $where . ' AND e.type = ?';
    $params[] = [$type, PDO::PARAM_STR];

    if ($filters['pagina'] !== '') {
        $sql .= ' AND e.page = ?';
        $params[] = [$filters['pagina'], PDO::PARAM_STR];
    }

    return (int) avi_stats_run($sql, $params)->fetchColumn();
}

/**
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 */
function avi_stats_count_contact_visits(array $filters): int
{
    [$where, $params] = avi_stats_visit_sql($filters, true);
    $sql = "SELECT COUNT(DISTINCT v.id) FROM visits v INNER JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id WHERE {$where} AND e.type IN ('click_whatsapp', 'click_llamada')";

    if ($filters['pagina'] !== '') {
        $sql .= ' AND e.page = ?';
        $params[] = [$filters['pagina'], PDO::PARAM_STR];
    }

    return (int) avi_stats_run($sql, $params)->fetchColumn();
}

/**
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 */
function avi_stats_section_visits(array $filters, string $section): int
{
    [$where, $params] = avi_stats_visit_sql($filters, true);
    $sql = "SELECT COUNT(DISTINCT v.id) FROM visits v INNER JOIN events e ON e.visit_id = v.id AND e.site_id = v.site_id WHERE {$where} AND e.type = 'section_view' AND e.section = ?";
    $params[] = [$section, PDO::PARAM_STR];

    if ($filters['pagina'] !== '') {
        $sql .= ' AND e.page = ?';
        $params[] = [$filters['pagina'], PDO::PARAM_STR];
    }

    return (int) avi_stats_run($sql, $params)->fetchColumn();
}

/**
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 * @return list<array{fecha:string,visitas:int}>
 */
function avi_stats_daily(array $filters): array
{
    [$where, $params] = avi_stats_visit_sql($filters, true);
    $rows = avi_stats_run(
        'SELECT DATE(v.started_at) AS dia, COUNT(*) AS total FROM visits v WHERE ' . $where . ' GROUP BY DATE(v.started_at)',
        $params
    )->fetchAll();
    $hourRows = avi_stats_run(
        "SELECT DATE(v.started_at) AS dia, DATE_FORMAT(v.started_at, '%H:00') AS hora, COUNT(*) AS total
         FROM visits v WHERE {$where}
         GROUP BY DATE(v.started_at), DATE_FORMAT(v.started_at, '%H:00')
         ORDER BY dia, hora",
        $params
    )->fetchAll();
    $counts = [];
    $hours = [];

    foreach (is_array($rows) ? $rows : [] as $row) {
        $counts[(string) ($row['dia'] ?? '')] = (int) ($row['total'] ?? 0);
    }

    foreach (is_array($hourRows) ? $hourRows : [] as $row) {
        $day = (string) ($row['dia'] ?? '');
        $hours[$day][] = [
            'hora' => (string) ($row['hora'] ?? ''),
            'visitas' => (int) ($row['total'] ?? 0),
        ];
    }

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

/**
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 * @return list<string>
 */
function avi_stats_options(array $filters): array
{
    $open = $filters;
    $open['pagina'] = '';
    [$where, $params] = avi_stats_visit_sql($open, false);
    $rows = avi_stats_run(
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
 * @param array{site_id:int,desde:string,hasta:string,desde_dt:string,hasta_dt:string,pagina:string,ads:bool} $filters
 * @param array<string, mixed> $data
 */
function avi_stats_ok(array $filters, array $data): void
{
    avi_json(200, array_merge([
        'ok' => true,
        'desde' => $filters['desde'],
        'hasta' => $filters['hasta'],
        'opciones' => avi_stats_options($filters),
    ], $data));
}

function avi_stats_rate(int $part, int $total): float
{
    if ($total < 1) {
        return 0.0;
    }

    return round($part * 100 / $total, 1);
}

function avi_stats_source_label(string $source): string
{
    return [
        'google_ads' => 'Google Ads',
        'organico' => 'Orgánico',
        'directo' => 'Directo',
        'referido' => 'Referido',
        'otro' => 'Otro',
    ][$source] ?? $source;
}

function avi_stats_device_label(string $device): string
{
    return [
        'movil' => 'Móvil',
        'escritorio' => 'Escritorio',
        'tablet' => 'Tablet',
    ][$device] ?? $device;
}

function avi_stats_section_label(string $section): string
{
    return AVI_STATS_SECTIONS[$section] ?? $section;
}

function avi_stats_page_label(string $page): string
{
    $path = $page === '/' ? '/' : rtrim($page, '/');

    return [
        '/' => 'Inicio',
        '/servicios/canceles-de-bano' => 'Canceles',
        '/servicios/ventanas' => 'Ventanas',
        '/barandales' => 'Barandales',
        '/servicios/barandales' => 'Barandales',
        '/servicios/fachadas-de-cristal' => 'Fachadas',
        '/servicios/puertas' => 'Puertas',
        '/servicios/pergolas' => 'Pérgolas',
        '/aviso-de-privacidad' => 'Aviso de privacidad',
    ][$path] ?? $page;
}

function avi_stats_hour(string $value): string
{
    if (preg_match('/(\d{2}:\d{2})/', $value, $match) === 1) {
        return $match[1];
    }

    return '';
}

function avi_stats_type_label(string $type): string
{
    return [
        'page_view' => 'Vio la página',
        'section_view' => 'Vio la sección',
        'click_whatsapp' => 'Clic en WhatsApp',
        'click_llamada' => 'Clic en llamar',
        'envio_formulario' => 'Envió el formulario',
    ][$type] ?? $type;
}

function avi_stats_product(string $meta): string
{
    if ($meta === '') {
        return '';
    }

    $decoded = json_decode($meta, true);

    if (!is_array($decoded) || !is_string($decoded['tipo'] ?? null)) {
        return '';
    }

    return $decoded['tipo'];
}
