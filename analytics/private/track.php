<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const AVI_EVENT_TYPES = [
    'page_view',
    'section_view',
    'click_whatsapp',
    'click_llamada',
    'envio_formulario',
];

const AVI_SECTIONS = [
    'hero',
    'usos',
    'ventajas',
    'tipos',
    'confianza',
    'trabajos',
    'preguntas',
    'contacto',
    'sticky',
    'footer',
];

const AVI_SOURCES = ['google_ads', 'organico', 'directo', 'referido', 'otro'];

const AVI_DEVICES = ['movil', 'escritorio', 'tablet'];

function avi_handle_track(): void
{
    try {
        avi_track();
    } catch (Throwable $error) {
        avi_log('track_exception ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_track(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        avi_json(405);
    }

    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);

    if ($length > 4096) {
        avi_json(413);
    }

    $host = avi_request_host();

    if ($host === null || !avi_host_allowed($host)) {
        avi_fail(403, 'track_origin');
    }

    if (avi_is_bot((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''))) {
        avi_fail(403, 'track_bot');
    }

    $ip = avi_client_ip();

    if ($ip === '') {
        avi_fail(403, 'track_ip');
    }

    $ipHash = avi_ip_hash($ip);

    if (avi_rate_limited($ipHash)) {
        avi_fail(429, 'track_rate');
    }

    $body = file_get_contents('php://input');

    if ($body === false || strlen($body) > 4096) {
        avi_json(413);
    }

    $payload = json_decode($body, true);

    if (!is_array($payload)) {
        avi_json(400);
    }

    $event = avi_event($payload);

    if ($event === null) {
        avi_json(400);
    }

    $siteId = avi_site_id(avi_canonical_host($host));

    if ($siteId === null) {
        avi_fail(403, 'track_site');
    }

    avi_store($siteId, $ipHash, $event);
    avi_json(200, ['ok' => true]);
}

function avi_request_host(): ?string
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
    $candidate = $origin !== '' ? $origin : $referer;

    if ($candidate === '') {
        return null;
    }

    $scheme = parse_url($candidate, PHP_URL_SCHEME);
    $host = parse_url($candidate, PHP_URL_HOST);

    if (!is_string($scheme) || !is_string($host) || $host === '') {
        return null;
    }

    $requireHttps = (bool) avi_config()['require_https'];

    if ($requireHttps && strtolower($scheme) !== 'https') {
        return null;
    }

    if (!in_array(strtolower($scheme), ['https', 'http'], true)) {
        return null;
    }

    return strtolower($host);
}

function avi_host_allowed(string $host): bool
{
    $allowed = avi_config()['allowed_domains'];

    foreach ($allowed as $domain) {
        if (is_string($domain) && strtolower($domain) === $host) {
            return true;
        }
    }

    return false;
}

function avi_canonical_host(string $host): string
{
    return str_starts_with($host, 'www.') ? substr($host, 4) : $host;
}

function avi_is_bot(string $userAgent): bool
{
    $agent = strtolower(trim($userAgent));

    if ($agent === '' || strlen($agent) > 400) {
        return true;
    }

    $needles = [
        'bot',
        'spider',
        'crawl',
        'slurp',
        'archiver',
        'wget',
        'curl',
        'python-requests',
        'httpclient',
        'headless',
        'phantom',
        'semrush',
        'ahrefs',
        'mj12',
        'dotbot',
        'petalbot',
        'bytespider',
        'gptbot',
        'claudebot',
        'amazonbot',
        'bingpreview',
        'facebookexternalhit',
    ];

    foreach ($needles as $needle) {
        if (str_contains($agent, $needle)) {
            return true;
        }
    }

    return false;
}

function avi_rate_limited(string $ipHash): bool
{
    $directory = (string) avi_config()['rate_path'];

    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        avi_log('track_rate_dir');

        return true;
    }

    $path = $directory . '/' . $ipHash;
    $handle = fopen($path, 'c+');

    if ($handle === false) {
        avi_log('track_rate_file');

        return true;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return true;
        }

        $raw = stream_get_contents($handle);
        $now = time();
        $data = is_string($raw) ? json_decode($raw, true) : null;
        $window = is_array($data) ? (int) ($data['t'] ?? 0) : 0;
        $count = is_array($data) ? (int) ($data['n'] ?? 0) : 0;

        if ($now - $window >= 60) {
            $window = $now;
            $count = 0;
        }

        $count++;
        $blocked = $count > 120;
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode(['t' => $window, 'n' => $count]));
        fflush($handle);

        return $blocked;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/**
 * @param array<string, mixed> $payload
 * @return array<string, mixed>|null
 */
