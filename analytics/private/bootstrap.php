<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli' && realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === realpath(__FILE__)) {
    http_response_code(404);
    exit;
}

/**
 * @return array<string, mixed>
 */
function avi_config(): array
{
    static $config;

    if (is_array($config)) {
        return $config;
    }

    $path = __DIR__ . '/config.php';

    if (!is_file($path)) {
        throw new RuntimeException('missing_config');
    }

    $loaded = require $path;

    if (!is_array($loaded)) {
        throw new RuntimeException('bad_config');
    }

    foreach (['db_host', 'db_name', 'db_user', 'db_pass', 'ip_salt', 'allowed_domains'] as $key) {
        if (!isset($loaded[$key]) || $loaded[$key] === '' || $loaded[$key] === []) {
            throw new RuntimeException('incomplete_config');
        }
    }

    if (!is_array($loaded['allowed_domains'])) {
        throw new RuntimeException('incomplete_config');
    }

    $loaded['require_https'] = (bool) ($loaded['require_https'] ?? true);
    $loaded['timezone'] = is_string($loaded['timezone'] ?? null) ? $loaded['timezone'] : 'America/Mexico_City';
    $loaded['log_path'] = is_string($loaded['log_path'] ?? null) ? $loaded['log_path'] : __DIR__ . '/logs/app.log';
    $loaded['rate_path'] = is_string($loaded['rate_path'] ?? null) ? $loaded['rate_path'] : __DIR__ . '/rate';

    date_default_timezone_set($loaded['timezone']);
    $config = $loaded;

    return $config;
}

function avi_log(string $message): void
{
    try {
        $path = (string) avi_config()['log_path'];
    } catch (Throwable) {
        return;
    }

    $directory = dirname($path);

    if (!is_dir($directory)) {
        mkdir($directory, 0700, true);
    }

    file_put_contents($path, date('c') . ' ' . $message . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function avi_pdo(): PDO
{
    static $pdo;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = avi_config();
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_name']
    );

    $pdo = new PDO($dsn, (string) $config['db_user'], (string) $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '-06:00'");

    return $pdo;
}

function avi_client_ip(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '';
}

function avi_ip_hash(string $ip): string
{
    return hash('sha256', $ip . (string) avi_config()['ip_salt']);
}

/**
 * @param array<string, mixed> $payload
 */
function avi_json(int $status, array $payload = ['ok' => false]): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header_remove('X-Powered-By');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function avi_fail(int $status, string $reason): never
{
    avi_log($reason);
    avi_json($status);
}
