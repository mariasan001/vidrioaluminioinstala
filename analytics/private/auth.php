<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const AVI_SESSION_SECONDS = 604800;
const AVI_LOGIN_DUMMY_HASH = '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';

function avi_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('AVISESS');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.gc_maxlifetime', (string) AVI_SESSION_SECONDS);
    session_set_cookie_params([
        'lifetime' => AVI_SESSION_SECONDS,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function avi_csrf_token(): string
{
    avi_session_start();
    $current = $_SESSION['csrf'] ?? '';

    if (!is_string($current) || strlen($current) !== 64) {
        $current = bin2hex(random_bytes(32));
        $_SESSION['csrf'] = $current;
    }

    return $current;
}

function avi_csrf_rotate(): void
{
    avi_session_start();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function avi_csrf_valid(string $provided): bool
{
    avi_session_start();
    $expected = $_SESSION['csrf'] ?? '';

    if (!is_string($expected) || $expected === '' || $provided === '' || strlen($provided) > 128) {
        return false;
    }

    return hash_equals($expected, $provided);
}

function avi_user_id(): ?int
{
    avi_session_start();
    $id = $_SESSION['user_id'] ?? null;

    if (is_int($id)) {
        return $id;
    }

    if (is_string($id) && ctype_digit($id)) {
        return (int) $id;
    }

    return null;
}

function avi_require_login(): void
{
    if (avi_user_id() !== null) {
        return;
    }

    header('Location: /panel/login', true, 302);
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    exit;
}

function avi_redirect(string $location, int $status = 303): never
{
    header('Location: ' . $location, true, $status);
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    exit;
}

function avi_handle_login_post(): void
{
    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            avi_not_found();
        }

        avi_session_start();
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');
        $csrf = (string) ($_POST['csrf'] ?? '');

        if (!avi_csrf_valid($csrf)) {
            avi_log('login_csrf');
            avi_redirect('/panel/login?e=1');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || $password === '' || strlen($password) > 200) {
            avi_login_fail($email);
            avi_redirect('/panel/login?e=1');
        }

        $ip = avi_client_ip();

        if ($ip === '') {
            avi_redirect('/panel/login?e=1');
        }

        $ipHash = avi_ip_hash($ip);

        if (avi_login_locked($ipHash, $email)) {
            avi_record_login_attempt($ipHash, $email, false);
            avi_log('login_locked');
            avi_redirect('/panel/login?e=2');
        }

        $statement = avi_pdo()->prepare('SELECT id, password_hash, role FROM users WHERE email = ? LIMIT 1');
        $statement->execute([$email]);
        $user = $statement->fetch();
        $hash = is_array($user) && is_string($user['password_hash'] ?? null)
            ? $user['password_hash']
            : AVI_LOGIN_DUMMY_HASH;
        $valid = password_verify($password, $hash) && is_array($user);

        if (!$valid) {
            avi_record_login_attempt($ipHash, $email, false);
            avi_log('login_fail');
            $_SESSION['login_email'] = $email;
            avi_redirect('/panel/login?e=1');
        }

        $userId = (int) $user['id'];
        $touch = avi_pdo()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?');
        $touch->execute([$userId]);
        avi_record_login_attempt($ipHash, $email, true);
        session_regenerate_id(true);
        unset($_SESSION['login_email']);
        $_SESSION['user_id'] = $userId;
        $_SESSION['email'] = $email;
        $_SESSION['role'] = (($user['role'] ?? '') === 'dueno') ? 'dueno' : 'admin';
        avi_csrf_rotate();
        avi_log('login_ok');
        avi_redirect('/panel/');
    } catch (Throwable $error) {
        avi_log('login_exception ' . $error->getMessage());
        avi_unavailable();
    }
}

function avi_handle_logout_post(): void
{
    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            avi_not_found();
        }

        avi_session_start();

        if (!avi_csrf_valid((string) ($_POST['csrf'] ?? ''))) {
            avi_log('logout_csrf');
            avi_redirect(avi_user_id() === null ? '/panel/login' : '/panel/');
        }

        $_SESSION = [];
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'] !== '' ? $params['path'] : '/',
            'domain' => $params['domain'],
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_destroy();
        avi_redirect('/panel/login');
    } catch (Throwable $error) {
        avi_log('logout_exception ' . $error->getMessage());
        avi_unavailable();
    }
}

function avi_login_locked(string $ipHash, string $email): bool
{
    $statement = avi_pdo()->prepare(
        'SELECT COUNT(*) FROM login_attempts
         WHERE success = 0
           AND created_at >= (NOW() - INTERVAL 15 MINUTE)
           AND (ip_hash = ? OR email = ?)'
    );
    $statement->execute([$ipHash, $email]);

    return (int) $statement->fetchColumn() >= 5;
}

function avi_record_login_attempt(string $ipHash, string $email, bool $success): void
{
    $statement = avi_pdo()->prepare(
        'INSERT INTO login_attempts (ip_hash, email, success, created_at) VALUES (?, ?, ?, NOW())'
    );
    $statement->execute([$ipHash, $email, $success ? 1 : 0]);
}

function avi_login_fail(string $email): void
{
    $ip = avi_client_ip();

    if ($ip === '') {
        return;
    }

    avi_record_login_attempt(avi_ip_hash($ip), substr($email, 0, 255), false);
}
