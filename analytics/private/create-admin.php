<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/bootstrap.php';

$email = strtolower(trim((string) ($argv[1] ?? '')));
$password = (string) ($argv[2] ?? '');
$reset = in_array('--reset', $argv, true);

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
    fwrite(STDERR, "Uso: php create-admin.php correo@dominio.com 'contraseña-de-12-o-mas' [--reset]\n");
    exit(1);
}

$algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
$hash = password_hash($password, $algorithm);

if ($hash === false) {
    fwrite(STDERR, "No se pudo generar el hash.\n");
    exit(1);
}

$pdo = avi_pdo();
$existing = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$existing->execute([$email]);
$id = $existing->fetchColumn();

if (is_numeric($id) && !$reset) {
    fwrite(STDERR, "Ese correo ya existe. Vuelve a correr el comando con --reset para reemplazar la contraseña.\n");
    exit(1);
}

if (is_numeric($id)) {
    $update = $pdo->prepare('UPDATE users SET password_hash = ?, role = ? WHERE id = ?');
    $update->execute([$hash, 'admin', (int) $id]);
    fwrite(STDOUT, "Contraseña actualizada para {$email}.\n");
    exit(0);
}

$insert = $pdo->prepare(
    'INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, NOW())'
);
$insert->execute([$email, $hash, 'admin']);
fwrite(STDOUT, "Usuario admin creado: {$email}.\n");
fwrite(STDOUT, "Hash por si quieres insertarlo a mano en phpMyAdmin:\n{$hash}\n");