function avi_event(array $payload): ?array
{
    $visitorId = strtolower(trim((string) ($payload['visitor_id'] ?? '')));

    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $visitorId)) {
        return null;
    }

    $type = (string) ($payload['type'] ?? '');

    if (!in_array($type, AVI_EVENT_TYPES, true)) {
        return null;
    }

    $page = avi_page($payload['page'] ?? null);

    if ($page === null) {
        return null;
    }

    $section = avi_section($payload['section'] ?? null);

    if ($type === 'section_view' && $section === null) {
        return null;
    }

    if (array_key_exists('section', $payload) && $payload['section'] !== null && $payload['section'] !== '' && $section === null) {
        return null;
    }

    $device = (string) ($payload['device'] ?? '');

    if (!in_array($device, AVI_DEVICES, true)) {
        return null;
    }

    $source = (string) ($payload['source'] ?? '');

    if ($source !== '' && !in_array($source, AVI_SOURCES, true)) {
        return null;
    }

    return [
        'visitor_id' => $visitorId,
        'type' => $type,
        'page' => $page,
        'section' => $section,
        'device' => $device,
        'source' => $source,
        'utm_source' => avi_utm($payload['utm_source'] ?? null),
        'utm_medium' => avi_utm($payload['utm_medium'] ?? null),
        'utm_campaign' => avi_utm($payload['utm_campaign'] ?? null),
        'gclid' => avi_gclid($payload),
        'meta' => avi_meta($payload['meta'] ?? null),
    ];
}

function avi_page(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $page = rawurldecode(trim($value));
    $page = explode('?', $page, 2)[0];
    $page = explode('#', $page, 2)[0];

    if ($page === '') {
        $page = '/';
    }

    if (!str_starts_with($page, '/') || str_contains($page, '..') || str_contains($page, '\\') || str_contains($page, '//')) {
        return null;
    }

    if (strlen($page) > 200 || !preg_match('#^/[a-z0-9/_-]*$#', $page)) {
        return null;
    }

    return $page;
}

function avi_section(mixed $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_string($value) || !in_array($value, AVI_SECTIONS, true)) {
        return null;
    }

    return $value;
}

function avi_utm(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $value = trim(preg_replace('/[\x00-\x1F\x7F]/', '', $value) ?? '');

    if ($value === '' || strlen($value) > 80 || !preg_match('/^[a-zA-Z0-9 ._+\\-|]+$/', $value)) {
        return null;
    }

    return $value;
}

/**
 * @param array<string, mixed> $payload
 */
function avi_gclid(array $payload): int
{
    if (!array_key_exists('gclid', $payload)) {
        return 0;
    }

    $value = $payload['gclid'];

    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    if (is_int($value)) {
        return $value === 1 ? 1 : 0;
    }

    if (is_string($value)) {
        return $value === '' || $value === '0' ? 0 : 1;
    }

    return 0;
}

function avi_meta(mixed $value): ?string
{
    if (!is_array($value) || !isset($value['tipo']) || !is_string($value['tipo'])) {
        return null;
    }

    $tipo = trim(preg_replace('/[\x00-\x1F\x7F]/', '', $value['tipo']) ?? '');

    if ($tipo === '') {
        return null;
    }

    $tipo = substr($tipo, 0, 80);
    $json = json_encode(['tipo' => $tipo], JSON_UNESCAPED_UNICODE);

    return is_string($json) ? $json : null;
}

function avi_site_id(string $domain): ?int
{
    $statement = avi_pdo()->prepare('SELECT id FROM sites WHERE dominio = ? LIMIT 1');
    $statement->execute([$domain]);
    $id = $statement->fetchColumn();

    return is_numeric($id) ? (int) $id : null;
}

/**
 * @param array<string, mixed> $event
 */
function avi_store(int $siteId, string $ipHash, array $event): void
{
    $pdo = avi_pdo();
    $pdo->beginTransaction();

    try {
        $find = $pdo->prepare(
            'SELECT id FROM visits
             WHERE site_id = ? AND visitor_id = ? AND last_at >= (NOW() - INTERVAL 30 MINUTE)
             ORDER BY last_at DESC
             LIMIT 1'
        );
        $find->execute([$siteId, $event['visitor_id']]);
        $visitId = $find->fetchColumn();

        if (is_numeric($visitId)) {
            $visitId = (int) $visitId;
            $touch = $pdo->prepare('UPDATE visits SET last_at = NOW() WHERE id = ? AND site_id = ?');
            $touch->execute([$visitId, $siteId]);
        } else {
            if (!in_array($event['source'], AVI_SOURCES, true)) {
                $pdo->rollBack();
                avi_json(400);
            }

            $insertVisit = $pdo->prepare(
                'INSERT INTO visits
                    (site_id, visitor_id, started_at, last_at, landing_page, source, utm_source, utm_medium, utm_campaign, gclid, device, ip_hash)
                 VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $insertVisit->execute([
                $siteId,
                $event['visitor_id'],
                $event['page'],
                $event['source'],
                $event['utm_source'],
                $event['utm_medium'],
                $event['utm_campaign'],
                $event['gclid'],
                $event['device'],
                $ipHash,
            ]);
            $visitId = (int) $pdo->lastInsertId();
        }

        $insertEvent = $pdo->prepare(
            'INSERT INTO events (site_id, visit_id, type, page, section, meta, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())'
        );
        $insertEvent->execute([
            $siteId,
            $visitId,
            $event['type'],
            $event['page'],
            $event['section'],
            $event['meta'],
        ]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $error;
    }
}
