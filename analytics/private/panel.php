<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/auth.php';

function avi_panel_document(string $title, string $body, bool $wide = false, string $head = '', string $bodyClass = ''): void
{
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header_remove('X-Powered-By');

    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $classes = trim(($wide ? 'wide' : '') . ' ' . $bodyClass);
    $wideAttr = $classes !== '' ? ' class="' . htmlspecialchars($classes, ENT_QUOTES, 'UTF-8') . '"' : '';
    $mainAttr = $wide ? ' class="wide"' : '';

    echo <<<HTML
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>{$safeTitle}</title>
  <link rel="icon" href="/panel/favicon.png" type="image/png">
  <link rel="stylesheet" href="/panel/panel.css">
  {$head}
</head>
<body{$wideAttr}>
  <main{$mainAttr}>
    {$body}
  </main>
</body>
</html>
HTML;
}

function avi_render_login_page(): void
{
    try {
        avi_session_start();

        if (avi_user_id() !== null) {
            avi_redirect('/panel/', 302);
        }

        $csrf = htmlspecialchars(avi_csrf_token(), ENT_QUOTES, 'UTF-8');
        $email = '';

        if (isset($_SESSION['login_email']) && is_string($_SESSION['login_email'])) {
            $email = htmlspecialchars($_SESSION['login_email'], ENT_QUOTES, 'UTF-8');
            unset($_SESSION['login_email']);
        }

        $error = '';

        if (($_GET['e'] ?? '') === '2') {
            $error = '<p class="login-error" role="alert">Demasiados intentos. Espera 15 minutos.</p>';
        } elseif (($_GET['e'] ?? '') === '1') {
            $error = '<p class="login-error" role="alert">Correo o contraseña incorrectos.</p>';
        }

        $loginHead = <<<'HEAD'
  <style>
    body.login-screen {
      display: grid;
      place-items: stretch;
      padding: 0;
      min-height: 100vh;
      min-height: 100dvh;
      background:
        radial-gradient(120% 80% at 12% 0%, rgba(232, 255, 70, 0.16), transparent 48%),
        radial-gradient(90% 70% at 100% 100%, rgba(120, 140, 90, 0.18), transparent 52%),
        linear-gradient(160deg, #141412 0%, #1c1c18 42%, #10100e 100%);
      color: #f4f4ef;
      overflow-x: hidden;
    }
    body.login-screen::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse at center, #000 35%, transparent 78%);
      opacity: 0.55;
    }
    body.login-screen main {
      width: 100%;
      max-width: none;
      min-height: 100vh;
      min-height: 100dvh;
      margin: 0;
      padding: 0;
      border-radius: 0;
      background: transparent;
      display: grid;
      place-items: center;
      padding: max(24px, env(safe-area-inset-top)) 20px max(28px, env(safe-area-inset-bottom));
      position: relative;
      z-index: 1;
    }
    .login-card {
      width: min(100%, 420px);
      padding: 36px 28px 30px;
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(44, 44, 38, 0.96), rgba(28, 28, 24, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow:
        0 28px 64px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      animation: loginIn 0.55s ease both;
    }
    @keyframes loginIn {
      from { opacity: 0; transform: translateY(14px) scale(0.985); }
      to { opacity: 1; transform: none; }
    }
    .login-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }
    .login-mark {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #e8ff46;
      color: #141410;
      font-family: Bahnschrift, "Segoe UI", sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 10px 28px rgba(232, 255, 70, 0.28);
    }
    .login-brand strong {
      display: block;
      font-family: Bahnschrift, "Segoe UI", sans-serif;
      font-size: 1.55rem;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .login-brand span {
      display: block;
      margin-top: 6px;
      color: #a8a89f;
      font-size: 0.92rem;
    }
    .login-card h1 {
      margin: 0 0 8px;
      font-family: Bahnschrift, "Segoe UI", sans-serif;
      font-size: clamp(1.7rem, 4vw, 2rem);
      letter-spacing: -0.03em;
    }
    .login-lead {
      margin: 0 0 22px;
      color: #b7b7ae;
      font-size: 0.98rem;
      line-height: 1.45;
    }
    .login-error {
      margin: 0 0 16px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(255, 90, 90, 0.12);
      border: 1px solid rgba(255, 140, 140, 0.28);
      color: #ffc9c9;
      font-size: 0.92rem;
    }
    .login-form label {
      display: block;
      margin-bottom: 14px;
      color: #d8d8d0;
      font-size: 0.9rem;
    }
    .login-form .field {
      position: relative;
      margin-top: 7px;
    }
    .login-form input[type="email"],
    .login-form input[type="password"],
    .login-form input[type="text"] {
      display: block;
      width: 100%;
      min-height: 52px;
      margin: 0;
      padding: 14px 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      background: rgba(10, 10, 9, 0.85);
      color: #fff;
      font: inherit;
      font-size: 16px;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .login-form .field.has-toggle input {
      padding-right: 52px;
    }
    .login-form input:focus {
      outline: none;
      border-color: rgba(232, 255, 70, 0.75);
      box-shadow: 0 0 0 3px rgba(232, 255, 70, 0.16);
    }
    .login-toggle {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 12px;
      background: transparent;
      color: #b8b8ae;
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .login-toggle:hover,
    .login-toggle[aria-pressed="true"] {
      color: #e8ff46;
      background: rgba(232, 255, 70, 0.08);
    }
    .login-toggle svg { display: block; }
    .login-toggle .eye-off { display: none; }
    .login-toggle[aria-pressed="true"] .eye-on { display: none; }
    .login-toggle[aria-pressed="true"] .eye-off { display: block; }
    .login-remember {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 4px 0 18px;
      color: #c4c4bb;
      font-size: 0.9rem;
      cursor: pointer;
      user-select: none;
    }
    .login-remember input {
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: #e8ff46;
      cursor: pointer;
    }
    .login-submit {
      width: 100%;
      min-height: 52px;
      margin: 0;
      border: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #12120f;
      font: inherit;
      font-family: Bahnschrift, "Segoe UI", sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 12px 28px rgba(232, 255, 70, 0.22);
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .login-submit:hover { filter: brightness(1.04); transform: translateY(-1px); }
    .login-submit:active { transform: translateY(0); }
    .login-note {
      margin: 18px 0 0;
      text-align: center;
      color: #8f8f86;
      font-size: 0.82rem;
    }
    @media (max-width: 480px) {
      .login-card { padding: 30px 20px 24px; border-radius: 24px; }
    }
  </style>
HEAD;

        avi_panel_document('Entrar · Instala', <<<HTML
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-brand">
        <span class="login-mark" aria-hidden="true">AVI</span>
        <div>
          <strong>Instala</strong>
          <span>Vidrio y aluminio</span>
        </div>
      </div>
      <h1 id="login-title">Entrar</h1>
      <p class="login-lead">Accede al panel de visitas, clientes y cuenta.</p>
      {$error}
      <form class="login-form" method="post" action="/api/login.php" autocomplete="on" id="login-form">
        <input type="hidden" name="csrf" value="{$csrf}">
        <label>Correo
          <span class="field">
            <input type="email" name="email" id="login-email" value="{$email}" required maxlength="255" autocomplete="username" inputmode="email">
          </span>
        </label>
        <label>Contraseña
          <span class="field has-toggle">
            <input type="password" name="password" id="login-password" required maxlength="200" autocomplete="current-password">
            <button type="button" class="login-toggle" id="login-eye" aria-label="Mostrar contraseña" aria-pressed="false" title="Mostrar u ocultar">
              <svg class="eye-on" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7"/></svg>
              <svg class="eye-off" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6A3.2 3.2 0 0 0 12 15.2a3.2 3.2 0 0 0 3.2-3.2 3.2 3.2 0 0 0-.5-1.7M7.1 7.3C4.7 8.7 3 12 3 12s3.5 7 9.5 7c1.8 0 3.4-.5 4.8-1.2M14.1 6.4C13.4 6.1 12.7 6 12 6 6 6 2.5 12 2.5 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            </button>
          </span>
        </label>
        <label class="login-remember">
          <input type="checkbox" id="login-remember" name="remember" value="1">
          Guardar correo y contraseña en este dispositivo
        </label>
        <button class="login-submit" type="submit">Entrar al panel</button>
      </form>
      <p class="login-note">Tu sesión permanece activa hasta que cierres sesión.</p>
    </section>
    <script>
    (function () {
      var KEY = "avi_login_cache_v1";
      var email = document.getElementById("login-email");
      var pass = document.getElementById("login-password");
      var remember = document.getElementById("login-remember");
      var eye = document.getElementById("login-eye");
      var form = document.getElementById("login-form");
      if (!email || !pass || !remember || !eye || !form) return;

      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var data = JSON.parse(raw);
          if (data && typeof data === "object") {
            if (!email.value && typeof data.email === "string") email.value = data.email;
            if (typeof data.password === "string" && data.password !== "") {
              pass.value = data.password;
              remember.checked = true;
            } else if (typeof data.email === "string" && data.email !== "") {
              remember.checked = true;
            }
          }
        }
      } catch (e) {}

      eye.addEventListener("click", function () {
        var show = pass.type === "password";
        pass.type = show ? "text" : "password";
        eye.setAttribute("aria-pressed", show ? "true" : "false");
        eye.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
      });

      form.addEventListener("submit", function () {
        try {
          if (remember.checked) {
            localStorage.setItem(KEY, JSON.stringify({
              email: String(email.value || "").trim().toLowerCase(),
              password: String(pass.value || "")
            }));
          } else {
            localStorage.removeItem(KEY);
          }
        } catch (e) {}
      });
    })();
    </script>
HTML, false, $loginHead, 'login-screen');
    } catch (Throwable $error) {
        avi_log('login_page ' . $error->getMessage());
        avi_unavailable();
    }
}

function avi_render_home_page(): void
{
    try {
        avi_require_login();
        $csrf = htmlspecialchars(avi_csrf_token(), ENT_QUOTES, 'UTF-8');
        $email = isset($_SESSION['email']) && is_string($_SESSION['email']) ? $_SESSION['email'] : '';
        $role = (($_SESSION['role'] ?? '') === 'dueno') ? 'dueno' : 'admin';
        $cuentaNombre = 'Instala';
        if ($email !== '' && str_contains($email, '@')) {
            $local = strstr($email, '@', true);
            $cuentaNombre = is_string($local) && $local !== '' ? $local : $email;
        }
        $cuentaNombre = htmlspecialchars($cuentaNombre, ENT_QUOTES, 'UTF-8');
        $cuentaRol = $role === 'dueno' ? 'Dueño' : 'Admin';
        $cuentaInicial = htmlspecialchars(strtoupper(substr($cuentaNombre, 0, 1)), ENT_QUOTES, 'UTF-8');
        $head = <<<'HTML'
  <link rel="manifest" href="/panel/manifest.json">
  <meta name="theme-color" content="#0c0c0a">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Panel AVI">
  <link rel="apple-touch-icon" href="/panel/icon-192.png">
HTML;
        $body = <<<HTML
    <div class="shell">
      <aside class="side">
        <div class="brand">
          <span class="mark">AVI</span>
          <div>
            <strong>Instala</strong>
            <em>Panel</em>
          </div>
        </div>
        <p class="menu-label">Menú</p>
        <nav class="tabs">
          <span class="nav-pill" aria-hidden="true"></span>
          <button type="button" data-vista="resumen" aria-current="page"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" stroke="currentColor" stroke-width="1.8"/></svg></span><span class="nav-label">Resumen</span></button>
          <button type="button" data-vista="paginas"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7.2L19 8.2V20.5H7zM14.2 3.5V8H19M9.5 12.5h6M9.5 16h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Páginas</span></button>
          <button type="button" data-vista="embudo"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16l-6 7v6l-4 2v-8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Embudo</span></button>
          <button type="button" data-vista="comparativa"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 19V10M12 19V5M19 19v-7M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Comparativa</span></button>
          <button type="button" data-vista="contactos" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.8 3.8 0 0 1 7 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="nav-label">Contactos</span></button>
          <button type="button" data-vista="clientes"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 19.5a7 7 0 0 1 14 0M15.5 8.2l2 2 3.3-3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Clientes</span></button>
          <button type="button" data-vista="catalogos" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5zM5 5.5V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Catálogos</span></button>
          <button type="button" data-vista="promociones" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 12.5 4H20v7.5L11.5 20zM16.5 8.2h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Promociones</span></button>
          <p class="menu-label nav-split">Opciones</p>
          <button type="button" class="nav-desk-only" data-vista="campana"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 10.5v3h3.2L14 18V6l-6.8 4.5zM16.5 9.2a3.2 3.2 0 0 1 0 5.6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg></span><span class="nav-label">Campaña</span></button>
          <button type="button" class="nav-desk-only" data-vista="pagos"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 8.5h17v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17.5zM3.5 8.5 6 5h12l2.5 3.5M3.5 12.5h17" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Pagos</span></button>
          <button type="button" class="nav-desk-only" data-vista="licencia"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7zM14 4v4h4M9.5 13h5M9.5 16.5h3.5M8.2 9.2l1.4 1.4 2.8-2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Licencia</span></button>
          <button type="button" class="nav-desk-only" data-vista="referidos"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.8 3.8 0 0 1 7 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="nav-label">Referidos</span></button>
          <button type="button" class="nav-mobile-only" data-action="cuenta" aria-haspopup="dialog" aria-expanded="false"><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 13.1v-2.2l-1.8-.4a5.7 5.7 0 0 0-.5-1.1l1-1.6-1.6-1.6-1.6 1a5.7 5.7 0 0 0-1.1-.5L13.1 4.6h-2.2l-.4 1.8a5.7 5.7 0 0 0-1.1.5l-1.6-1-1.6 1.6 1 1.6a5.7 5.7 0 0 0-.5 1.1l-1.8.4v2.2l1.8.4c.1.4.3.8.5 1.1l-1 1.6 1.6 1.6 1.6-1c.3.2.7.4 1.1.5l.4 1.8h2.2l.4-1.8c.4-.1.8-.3 1.1-.5l1.6 1 1.6-1.6-1-1.6c.2-.3.4-.7.5-1.1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Cuenta</span></button>
        </nav>
        <div class="account" data-role="{$role}">
          <span class="avatar" aria-hidden="true">{$cuentaInicial}</span>
          <div>
            <strong>{$cuentaNombre}</strong>
            <em>{$cuentaRol}</em>
          </div>
          <form method="post" action="/api/logout.php">
            <input type="hidden" name="csrf" value="{$csrf}">
            <button class="logout" type="submit" aria-label="Salir"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H10M10 12h9M16 8.5 19.5 12 16 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </form>
        </div>
      </aside>
      <div class="content">
        <header class="top">
          <div class="appbar">
            <span class="mark" aria-hidden="true">AVI</span>
            <form method="post" action="/api/logout.php">
              <input type="hidden" name="csrf" value="{$csrf}">
              <button class="logout" type="submit" aria-label="Salir">{$cuentaInicial}</button>
            </form>
          </div>
          <div class="hello-block">
            <p class="hello"><span id="hello-time">Resumen</span><strong id="hello-name"></strong></p>
            <h1 id="titulo">Resumen</h1>
            <p id="subtitulo" class="hint">Visitas, contactos y el ritmo del periodo.</p>
          </div>
          <div class="toolbar">
            <div class="period" id="rangos">
              <button type="button" class="period-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="periodo-menu">
                <span class="period-kicker">Periodo</span>
                <span class="period-value">30 días</span>
                <span class="period-chevron" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.2 7 9l4-3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </button>
              <ul class="period-menu" id="periodo-menu" role="listbox" hidden>
                <li><button type="button" role="option" data-rango="hoy">Hoy</button></li>
                <li><button type="button" role="option" data-rango="7">7 días</button></li>
                <li><button type="button" role="option" data-rango="30" aria-selected="true">30 días</button></li>
                <li><button type="button" role="option" data-rango="custom">Rango</button></li>
              </ul>
            </div>
            <div class="dates" id="rango-fechas" hidden>
              <input id="desde" type="date" aria-label="Desde">
              <input id="hasta" type="date" aria-label="Hasta">
            </div>
          </div>
        </header>
        <div id="vista"><p class="muted">Cargando…</p></div>
      </div>
    </div>
    <script src="/panel/vendor/gsap.min.js" defer></script>
    <script src="/panel/vendor/html2canvas.min.js" defer></script>
    <script src="/panel/vendor/jspdf.umd.min.js" defer></script>
    <script src="/panel/app/boot.js" defer></script>
    <script src="/panel/app/stats.js" defer></script>
    <script src="/panel/app/crm.js" defer></script>
    <script src="/panel/app/account.js" defer></script>
    <script src="/panel/app/referrals.js" defer></script>
    <script src="/panel/app/catalog.js" defer></script>
HTML;
        avi_panel_document('Panel', $body, true, $head);
    } catch (Throwable $error) {
        avi_log('home_page ' . $error->getMessage());
        avi_unavailable();
    }
}
