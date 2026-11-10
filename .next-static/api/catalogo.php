<?php

declare(strict_types=1);

$bootstrap = dirname(__DIR__, 2) . '/private/bootstrap.php';

if (!is_file($bootstrap)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false}';
    exit;
}

require $bootstrap;
require dirname($bootstrap) . '/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$file = dirname(__DIR__) . '/data/catalogo.json';

function avi_catalog_read(string $file): array
{
    if (!is_file($file)) {
        return ['productos' => []];
    }

    $decoded = json_decode((string) file_get_contents($file), true);

    if (!is_array($decoded) || !isset($decoded['productos']) || !is_array($decoded['productos'])) {
        return ['productos' => []];
    }

    return $decoded;
}

function avi_catalog_write(string $file, array $data): bool
{
    $dir = dirname($file);

    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        return false;
    }

    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

    if (!is_string($json)) {
        return false;
    }

    return file_put_contents($file, $json . "\n", LOCK_EX) !== false;
}

function avi_catalog_clean(array $row, string $id): ?array
{
    $pagina = isset($row['pagina']) && is_string($row['pagina']) ? $row['pagina'] : '';
    $titulo = isset($row['titulo']) && is_string($row['titulo']) ? trim($row['titulo']) : '';
    $accion = isset($row['accion']) && is_string($row['accion']) ? $row['accion'] : 'preguntar';

    if ($titulo === '' || strlen($titulo) > 120 || !preg_match('#^/[a-z0-9/_-]*$#', $pagina) || strlen($pagina) > 200) {
        return null;
    }

    if (!in_array($accion, ['preguntar', 'precio', 'color'], true)) {
        $accion = 'preguntar';
    }

    $text = static function ($value, int $max): string {
        $clean = is_string($value) ? trim($value) : '';

        return strlen($clean) > $max ? substr($clean, 0, $max) : $clean;
    };

    $imagen = $text($row['imagen'] ?? '', 1800000);

    if ($imagen !== '' && !str_starts_with($imagen, '/img/') && !str_starts_with($imagen, '/catalogo/') && !str_starts_with($imagen, 'data:image/')) {
        $imagen = '';
    }

    return [
        'id' => $id,
        'pagina' => $pagina,
        'titulo' => $titulo,
        'descripcion' => $text($row['descripcion'] ?? '', 600),
        'caracteristicas' => $text($row['caracteristicas'] ?? '', 300),
        'imagen' => $imagen,
        'accion' => $accion,
        'precio' => $accion === 'precio' ? $text($row['precio'] ?? '', 40) : '',
        'color' => $accion === 'color' ? $text($row['color'] ?? '', 40) : '',
    ];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    echo json_encode(avi_catalog_read($file), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo '{"ok":false}';
    exit;
}

avi_require_login();
$raw = file_get_contents('php://input');

if (!is_string($raw) || strlen($raw) > 2500000) {
    http_response_code(400);
    echo '{"ok":false}';
    exit;
}

$body = json_decode($raw, true);

if (!is_array($body) || !avi_csrf_valid(is_string($body['csrf'] ?? null) ? $body['csrf'] : '')) {
    http_response_code(403);
    echo '{"ok":false}';
    exit;
}

$store = avi_catalog_read($file);
$action = is_string($body['accion_api'] ?? null) ? $body['accion_api'] : '';
$id = is_string($body['id'] ?? null) ? $body['id'] : '';
$product = isset($body['producto']) && is_array($body['producto']) ? $body['producto'] : [];

if ($action === 'eliminar') {
    if (!preg_match('/^[a-z0-9_-]{4,40}$/', $id)) {
        http_response_code(400);
        echo '{"ok":false}';
        exit;
    }

    $store['productos'] = array_values(array_filter(
        $store['productos'],
        static fn ($row): bool => !is_array($row) || ($row['id'] ?? '') !== $id
    ));
} else {
    $nextId = $action === 'editar' && preg_match('/^[a-z0-9_-]{4,40}$/', $id) ? $id : 'p' . bin2hex(random_bytes(4));
    $clean = avi_catalog_clean($product, $nextId);

    if ($clean === null) {
        http_response_code(400);
        echo '{"ok":false}';
        exit;
    }

    $replaced = false;
    foreach ($store['productos'] as $index => $row) {
        if (is_array($row) && ($row['id'] ?? '') === $nextId) {
            $store['productos'][$index] = $clean;
            $replaced = true;
        }
    }

    if (!$replaced) {
        $store['productos'][] = $clean;
    }
}

if (!avi_catalog_write($file, $store)) {
    http_response_code(500);
    echo '{"ok":false}';
    exit;
}

echo json_encode(['ok' => true, 'productos' => $store['productos']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
