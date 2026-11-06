<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/bootstrap.php';

$pdo = avi_pdo();
$events = $pdo->exec('DELETE FROM events WHERE created_at < (NOW() - INTERVAL 13 MONTH)');
$visits = $pdo->exec('DELETE FROM visits WHERE started_at < (NOW() - INTERVAL 13 MONTH)');
$attempts = $pdo->exec('DELETE FROM login_attempts WHERE created_at < (NOW() - INTERVAL 13 MONTH)');

fwrite(STDOUT, 'Eventos borrados: ' . (int) $events . PHP_EOL);
fwrite(STDOUT, 'Visitas borradas: ' . (int) $visits . PHP_EOL);
fwrite(STDOUT, 'Intentos de acceso borrados: ' . (int) $attempts . PHP_EOL);
