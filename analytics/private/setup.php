<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/panel.php';

function avi_render_setup_page(): void
{
    try {
        if (!avi_setup_https_ok() || !avi_users_empty()) {
            if (avi_setup_https_ok() && !avi_users_empty()) {
                avi_log('setup_exists');
            }

            avi_not_found();
        }

        $code = (string) ($_GET['e'] ?? '');
        avi_setup_form($code === '1' ? 'datos' : ($code === '2' ? 'reintento' : ''));
    } catch (Throwable $error) {
        avi_log('setup_exception ' . $error->getMessage());
        avi_unavailable();
    }
}

function avi_handle_setup_post(): void
{
    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            avi_not_found();
        }

        if (!avi_setup_https_ok() || !avi_users_empty()) {
            avi_not_found();
        }

        if (!avi_csrf_valid((string) ($_POST['csrf'] ?? ''))) {
            avi_log('setup_csrf');
            avi_redirect('/panel/setup/?e=2');
        }

        $token = (string) ($_POST['token'] ?? '');
        $ip = avi_client_ip();

        if ($ip === '') {
            avi_not_found();
        }

        $ipHash = avi_ip_hash($ip);

        if (avi_setup_locked($ipHash) || !avi_setup_token_matches($token)) {
            avi_setup_register_failure($ipHash);
            avi_log(avi_setup_locked($ipHash) ? 'setup_locked' : 'setup_token');
            avi_not_found();
        }

        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');
        $confirmation = (string) ($_POST['password_confirmation'] ?? '');
        $length = function_exists('mb_strlen') ? mb_strlen($password) : strlen($password);

        if (
            !filter_var($email, FILTER_VALIDATE_EMAIL)
            || strlen($email) > 255
            || $length < 12
            || $length > 200
            || strlen($password) !== strlen($confirmation)
            || !hash_equals($password, $confirmation)
        ) {
            avi_log('setup_invalid');
            avi_redirect('/panel/setup/?e=1');
        }

        if (!avi_setup_create_admin($email, $password)) {
            avi_not_found();
        }

        avi_log('setup_created');
        avi_redirect('/panel/login');
    } catch (Throwable $error) {
        avi_log('setup_exception ' . $error->getMessage());
        avi_unavailable();
    }
}

function avi_setup_https_ok(): bool
{
    if (!(bool) avi_config()['require_https']) {
        return true;
    }

    $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));

    return $https === 'on' || $https === '1' || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
}

function avi_setup_token_matches(string $provided): bool
{
    $expected = avi_config()['setup_token'] ?? '';

    if (!is_string($expected) || strlen($expected) < 20 || $expected === 'CAMBIA_SETUP_TOKEN') {
        return false;
    }

    if ($provided === '' || strlen($provided) > 200) {
        return false;
    }

    return hash_equals($expected, $provided);
}

function avi_users_empty(): bool
{
    $statement = avi_pdo()->prepare('SELECT COUNT(*) FROM users');
    $statement->execute();

    return (int) $statement->fetchColumn() === 0;
}

function avi_setup_create_admin(string $email, string $password): bool
{
    $hash = avi_password_hash($password);

    if ($hash === false) {
        throw new RuntimeException('setup_hash');
    }

    $pdo = avi_pdo();
    $lock = $pdo->prepare('SELECT GET_LOCK(?, 5)');
    $lock->execute(['avi_setup_admin']);

    if ((int) $lock->fetchColumn() !== 1) {
        throw new RuntimeException('setup_lock');
    }

    try {
        if (!avi_users_empty()) {
            return false;
        }

        $insert = $pdo->prepare(
            'INSERT INTO users (email, password_hash, role, created_at)
             SELECT ?, ?, ?, NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users)'
        );
        $insert->execute([$email, $hash, 'admin']);
        $created = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $created->execute([$email]);

        return is_numeric($created->fetchColumn());
    } finally {
        $release = $pdo->prepare('SELECT RELEASE_LOCK(?)');
        $release->execute(['avi_setup_admin']);
    }
}

function avi_setup_locked(string $ipHash): bool
{
    $data = avi_setup_rate($ipHash);

    return $data !== null && $data['n'] >= 8 && (time() - $data['t']) < 900;
}

function avi_setup_register_failure(string $ipHash): void
{
    $directory = (string) avi_config()['rate_path'];

    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        return;
    }

    $path = $directory . '/setup-' . $ipHash;
    $handle = fopen($path, 'c+');

    if ($handle === false) {
        return;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return;
        }

        $now = time();
        $current = avi_setup_rate_from_handle($handle);
        $count = $current !== null && ($now - $current['t']) < 900 ? $current['n'] : 0;
        $window = $count === 0 ? $now : (int) $current['t'];
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode(['t' => $window, 'n' => $count + 1]));
        fflush($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/**
 * @return array{t: int, n: int}|null
 */
function avi_setup_rate(string $ipHash): ?array
{
    $path = (string) avi_config()['rate_path'] . '/setup-' . $ipHash;

    if (!is_file($path)) {
        return null;
    }

    $handle = fopen($path, 'rb');

    if ($handle === false) {
        return null;
    }

    try {
        if (!flock($handle, LOCK_SH)) {
            return null;
        }

        return avi_setup_rate_from_handle($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/**
 * @param resource $handle
 * @return array{t: int, n: int}|null
 */
function avi_setup_rate_from_handle($handle): ?array
{
    rewind($handle);
    $raw = stream_get_contents($handle);
    $data = is_string($raw) ? json_decode($raw, true) : null;

    if (!is_array($data)) {
        return null;
    }

    return ['t' => (int) ($data['t'] ?? 0), 'n' => (int) ($data['n'] ?? 0)];
}

function avi_setup_form(string $errorCode): void
{
    $csrf = htmlspecialchars(avi_csrf_token(), ENT_QUOTES, 'UTF-8');
    $error = match ($errorCode) {
        'datos' => '<p class="error">Revisa el correo y que las dos contraseñas coincidan. La contraseña lleva al menos 12 caracteres.</p>',
        'reintento' => '<p class="error">Vuelve a enviar el formulario.</p>',
        default => '',
    };

    avi_panel_document('Crear administrador', <<<HTML
    <h1>Crear administrador</h1>
    <p>Solo se puede hacer una vez, antes de que exista un usuario.</p>
    {$error}
    <form method="post" action="/api/setup.php" autocomplete="off">
      <input type="hidden" name="csrf" value="{$csrf}">
      <label>Token de configuración
        <input type="password" name="token" required maxlength="200" autocomplete="off">
      </label>
      <label>Correo
        <input type="email" name="email" required maxlength="255" autocomplete="username">
      </label>
      <label>Contraseña
        <input type="password" name="password" required minlength="12" maxlength="200" autocomplete="new-password">
      </label>
      <label>Confirmar contraseña
        <input type="password" name="password_confirmation" required minlength="12" maxlength="200" autocomplete="new-password">
      </label>
      <button type="submit">Crear administrador</button>
    </form>
HTML);
}
