<?php

declare(strict_types=1);

$bootstrap = dirname(__DIR__, 2) . '/private/bootstrap.php';

if (!is_file($bootstrap)) {
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    echo '<!doctype html><html lang="es"><meta charset="utf-8"><title>No disponible</title><p>No disponible</p></html>';
    exit;
}

require $bootstrap;
require dirname($bootstrap) . '/auth.php';

avi_handle_login_post();
