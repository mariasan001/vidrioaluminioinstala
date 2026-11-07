<?php

declare(strict_types=1);

$bootstrap = dirname(__DIR__, 3) . '/private/bootstrap.php';

if (!is_file($bootstrap)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo '{"ok":false}';
    exit;
}

require $bootstrap;
require dirname($bootstrap) . '/stats.php';

avi_stats_resumen();
