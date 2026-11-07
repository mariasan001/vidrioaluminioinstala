<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/auth.php';

function avi_panel_document(string $title, string $body, bool $wide = false, string $head = ''): void
{
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header_remove('X-Powered-By');

    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $wideAttr = $wide ? ' class="wide"' : '';
    $mainAttr = $wide ? ' class="wide"' : '';

    echo <<<HTML
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>{$safeTitle}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px 16px;
      background: #20201f;
      color: #fff;
      font-family: "Trebuchet MS", sans-serif;
    }
    main {
      width: min(100%, 420px);
      padding: 28px 22px;
      border-radius: 28px;
      background: #2c2c26;
    }
    h1 {
      margin: 0 0 8px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.75rem;
      line-height: 1.1;
    }
    p { margin: 0 0 20px; color: #c8c8c2; }
    .error { color: #ffb4b4; }
    label { display: block; margin-bottom: 14px; font-size: 0.95rem; }
    input {
      display: block;
      width: 100%;
      margin-top: 6px;
      min-height: 48px;
      padding: 12px 16px;
      border: 1px solid transparent;
      border-radius: 28px;
      background: #111;
      color: #fff;
      font: inherit;
      font-size: 16px;
    }
    input:focus { outline: none; border-color: #e8ff46; }
    button {
      width: 100%;
      min-height: 48px;
      margin-top: 8px;
      border: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #101010;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    button.secondary {
      background: transparent;
      color: #e8ff46;
      border: 1px solid rgba(232, 255, 70, 0.7);
    }
    body.wide {
      display: block;
      padding: 0 0 calc(88px + env(safe-area-inset-bottom));
      background: #20201f;
    }
    main.wide {
      width: min(100%, 480px);
      min-height: 100vh;
      margin: 0 auto;
      padding: 20px 16px 28px;
      border-radius: 0;
      background: #161614;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .hint { margin: 0 0 16px; color: #9a9a94; font-size: 0.85rem; }
    .chips { display: flex; gap: 8px; overflow-x: auto; margin: 0 0 10px; }
    .chips button, .pager button, button.back {
      width: auto;
      min-height: 40px;
      margin: 0;
      padding: 0 14px;
      border-radius: 999px;
      background: #111;
      color: #fff;
    }
    .chips button[aria-pressed="true"] { background: #e8ff46; color: #101010; }
    .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .dates[hidden] { display: none; }
    select {
      width: 100%;
      min-height: 48px;
      margin: 6px 0 14px;
      padding: 0 14px;
      border: 0;
      border-radius: 28px;
      background: #111;
      color: #fff;
      font: inherit;
      font-size: 16px;
    }
    .chart {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 148px;
      overflow-x: auto;
    }
    .bar-col {
      flex: 1 0 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 100%;
      color: #9a9a94;
      font-size: 0.7rem;
      text-align: center;
    }
    .bar {
      width: 100%;
      min-height: 4px;
      border-radius: 6px 6px 0 0;
      background: #e8ff46;
    }
    .block, .card-btn {
      width: 100%;
      margin: 0 0 10px;
      padding: 14px 16px;
      border-radius: 18px;
      background: #111;
      color: #fff;
      text-align: left;
    }
    .block b, .card-btn b { display: block; margin-bottom: 6px; overflow-wrap: anywhere; }
    .block p, .card-btn p { margin: 0; color: #c8c8c2; }
    .funnel-row { margin: 0 0 14px; }
    .funnel-meta { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
    .funnel-track { height: 12px; overflow: hidden; border-radius: 999px; background: #111; }
    .funnel-fill { height: 100%; background: #e8ff46; }
    .tl { margin: 8px 0 0; padding: 0 0 0 18px; border-left: 2px solid rgba(232, 255, 70, 0.5); }
    .tl li { margin: 0 0 16px; }
    .tl b { display: block; }
    .tl p { margin: 4px 0 0; }
    .pager { display: flex; gap: 8px; margin-top: 8px; }
    button.back { margin-bottom: 12px; }
    .tabs {
      position: fixed;
      left: 50%;
      bottom: 0;
      z-index: 5;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      width: min(100%, 480px);
      transform: translateX(-50%);
      background: #20201f;
      border-top: 1px solid rgba(232, 255, 70, 0.28);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .tabs button {
      min-height: 58px;
      margin: 0;
      border-radius: 0;
      background: transparent;
      color: #c8c8c2;
      font-size: 0.75rem;
    }
    .tabs button[aria-current="page"] { color: #e8ff46; }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 0 0 8px;
    }
    .stat {
      padding: 14px 16px;
      border-radius: 18px;
      background: #111;
    }
    .stat b {
      display: block;
      margin-bottom: 4px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.8rem;
      line-height: 1;
      color: #e8ff46;
    }
    .stat span { color: #c8c8c2; font-size: 0.92rem; }
    h2 {
      margin: 22px 0 8px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
    }
    ul.rows { list-style: none; margin: 0; padding: 0; }
    ul.rows li {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    ul.rows span { overflow-wrap: anywhere; }
    .muted { color: #c8c8c2; }
    form.logout { margin-top: 28px; }
    .top form.logout { margin: 0; }
    button.logout { width: auto; min-width: 88px; min-height: 40px; margin: 0; padding: 0 16px; }
  </style>
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
            $error = '<p class="error">Demasiados intentos. Espera 15 minutos.</p>';
        } elseif (($_GET['e'] ?? '') === '1') {
            $error = '<p class="error">Correo o contraseña incorrectos.</p>';
        }

        avi_panel_document('Entrar', <<<HTML
    <h1>Entrar</h1>
    <p>Panel de visitas y contactos.</p>
    {$error}
    <form method="post" action="/api/login.php" autocomplete="on">
      <input type="hidden" name="csrf" value="{$csrf}">
      <label>Correo
        <input type="email" name="email" value="{$email}" required maxlength="255" autocomplete="username">
      </label>
      <label>Contraseña
        <input type="password" name="password" required maxlength="200" autocomplete="current-password">
      </label>
      <button type="submit">Entrar</button>
    </form>
HTML);
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
        $head = <<<'HTML'
  <link rel="manifest" href="/panel/manifest.webmanifest">
  <meta name="theme-color" content="#161614">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Panel">
  <link rel="apple-touch-icon" href="/panel/icon-192.png">
HTML;
        $body = <<<HTML
    <header class="top">
      <h1 id="titulo">Resumen</h1>
      <form class="logout" method="post" action="/api/logout.php">
        <input type="hidden" name="csrf" value="{$csrf}">
        <button class="secondary logout" type="submit">Salir</button>
      </form>
    </header>
    <p class="hint">Agrégala a la pantalla de inicio para usarla como aplicación.</p>
    <div class="chips" id="rangos">
      <button type="button" data-rango="hoy">Hoy</button>
      <button type="button" data-rango="7">7 días</button>
      <button type="button" data-rango="30" aria-pressed="true">30 días</button>
      <button type="button" data-rango="custom">Rango</button>
    </div>
    <div class="dates" id="rango-fechas" hidden>
      <input id="desde" type="date" aria-label="Desde">
      <input id="hasta" type="date" aria-label="Hasta">
    </div>
    <div class="chips" id="fuentes">
      <button type="button" data-fuente="todas" aria-pressed="true">Todas</button>
      <button type="button" data-fuente="google_ads">Google Ads</button>
    </div>
    <label>Página
      <select id="pagina"><option value="">Todas las páginas</option></select>
    </label>
    <div id="vista"><p class="muted">Cargando…</p></div>
    <nav class="tabs">
      <button type="button" data-vista="resumen" aria-current="page">Resumen</button>
      <button type="button" data-vista="paginas">Páginas</button>
      <button type="button" data-vista="embudo">Embudo</button>
      <button type="button" data-vista="visitas">Visitas</button>
    </nav>
    <script src="/panel/app.js" defer></script>
HTML;
        avi_panel_document('Panel', $body, true, $head);
    } catch (Throwable $error) {
        avi_log('home_page ' . $error->getMessage());
        avi_unavailable();
    }
}
