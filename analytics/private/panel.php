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
      padding: 0;
      background: #0c0c0a;
    }
    main.wide {
      width: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      border-radius: 0;
      background: #0c0c0a;
    }
    .shell { display: block; min-height: 100vh; }
    .side {
      position: fixed;
      top: 16px;
      left: 16px;
      bottom: 16px;
      z-index: 6;
      display: flex;
      flex-direction: column;
      width: 252px;
      height: auto;
      padding: 22px 14px 14px;
      background: #1a1a17;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 28px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
    }
    .brand { display: flex; align-items: center; gap: 12px; padding: 0 8px 22px; }
    .mark {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-weight: 700;
    }
    .brand strong { display: block; font-family: Bahnschrift, sans-serif; font-size: 1.15rem; line-height: 1; }
    .brand em { color: #e8ff46; font-family: Georgia, serif; font-size: 0.95rem; }
    .menu-label {
      margin: 0 10px 8px;
      color: #8d8d86;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .nav-split {
      margin-top: auto;
      margin-bottom: 8px;
      padding-top: 14px;
    }
    .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
    .hint { margin: 6px 0 0; color: #9a9a94; font-size: 0.95rem; }
    .toolbar { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 8px; }
    .toolbar[hidden] { display: none; }
    .appbar, .hello { display: none; }
    .period { position: relative; margin: 0; }
    .period-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: auto;
      min-height: 46px;
      margin: 0;
      padding: 6px 6px 6px 16px;
      border: 1px solid rgba(232, 255, 70, 0.45);
      border-radius: 999px;
      background: #1c1c19;
      color: #fff;
      font-weight: 400;
    }
    .period-kicker {
      color: #9a9a94;
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .period-value { font-family: Bahnschrift, sans-serif; font-size: 1rem; font-weight: 700; }
    .period-chevron {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      transition: transform 0.2s ease;
    }
    .period-btn[aria-expanded="true"] .period-chevron { transform: rotate(180deg); }
    .period-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 8;
      display: grid;
      gap: 4px;
      width: 220px;
      margin: 0;
      padding: 8px;
      list-style: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      background: #161614;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    }
    .period-menu[hidden] { display: none; }
    .period-menu button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 42px;
      margin: 0;
      padding: 0 12px;
      border-radius: 12px;
      background: transparent;
      color: #fff;
      font-weight: 600;
      text-align: left;
    }
    .period-menu button:hover { background: rgba(232, 255, 70, 0.12); color: #e8ff46; }
    .period-menu button[aria-selected="true"] { background: #e8ff46; color: #161614; }
    .period-menu button[aria-selected="true"]:hover { background: #e8ff46; color: #161614; }
    .period-menu button[aria-selected="true"]::after {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #161614;
    }
    .toolbar .dates input { min-height: 46px; margin: 0; border-radius: 999px; border: 1px solid rgba(232, 255, 70, 0.35); }
    .pager button, button.back {
      width: auto;
      min-height: 40px;
      margin: 0;
      padding: 0 14px;
      border-radius: 999px;
      background: #111;
      color: #fff;
    }
    .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
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
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 4px;
      width: auto;
      min-height: 0;
      overflow: auto;
      transform: none;
      background: transparent;
      border: 0;
      padding: 0;
    }
    .nav-pill {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 0;
      width: 100%;
      height: 46px;
      border-radius: 14px;
      background: #e8ff46;
    }
    .tabs [hidden] { display: none; }
    .tabs button {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 46px;
      margin: 0;
      padding: 0 12px;
      border-radius: 14px;
      background: transparent;
      color: #d7d7d0;
      font-weight: 500;
      text-align: left;
    }
    .tabs button:hover { color: #fff; }
    .tabs button[aria-current="page"],
    .tabs button[aria-current="page"]:hover { background: transparent; color: #161614; }
    .tabs button[aria-current="page"] .nav-ico,
    .tabs button[aria-current="page"] .nav-ico svg {
      color: #161614;
    }
    .tabs button[aria-current="page"] .nav-ico svg path,
    .tabs button[aria-current="page"] .nav-ico svg circle,
    .tabs button[aria-current="page"] .nav-ico svg rect {
      stroke: #161614;
    }
    .nav-ico { display: grid; place-items: center; width: 22px; height: 22px; color: inherit; }
    .nav-ico svg { display: block; color: inherit; }
    .nav-label { font-family: Bahnschrift, sans-serif; font-size: 1.02rem; letter-spacing: 0.01em; }
    .account-modal {
      position: fixed;
      inset: 0;
      z-index: 55;
      display: grid;
      align-items: end;
      justify-items: center;
      padding: 0;
      background: rgba(8, 8, 7, 0.55);
      backdrop-filter: blur(8px);
    }
    .account-sheet {
      width: min(520px, 100%);
      max-height: min(88vh, 720px);
      overflow: auto;
      padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
      border-radius: 28px 28px 0 0;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.45);
    }
    .account-sheet-handle {
      display: block;
      width: 42px;
      height: 4px;
      margin: 4px auto 14px;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.2);
    }
    .account-sheet-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .account-sheet-top h2 {
      margin: 0;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.25rem;
    }
    .account-sheet-top button {
      width: 36px;
      min-width: 36px;
      min-height: 36px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: #161614;
      color: #e8ff46;
      font-size: 1.2rem;
      line-height: 1;
    }
    .account-options {
      display: grid;
      gap: 10px;
    }
    .account-option {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      width: 100%;
      margin: 0;
      padding: 14px 14px;
      border: 1px solid rgba(22, 22, 20, 0.08);
      border-radius: 18px;
      background: #fff;
      color: #161614;
      text-align: left;
      box-shadow: 0 8px 20px rgba(22, 22, 20, 0.04);
    }
    .account-option:hover { border-color: rgba(22, 22, 20, 0.18); }
    .account-option.is-logout .account-option-ico {
      background: #161614;
      color: #e8ff46;
    }
    .account-option-ico {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #161614;
      color: #e8ff46;
    }
    .account-option-ico svg { display: block; }
    .account-option strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      letter-spacing: -0.02em;
    }
    .account-option p {
      margin: 3px 0 0;
      color: #6f6c62;
      font-family: Georgia, serif;
      font-size: 0.86rem;
      line-height: 1.3;
    }
    .account-option-status {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .account-option-status.is-warn {
      background: #161614;
      color: #e8ff46;
    }
    .account {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) 36px;
      gap: 10px;
      align-items: center;
      margin-top: auto;
      padding: 10px;
      border-radius: 18px;
      background: #121210;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-weight: 700;
    }
    .account strong, .account em { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .account strong { font-size: 0.95rem; }
    .account em { color: #e8ff46; font-family: Georgia, serif; font-size: 0.88rem; }
    .account form { margin: 0; }
    .account button.logout {
      display: grid;
      place-items: center;
      width: 36px;
      min-width: 36px;
      height: 36px;
      min-height: 36px;
      margin: 0;
      padding: 0;
      border: 1px solid rgba(232, 255, 70, 0.45);
      border-radius: 12px;
      background: transparent;
      color: #e8ff46;
    }
    .funnel-row.sale .funnel-fill { background: #e8ff46; }
    .funnel-row .funnel-fill { background: rgba(232, 255, 70, 0.35); }
    .funnel-row.sale span { color: #e8ff46; }
    .journeys { display: grid; gap: 16px; }
    .funnel-pick {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
      align-items: start;
    }
    @media (min-width: 761px) {
      .funnel-pick.is-desk {
        gap: 16px;
      }
      .journeys.is-desk-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: stretch;
      }
      .journeys.is-desk-grid .journey {
        height: 100%;
        min-height: 0;
      }
      .journeys.is-desk-grid .journey-empty {
        min-height: 0;
        display: grid;
        align-content: start;
      }
      .journeys.is-desk-grid .empty-path {
        width: 100%;
        margin: 18px 0 14px;
      }
      .journeys.is-desk-grid .journey h2 { font-size: 1.25rem; }
      .journeys.is-desk-grid .journey-head em { font-size: 0.9rem; }
      .journeys.is-desk-grid .journey-empty .journey-note { font-size: 1.15rem; }
      .journeys.is-desk-grid .trail {
        grid-template-columns: 1fr;
        gap: 10px;
      }
      .journeys.is-desk-grid .trail::before {
        top: 14px;
        bottom: 14px;
        left: 7px;
        right: auto;
        width: 2px;
        height: auto;
      }
      .journeys.is-desk-grid .trail li {
        display: grid;
        grid-template-columns: 16px auto minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
        text-align: left;
      }
      .journeys.is-desk-grid .step-dot { margin: 0; }
      .journeys.is-desk-grid .step-n { font-size: 1.05rem; }
      .journeys.is-desk-grid .step-name,
      .journeys.is-desk-grid .step-pct {
        margin-top: 0;
        font-size: 0.78rem;
      }
    }
    .page-pick { width: 100%; max-width: 100%; }
    .page-pick .period-btn { width: 100%; justify-content: space-between; }
    .page-pick .period-menu {
      left: 0;
      right: 0;
      width: 100%;
      max-height: 280px;
      overflow: auto;
    }
    .pick-list { display: grid; gap: 6px; }
    .pick-list button {
      width: 100%;
      min-height: 44px;
      margin: 0;
      padding: 0 14px;
      border-radius: 14px;
      background: #1c1c19;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      font-weight: 500;
      text-align: left;
    }
    .pick-list button:hover { background: #262622; color: #e8ff46; }
    .pick-list button[aria-pressed="true"],
    .pick-list button[aria-pressed="true"]:hover { background: #e8ff46; color: #161614; }
    .funnel-pick .pick-list {
      position: relative;
      gap: 2px;
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 28px;
      background: #1a1a17;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
    }
    .pick-pill {
      position: absolute;
      z-index: 0;
      left: 10px;
      right: 10px;
      border-radius: 16px;
      background: #e8ff46;
      pointer-events: none;
    }
    .funnel-pick .pick-list button {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 46px;
      padding: 0 14px;
      border-radius: 16px;
      background: transparent;
      color: #f4f3ea;
    }
    .funnel-pick .pick-list button em {
      color: #8d8d84;
      font-family: Georgia, serif;
      font-size: 0.92rem;
      font-style: italic;
    }
    .funnel-pick .pick-list button:hover { background: transparent; color: #e8ff46; }
    .funnel-pick .pick-list button:hover em { color: #e8ff46; }
    .funnel-pick .pick-list button[aria-pressed="true"],
    .funnel-pick .pick-list button[aria-pressed="true"]:hover { background: transparent; color: #161614; }
    .funnel-pick .pick-list button[aria-pressed="true"] em,
    .funnel-pick .pick-list button[aria-pressed="true"]:hover em { color: #161614; }
    .journey {
      padding: 20px 18px 16px;
      border-radius: 28px;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }
    .journey-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }
    .journey h2 {
      margin: 0;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.6rem;
    }
    .journey-head em {
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 1.05rem;
    }
    .journey .muted { color: #5e5e56; }
    .trail {
      position: relative;
      display: grid;
      grid-template-columns: repeat(9, minmax(0, 1fr));
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .trail::before {
      content: "";
      position: absolute;
      top: 7px;
      left: 4%;
      right: 4%;
      height: 2px;
      background: rgba(22, 22, 20, 0.22);
    }
    .trail li { position: relative; z-index: 1; text-align: center; }
    .step-dot {
      display: block;
      width: 16px;
      height: 16px;
      margin: 0 auto 8px;
      border: 3px solid #f4f3ea;
      border-radius: 999px;
      background: #161614;
    }
    .trail li.drop .step-dot {
      background: #e8ff46;
      box-shadow: 0 0 0 3px #161614;
    }
    .step-n {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.2rem;
      line-height: 1;
    }
    .step-name, .step-pct { display: block; margin-top: 3px; color: #5e5e56; font-size: 0.72rem; }
    .trail li.drop .step-name { color: #161614; font-weight: 700; }
    .journey-note {
      margin: 14px 0 0;
      color: #161614;
      font-family: Georgia, serif;
      font-size: 1.05rem;
    }
    .journey-empty { min-height: 320px; }
    .empty-path {
      position: relative;
      display: flex;
      justify-content: space-between;
      width: min(100%, 440px);
      margin: 42px 0 28px;
    }
    .empty-path::before {
      content: "";
      position: absolute;
      top: 7px;
      left: 8px;
      right: 8px;
      height: 2px;
      background: rgba(22, 22, 20, 0.16);
    }
    .empty-path span {
      position: relative;
      width: 16px;
      height: 16px;
      border: 3px solid #f4f3ea;
      border-radius: 999px;
      background: #e8ff46;
      box-shadow: 0 0 0 2px #161614;
    }
    .empty-path span:nth-child(n + 3) {
      background: transparent;
      box-shadow: inset 0 0 0 2px rgba(22, 22, 20, 0.28);
    }
    .journey-empty .journey-note { margin: 0; font-size: 1.45rem; }
    .journey-empty .muted { max-width: 36ch; margin: 8px 0 0; }
    .compare-board { display: grid; gap: 14px; }
    .compare-grid {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(260px, 1fr);
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2px 2px 10px;
      margin: 0 -2px;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: 2px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .compare-grid::-webkit-scrollbar { display: none; }
    .compare-grid > .compare-card {
      scroll-snap-align: start;
      min-width: 0;
    }
    .compare-card {
      display: grid;
      gap: 12px;
      padding: 18px 16px 16px;
      border-radius: 24px;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }
    .compare-card.lead { background: #e8ff46; }
    .compare-card-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }
    .compare-card h3 {
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .compare-kicker {
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.86rem;
    }
    .compare-hero b {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 2.6rem;
      line-height: 0.9;
      letter-spacing: -0.05em;
    }
    .compare-hero span {
      display: block;
      margin-top: 4px;
      color: #5e5e56;
      font-size: 0.78rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .compare-card.lead .compare-hero span,
    .compare-card.lead .compare-kicker { color: #161614; }
    .compare-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px solid rgba(22, 22, 20, 0.14);
    }
    .compare-meta span {
      display: grid;
      gap: 2px;
      color: #5e5e56;
      font-size: 0.72rem;
    }
    .compare-meta strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
      color: #161614;
      line-height: 1;
    }
    .compare-bar {
      height: 6px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.12);
    }
    .compare-bar i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #161614;
    }
    .compare-card.lead .compare-bar { background: rgba(22, 22, 20, 0.16); }
    .compare-history-btn {
      width: 100%;
      min-height: 40px;
      margin: 2px 0 0;
      border-radius: 999px;
      background: #161614;
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-weight: 700;
    }
    .compare-card.lead .compare-history-btn {
      background: #161614;
      color: #e8ff46;
    }
    .click-history-list { display: grid; gap: 10px; }
    .click-history-item {
      display: grid;
      gap: 8px;
      padding: 12px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid rgba(22, 22, 20, 0.1);
    }
    .click-history-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }
    .click-history-top strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
    }
    .click-history-top span {
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .click-history-mark {
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.9rem;
    }
    .click-history-actions {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .click-history-actions::-webkit-scrollbar { display: none; }
    .click-history-actions button {
      width: auto;
      min-height: 32px;
      margin: 0;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid rgba(22, 22, 20, 0.16);
      background: #f4f3ea;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .click-history-actions button[aria-pressed="true"] {
      background: #e8ff46;
      border-color: #e8ff46;
    }
    .compare-note {
      margin: 0;
      color: #9a9a94;
      font-family: Georgia, serif;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .compare-empty {
      padding: 22px 18px;
      border-radius: 24px;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }
    .compare-empty h2 {
      margin: 0 0 6px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.25rem;
    }
    .compare-empty p {
      margin: 0;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.98rem;
      line-height: 1.4;
    }
    .contact-fab {
      position: fixed;
      right: 22px;
      bottom: 28px;
      z-index: 40;
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin: 0;
      padding: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
    }
    .contact-fab span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .contact-fab svg { display: block; }
    .contact-modal {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: grid;
      align-items: end;
      justify-items: center;
      padding: 0;
      background: rgba(0, 0, 0, 0.58);
    }
    .contact-modal[hidden] { display: none; }
    .contact-sheet {
      width: min(520px, 100%);
      max-height: min(88vh, 720px);
      overflow: auto;
      padding: 10px 18px 20px;
      border-radius: 28px 28px 0 0;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.45);
    }
    .contact-sheet-handle {
      display: block;
      width: 42px;
      height: 4px;
      margin: 4px auto 14px;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.2);
    }
    .contact-sheet-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .contact-sheet-top h2 {
      margin: 0;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.25rem;
    }
    .contact-sheet-top button {
      width: 36px;
      min-width: 36px;
      min-height: 36px;
      margin: 0;
      padding: 0;
      border-radius: 999px;
      background: #161614;
      color: #e8ff46;
      font-size: 1.2rem;
      line-height: 1;
    }
    .contact-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 0;
      border: 0;
      background: transparent;
    }
    .contact-form label {
      display: grid;
      gap: 4px;
      margin: 0;
      font-size: 0.78rem;
      color: #5e5e56;
    }
    .contact-form label.full { grid-column: 1 / -1; }
    .contact-form input,
    .contact-form select,
    .contact-form textarea {
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      border: 1px solid rgba(22, 22, 20, 0.14);
      border-radius: 14px;
      background: #fff;
      color: #161614;
      font: inherit;
    }
    .contact-form .form-choice {
      margin: 0;
      padding: 0;
    }
    .contact-form .form-choice button {
      background: #fff;
      border: 1px solid rgba(22, 22, 20, 0.16);
    }
    .contact-form .form-choice button[aria-pressed="true"] {
      background: #e8ff46;
      border-color: #e8ff46;
      color: #161614;
    }
    .contact-form .form-choice button[data-status="ya-no-respondio"][aria-pressed="true"],
    .contact-form .form-choice button[data-status="perdido"][aria-pressed="true"],
    .contact-form .form-choice button[data-value="llamada"][aria-pressed="true"] {
      background: #161614;
      border-color: #161614;
      color: #e8ff46;
    }
    .contact-form textarea { min-height: 78px; resize: vertical; }
    .contact-form button[type="submit"] {
      grid-column: 1 / -1;
      width: 100%;
      min-height: 48px;
      margin: 6px 0 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-weight: 700;
    }
    .contact-list {
      display: grid;
      gap: 0;
      padding: 6px 8px;
      border-radius: 24px;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
      overflow: hidden;
    }
    .contact-list.is-clients {
      gap: 12px;
      padding: 0;
      background: transparent;
      box-shadow: none;
      overflow: visible;
    }
    .contact-item {
      display: grid;
      gap: 8px;
      padding: 14px 12px;
      border-bottom: 1px solid rgba(22, 22, 20, 0.1);
      background: transparent;
      box-shadow: none;
    }
    .contact-item:last-child { border-bottom: 0; }
    .contact-item.client-card {
      gap: 12px;
      padding: 16px 14px 14px;
      border: 0;
      border-radius: 22px;
      background: #f4f3ea;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
    }
    .contact-item-top {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 12px;
    }
    .contact-avatar {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 999px;
      background: #161614;
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .contact-avatar[data-tone="2"] { background: #2a2a26; color: #f4f3ea; }
    .contact-avatar[data-tone="3"] { background: #e8ff46; color: #161614; }
    .contact-avatar[data-tone="4"] { background: #d9d5c4; color: #161614; }
    .contact-item-main {
      display: grid;
      gap: 5px;
      min-width: 0;
      padding-top: 2px;
    }
    .contact-item strong {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.08rem;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }
    .contact-item-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .contact-item-meta span {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 9px;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.07);
      color: #3d3d38;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .contact-item-line {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .contact-item p,
    .contact-item-note {
      margin: 0;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(22, 22, 20, 0.05);
      color: #3d3d38;
      font-family: Georgia, serif;
      font-size: 0.92rem;
      line-height: 1.4;
    }
    .contact-item-side {
      display: grid;
      justify-items: end;
      gap: 8px;
      flex: 0 0 auto;
    }
    .contact-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 2px;
    }
    .contact-action {
      width: 100%;
      min-height: 42px;
      margin: 0;
      border-radius: 999px;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
    }
    .contact-action.is-soft {
      border: 1px solid rgba(22, 22, 20, 0.14);
      background: #fff;
      color: #161614;
    }
    .contact-action.is-primary {
      border: 0;
      background: #e8ff46;
      color: #161614;
    }
    .contact-status {
      display: inline-flex;
      align-items: center;
      max-width: 132px;
      min-height: 28px;
      padding: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.01em;
    }
    .contact-status[data-status="nuevo"] { background: rgba(22, 22, 20, 0.08); }
    .contact-status[data-status="en-proceso"] { background: #e8ff46; }
    .contact-status[data-status="cerrado"] { background: #161614; color: #e8ff46; }
    .contact-status[data-status="ya-no-respondio"],
    .contact-status[data-status="perdido"] {
      background: rgba(22, 22, 20, 0.1);
      color: #5e5e56;
    }
    .contact-remove {
      display: grid;
      place-items: center;
      width: 30px;
      min-width: 30px;
      min-height: 30px;
      margin: 0;
      padding: 0;
      border-radius: 999px;
      background: transparent;
      color: #5e5e56;
      border: 0;
    }
    .contact-remove:hover { background: #161614; color: #e8ff46; }
    .contact-remove svg { display: block; }
    .contact-meta,
    .contact-chip { display: none; }
    .contact-status-row {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      gap: 6px;
      overflow-x: auto;
      padding: 2px 0 0;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .contact-status-row::-webkit-scrollbar { display: none; }
    .contact-status-row button {
      width: auto;
      min-height: 30px;
      margin: 0;
      padding: 0 11px;
      border-radius: 999px;
      border: 1px solid rgba(22, 22, 20, 0.14);
      background: #fff;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.74rem;
      font-weight: 600;
      white-space: nowrap;
      scroll-snap-align: start;
    }
    .contact-status-row button[aria-pressed="true"] {
      background: #e8ff46;
      border-color: #e8ff46;
      color: #161614;
    }
    .contact-status-row button[data-status="ya-no-respondio"][aria-pressed="true"],
    .contact-status-row button[data-status="perdido"][aria-pressed="true"] {
      background: #161614;
      border-color: #161614;
      color: #e8ff46;
    }
    .contact-role-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .contact-role-row button {
      width: 100%;
      min-height: 34px;
      margin: 0;
      padding: 0 8px;
      border-radius: 999px;
      border: 1px solid rgba(22, 22, 20, 0.14);
      background: #fff;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.74rem;
      font-weight: 700;
    }
    .contact-role-row button[aria-pressed="true"] {
      background: #161614;
      border-color: #161614;
      color: #e8ff46;
    }
    .contact-open-btn {
      width: 100%;
      min-height: 38px;
      margin: 2px 0 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-weight: 700;
    }
    @media (min-width: 761px) {
      .compare-board > .contact-list:not(.is-clients) {
        display: grid;
        gap: 10px;
        padding: 0;
        background: transparent;
        box-shadow: none;
        overflow: visible;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-item {
        position: relative;
        display: grid;
        grid-template-columns: minmax(220px, 1.15fr) minmax(0, 1fr) auto;
        grid-template-areas:
          "head note action"
          "head status action";
        gap: 10px 18px;
        align-items: center;
        padding: 14px 48px 14px 16px;
        border: 0;
        border-radius: 20px;
        background: #f4f3ea;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
      }
      .compare-board > .contact-list:not(.is-clients) .contact-item-top {
        grid-area: head;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-item-side {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 1;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-item-side .contact-status { display: none; }
      .compare-board > .contact-list:not(.is-clients) .contact-item-note {
        grid-area: note;
        margin: 0;
        padding: 10px 12px;
        align-self: stretch;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-status-row {
        grid-area: status;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        overflow: visible;
        padding: 0;
        scroll-snap-type: none;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-open-btn {
        grid-area: action;
        width: auto;
        min-width: 148px;
        min-height: 44px;
        margin: 0;
        padding: 0 18px;
        justify-self: end;
        align-self: center;
      }
      .compare-board > .contact-list:not(.is-clients) .contact-item:not(:has(.contact-item-note)) {
        grid-template-areas: "head status action";
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
      }
      .compare-board > .compare-empty { max-width: 480px; }
      .contact-list.is-clients {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        align-items: stretch;
      }
      .contact-list.is-clients .contact-item.client-card {
        position: relative;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 10px;
        height: 100%;
        padding: 16px 44px 14px 14px;
        border-radius: 22px;
      }
      .contact-list.is-clients .contact-item-top {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
        gap: 10px;
      }
      .contact-list.is-clients .contact-item-side {
        position: absolute;
        top: 14px;
        right: 12px;
      }
      .contact-list.is-clients .contact-item-side .contact-status {
        max-width: 96px;
        font-size: 0.68rem;
      }
      .contact-list.is-clients .contact-item strong { font-size: 1.05rem; }
      .contact-list.is-clients .contact-item-meta { gap: 5px; }
      .contact-list.is-clients .contact-item-meta span {
        min-height: 22px;
        padding: 0 8px;
        font-size: 0.68rem;
      }
      .contact-list.is-clients .contact-item-note {
        padding: 9px 10px;
        font-size: 0.88rem;
      }
      .contact-list.is-clients .contact-actions {
        margin-top: auto;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .contact-list.is-clients .contact-action {
        min-height: 40px;
        font-size: 0.88rem;
      }
      .contact-fab {
        right: 28px;
        bottom: 28px;
      }
      .contact-modal {
        align-items: center;
        justify-items: center;
        padding: 28px;
      }
      .contact-sheet {
        width: min(680px, calc(100vw - 56px));
        max-height: min(86vh, 760px);
        padding: 22px 24px 22px;
        border-radius: 28px;
        box-shadow: 0 28px 64px rgba(0, 0, 0, 0.52);
      }
      .contact-sheet-handle { display: none; }
      .contact-sheet-top {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(22, 22, 20, 0.1);
      }
      .contact-sheet-top h2 {
        font-size: 1.4rem;
        letter-spacing: -0.02em;
      }
      .contact-form {
        grid-template-columns: 1fr 1fr;
        gap: 12px 14px;
      }
      .contact-form label.full { grid-column: 1 / -1; }
      .contact-form .contact-status-row {
        display: flex;
        flex-wrap: wrap;
        overflow: visible;
        scroll-snap-type: none;
      }
      .contact-form button[type="submit"] {
        margin-top: 4px;
        min-height: 48px;
      }
      .account-board.is-desk {
        width: 100%;
        max-width: none;
        gap: 16px;
      }
      .camp-desk-hero {
        display: grid;
        gap: 10px;
        padding: 22px 24px;
        border-radius: 24px;
        background:
          linear-gradient(135deg, rgba(232, 255, 70, 0.12), transparent 42%),
          #1c1c19;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .camp-desk-hero-top {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .camp-desk-status {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0 12px;
        border-radius: 999px;
        background: #e8ff46;
        color: #161614;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .camp-desk-hero-top em {
        color: #9a9a94;
        font-family: Georgia, serif;
        font-size: 0.95rem;
      }
      .camp-desk-hero h2 {
        margin: 0;
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: clamp(1.6rem, 2.4vw, 2.15rem);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1.05;
      }
      .camp-desk-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;
      }
      .camp-desk-meta span {
        position: relative;
        color: #c8c8c2;
        font-family: Georgia, serif;
        font-size: 0.95rem;
      }
      .camp-desk-meta span + span::before {
        content: "·";
        position: absolute;
        left: -12px;
        color: #5e5e56;
      }
      .camp-desk-block {
        display: grid;
        gap: 14px;
        padding: 18px 20px 20px;
        border-radius: 24px;
        background: #1c1c19;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .camp-desk-block-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }
      .camp-desk-block-head h3 {
        margin: 0;
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: 1.05rem;
        letter-spacing: -0.02em;
      }
      .camp-desk-block-head em {
        color: #8d8d86;
        font-family: Georgia, serif;
        font-size: 0.88rem;
      }
      .camp-desk-primary,
      .camp-desk-traffic {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .camp-desk-kpi {
        display: grid;
        gap: 6px;
        align-content: start;
        min-height: 118px;
        padding: 16px 16px 14px;
        border-radius: 18px;
        background: #121210;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .camp-desk-kpi em {
        color: #9a9a94;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.7rem;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .camp-desk-kpi strong {
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: clamp(1.45rem, 2vw, 1.85rem);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
      }
      .camp-desk-kpi span {
        color: #6f6f68;
        font-family: Georgia, serif;
        font-size: 0.88rem;
      }
      .camp-desk-kpi.is-lead {
        background: #e8ff46;
        border-color: #e8ff46;
      }
      .camp-desk-kpi.is-lead em,
      .camp-desk-kpi.is-lead strong,
      .camp-desk-kpi.is-lead span { color: #161614; }
      .camp-desk-kpi.is-lead span { color: rgba(22, 22, 20, 0.62); }
      .camp-desk-bar {
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }
      .camp-desk-bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #e8ff46;
      }
      .camp-desk-secondary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .camp-desk-secondary > div {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #121210;
      }
      .camp-desk-secondary em {
        color: #9a9a94;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.72rem;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .camp-desk-secondary strong {
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: 1.05rem;
        letter-spacing: -0.02em;
      }
      .camp-desk-hero .camp-desk-amount {
        margin: 0;
        color: #e8ff46;
        font-family: Bahnschrift, sans-serif;
        font-size: clamp(2rem, 3.2vw, 2.8rem);
        font-weight: 700;
        letter-spacing: -0.05em;
        line-height: 0.95;
      }
      .camp-desk-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        align-items: start;
      }
      .camp-desk-include {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .camp-desk-include li {
        padding: 12px 14px;
        border-radius: 14px;
        background: #121210;
        color: #d7d7d0;
        font-family: Georgia, serif;
        font-size: 0.92rem;
        line-height: 1.35;
      }
      .camp-desk-steps {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
        counter-reset: camp-step;
      }
      .camp-desk-steps li {
        position: relative;
        display: grid;
        gap: 8px;
        padding: 14px;
        border-radius: 16px;
        background: #121210;
        color: #d7d7d0;
        font-family: Georgia, serif;
        font-size: 0.88rem;
        line-height: 1.4;
        counter-increment: camp-step;
      }
      .camp-desk-steps li::before {
        content: counter(camp-step);
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: #e8ff46;
        color: #161614;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
      }
      .camp-desk-form {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        align-items: end;
      }
      .camp-desk-form .account-refer-field { margin: 0; }
      .camp-desk-form .account-refer-actions {
        width: auto;
        min-width: 220px;
      }
      .camp-desk-form .account-wa-btn {
        width: 100%;
        min-height: 46px;
        margin: 0;
      }
      .camp-desk-offer {
        display: grid;
        gap: 14px;
        padding: 18px 20px;
        border-radius: 24px;
        background: #1c1c19;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .camp-desk-offer.is-lead {
        background:
          linear-gradient(160deg, rgba(232, 255, 70, 0.16), transparent 48%),
          #1c1c19;
        border-color: rgba(232, 255, 70, 0.28);
      }
      .camp-desk-offer h3 {
        margin: 0;
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: 1.15rem;
        letter-spacing: -0.02em;
      }
      .camp-desk-offer > p {
        margin: 0;
        color: #9a9a94;
        font-family: Georgia, serif;
        font-size: 0.92rem;
        line-height: 1.4;
      }
      .camp-desk-offer-prices {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .camp-desk-offer-prices > div {
        display: grid;
        gap: 4px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #121210;
      }
      .camp-desk-offer-prices > div.is-main {
        background: #e8ff46;
      }
      .camp-desk-offer-prices em {
        color: #9a9a94;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.68rem;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .camp-desk-offer-prices > div.is-main em,
      .camp-desk-offer-prices > div.is-main span { color: rgba(22, 22, 20, 0.7); }
      .camp-desk-offer-prices strong {
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: 1.2rem;
        letter-spacing: -0.02em;
      }
      .camp-desk-offer-prices > div.is-main strong { color: #161614; font-size: 1.45rem; }
      .camp-desk-offer-prices span {
        color: #6f6f68;
        font-family: Georgia, serif;
        font-size: 0.82rem;
      }
      .camp-desk-offer-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .camp-desk-offer-grid > div {
        padding: 12px 14px;
        border-radius: 14px;
        background: #121210;
      }
      .camp-desk-offer-grid strong {
        display: block;
        margin: 0 0 4px;
        color: #fff;
        font-family: Bahnschrift, sans-serif;
        font-size: 0.92rem;
      }
      .camp-desk-offer-grid p {
        margin: 0;
        color: #9a9a94;
        font-family: Georgia, serif;
        font-size: 0.84rem;
        line-height: 1.35;
      }
      .camp-desk-offer .account-wa-btn {
        width: auto;
        min-width: 220px;
        justify-self: start;
        margin: 0;
      }
      .camp-desk-offer .account-include-list {
        margin: 0;
      }
      .camp-desk-history .account-pay-list {
        gap: 8px;
      }
      .camp-desk-history .account-pay-row {
        padding: 14px 16px;
        border-radius: 16px;
        background: #121210;
        border: 0;
      }
    }
    .client-sheet h3 {
      margin: 18px 0 8px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
    }
    .client-sheet-person {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      margin: 4px 0 14px;
      padding: 12px;
      border-radius: 18px;
      background: rgba(22, 22, 20, 0.05);
    }
    .client-sheet-person strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
    }
    .client-sheet-summary {
      margin: 3px 0 0;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.9rem;
    }
    .client-timeline {
      position: relative;
      display: grid;
      gap: 0;
      margin: 4px 0 8px;
      padding: 4px 0 4px 2px;
      list-style: none;
    }
    .client-timeline::before {
      content: "";
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 17px;
      width: 2px;
      border-radius: 999px;
      background: linear-gradient(180deg, #e8ff46 0%, rgba(22, 22, 20, 0.18) 100%);
    }
    .client-timeline-item {
      position: relative;
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 10px;
      padding: 0 0 14px;
    }
    .client-timeline-item:last-child { padding-bottom: 0; }
    .client-timeline-dot {
      position: relative;
      z-index: 1;
      width: 14px;
      height: 14px;
      margin: 8px auto 0;
      border-radius: 999px;
      background: #e8ff46;
      box-shadow: 0 0 0 4px #f4f3ea, 0 0 0 6px rgba(22, 22, 20, 0.12);
    }
    .client-timeline-item[data-type="cotizacion"] .client-timeline-dot { background: #161614; }
    .client-timeline-item[data-type="rol"] .client-timeline-dot { background: #161614; box-shadow: 0 0 0 4px #f4f3ea, 0 0 0 6px #e8ff46; }
    .client-timeline-body {
      display: grid;
      gap: 4px;
      padding: 12px 14px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid rgba(22, 22, 20, 0.08);
      box-shadow: 0 8px 18px rgba(22, 22, 20, 0.05);
    }
    .client-timeline-body strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      letter-spacing: -0.01em;
    }
    .client-timeline-body p {
      margin: 0;
      color: #3d3d38;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    .client-timeline-body em {
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.82rem;
      font-style: italic;
    }
    .client-timeline-empty {
      margin: 8px 0 0;
      color: #5e5e56;
      font-family: Georgia, serif;
    }
    .quote-share-actions {
      display: grid;
      gap: 8px;
      margin: 0 0 14px;
    }
    .client-pdf-btn,
    .client-wa-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      min-height: 46px;
      margin: 0;
      padding: 0 16px;
      border-radius: 999px;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.98rem;
      font-weight: 700;
    }
    .client-pdf-btn {
      border: 0;
      background: #161614;
      color: #e8ff46;
    }
    .client-wa-btn {
      background: #25d366;
      color: #fff;
      text-decoration: none;
      border: 0;
    }
    .client-wa-btn svg { display: block; flex: 0 0 auto; }
    .client-wa-btn.is-soft-wa {
      background: #fff;
      color: #128c7e;
      border: 1px solid rgba(18, 140, 126, 0.35);
    }
    .quote-viewer-modal {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: grid;
      align-items: center;
      justify-items: center;
      padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
      background:
        radial-gradient(circle at 50% 0%, rgba(232, 255, 70, 0.14), transparent 42%),
        rgba(8, 8, 7, 0.82);
      backdrop-filter: blur(14px);
    }
    .quote-viewer-stage {
      width: min(100%, 740px);
      max-height: min(94vh, 980px);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 12px;
      padding: 14px;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 28%),
        #171714;
      border: 1px solid rgba(232, 255, 70, 0.12);
      box-shadow:
        0 28px 70px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }
    .quote-viewer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .quote-viewer-top h2 {
      margin: 0;
      color: #f4f3ea;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.14rem;
      letter-spacing: -0.02em;
    }
    .quote-viewer-top button {
      display: grid;
      place-items: center;
      width: 38px;
      min-height: 38px;
      margin: 0;
      border: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-size: 1.3rem;
      line-height: 1;
      box-shadow: 0 0 0 0 rgba(232, 255, 70, 0.35);
      transition: box-shadow 0.2s ease;
    }
    .quote-viewer-top button:hover {
      box-shadow: 0 0 0 6px rgba(232, 255, 70, 0.18);
    }
    .quote-viewer-scroll {
      overflow: auto;
      padding: 10px 6px;
      border-radius: 16px;
      background:
        radial-gradient(circle at top, rgba(232, 255, 70, 0.08), transparent 46%),
        #22221e;
    }
    .quote-sheet-frame {
      margin: 0 auto;
      overflow: hidden;
    }
    .quote-doc.quote-sheet {
      position: relative;
      display: grid;
      grid-template-columns: 148px minmax(0, 1fr);
      width: 640px;
      min-height: 900px;
      margin: 0 auto;
      overflow: hidden;
      border-radius: 2px;
      background: #fff;
      color: #161614;
      transform-origin: top center;
      box-shadow:
        0 24px 50px rgba(0, 0, 0, 0.42),
        0 0 0 1px rgba(255, 255, 255, 0.04);
    }
    .quote-sheet-shine {
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.28) 50%, transparent 65%);
      mix-blend-mode: soft-light;
    }
    .quote-sheet-side {
      display: grid;
      align-content: space-between;
      gap: 18px;
      padding: 20px 14px 18px;
      background: #161614;
      color: #f4f3ea;
      border-right: 3px solid #e8ff46;
    }
    .quote-sheet-brand {
      display: grid;
      justify-items: center;
      padding: 8px 0 4px;
    }
    .quote-sheet-logo-img {
      display: block;
      width: 108px;
      height: auto;
      object-fit: contain;
      image-rendering: auto;
    }
    .quote-sheet-side-block p,
    .quote-term p {
      display: block;
      margin: 4px 0 0;
      color: rgba(244, 243, 234, 0.72);
      font-family: Georgia, serif;
      font-size: 0.74rem;
      line-height: 1.4;
    }
    .quote-sheet-side-block em,
    .quote-sheet-terms em,
    .quote-sheet-to em,
    .quote-sheet-kicker {
      display: block;
      margin: 0 0 6px;
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.66rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .quote-sheet-side-block strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      letter-spacing: -0.02em;
    }
    .quote-sheet-terms {
      display: grid;
      gap: 10px;
    }
    .quote-term {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr);
      gap: 8px;
      align-items: start;
    }
    .quote-term span {
      width: 8px;
      height: 8px;
      margin-top: 4px;
      border-radius: 999px;
      background: #e8ff46;
      box-shadow: 0 0 0 3px rgba(232, 255, 70, 0.18);
    }
    .quote-term strong {
      display: block;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
    }
    .quote-sheet-main {
      display: grid;
      align-content: start;
      gap: 16px;
      padding: 26px 22px 20px;
      background: #fff;
    }
    .quote-sheet-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      padding-bottom: 14px;
      border-bottom: 1px solid #e8e6dc;
    }
    .quote-sheet-head h1 {
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.9rem;
      letter-spacing: -0.05em;
      line-height: 1;
    }
    .quote-sheet-meta {
      display: grid;
      gap: 5px;
      justify-items: end;
      text-align: right;
      color: #5e5e56;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .quote-sheet-status {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 10px;
      border-radius: 999px;
      background: #161614;
      color: #e8ff46;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .quote-sheet-to strong {
      display: block;
      margin-top: 2px;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .quote-sheet-to p {
      margin: 4px 0 0;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.86rem;
    }
    .quote-line-meta {
      display: block;
      margin-top: 4px;
      color: #6f6c62;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .quote-sheet-note {
      padding: 12px 14px;
      border-radius: 14px;
      background: #f7f5ea;
      border: 1px solid #ebe7d8;
    }
    .quote-sheet-note em {
      display: block;
      margin: 0 0 4px;
      color: #5e5e56;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .quote-sheet-note p {
      margin: 0;
      color: #3d3d38;
      font-family: Georgia, serif;
      font-size: 0.88rem;
      line-height: 1.4;
    }
    .quote-sheet-table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
    }
    .quote-sheet-table th {
      padding: 11px 12px;
      background: #161614;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-align: left;
      text-transform: uppercase;
    }
    .quote-sheet-table th:last-child,
    .quote-sheet-table td:last-child {
      width: 34%;
      text-align: right;
      white-space: nowrap;
    }
    .quote-sheet-table td {
      padding: 14px 12px;
      border-bottom: 1px solid #eeebe0;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      vertical-align: top;
    }
    .quote-sheet-table tr.is-alt td { background: #f6f5ef; }
    .quote-line-title {
      display: block;
      font-size: 0.98rem;
      letter-spacing: -0.02em;
    }
    .quote-line-detail {
      display: grid;
      gap: 2px;
      margin-top: 8px;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.82rem;
      line-height: 1.35;
    }
    .quote-line-detail em {
      display: block;
      color: #8a8678;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .quote-sheet-sum {
      display: grid;
      justify-items: end;
      gap: 8px;
      margin-top: 8px;
    }
    .quote-sheet-sum > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-width: 220px;
    }
    .quote-sheet-sum span {
      color: #5e5e56;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.82rem;
    }
    .quote-sheet-sum strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
    }
    .quote-sheet-sum .is-total {
      padding: 10px 12px;
      background: #161614;
      color: #e8ff46;
    }
    .quote-sheet-sum .is-total span { color: #d9d5c4; }
    .quote-sheet-foot {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #e8e6dc;
    }
    .quote-sheet-foot p {
      margin: 0;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.78rem;
    }
    .quote-sheet-foot strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.82rem;
    }
    .quote-viewer-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .quote-viewer-actions.is-single { grid-template-columns: 1fr; }
    @media (max-width: 720px) {
      .quote-viewer-stage { padding: 12px; gap: 10px; border-radius: 22px; }
      .quote-viewer-scroll { padding: 6px 0; }
    }
    .client-history,
    .quote-list {
      display: grid;
      gap: 8px;
      margin-bottom: 10px;
    }
    .client-history-item,
    .quote-card {
      display: grid;
      gap: 4px;
      padding: 12px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid rgba(22, 22, 20, 0.1);
    }
    .client-history-item strong,
    .quote-card strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
    }
    .client-history-item p,
    .quote-card em {
      margin: 0;
      color: #3d3d38;
      font-size: 0.88rem;
      line-height: 1.35;
    }
    .client-history-item em,
    .quote-card p {
      margin: 0;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.84rem;
    }
    .quote-form { margin-top: 4px; }
    .quote-choice-field { gap: 8px; }
    .quote-option-list {
      display: grid;
      gap: 0;
      margin: 0;
      overflow: hidden;
      border: 1px solid rgba(22, 22, 20, 0.12);
      border-radius: 18px;
      background: #fff;
    }
    .quote-option {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 46px;
      margin: 0;
      padding: 0 14px;
      border: 0;
      border-bottom: 1px solid rgba(22, 22, 20, 0.08);
      border-radius: 0;
      background: transparent;
      color: #161614;
      text-align: left;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .quote-option:last-child { border-bottom: 0; }
    .quote-option span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .quote-option em {
      width: 18px;
      height: 18px;
      border: 1.5px solid rgba(22, 22, 20, 0.22);
      border-radius: 999px;
      background: transparent;
    }
    .quote-option[aria-selected="true"] {
      background: rgba(232, 255, 70, 0.35);
      color: #161614;
    }
    .quote-option[aria-selected="true"] em {
      border-color: #161614;
      background: #e8ff46;
      box-shadow: inset 0 0 0 4px #161614;
    }
    .quote-price-box {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      min-height: 48px;
      padding: 0 12px 0 0;
      border: 1px solid rgba(22, 22, 20, 0.14);
      border-radius: 14px;
      background: #fff;
      overflow: hidden;
    }
    .quote-price-box input {
      border: 0;
      border-radius: 14px;
      background: transparent;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .quote-price-box span {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.07);
      color: #3d3d38;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.74rem;
      font-weight: 700;
    }
    .quote-status-flow {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      align-items: start;
      gap: 0;
      overflow-x: auto;
      padding: 4px 2px 8px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .quote-status-flow::-webkit-scrollbar { display: none; }
    .quote-status-flow button[data-step] {
      display: grid;
      justify-items: center;
      gap: 6px;
      width: 74px;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: #5e5e56;
      font: inherit;
    }
    .quote-status-flow button[data-step] span {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      border: 1px solid rgba(22, 22, 20, 0.16);
      background: #fff;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .quote-status-flow button[data-step] em {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-style: normal;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
      white-space: normal;
    }
    .quote-status-flow button.is-done span,
    .quote-status-flow button.is-current span {
      background: #e8ff46;
      border-color: #e8ff46;
      color: #161614;
    }
    .quote-status-flow button.is-current {
      color: #161614;
    }
    .quote-status-flow button.is-done span {
      background: #161614;
      border-color: #161614;
      color: #e8ff46;
    }
    .quote-status-bridge {
      width: 18px;
      height: 2px;
      margin-top: 14px;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.16);
    }
    .quote-status-reject {
      align-self: center;
      min-height: 34px;
      margin: 8px 0 0 8px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid rgba(22, 22, 20, 0.16);
      background: #fff;
      color: #5e5e56;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.74rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .quote-status-reject[aria-pressed="true"] {
      background: #161614;
      border-color: #161614;
      color: #e8ff46;
    }
    .quote-card-note {
      display: block;
      margin-top: 2px;
      padding: 8px 10px;
      border-radius: 12px;
      background: rgba(22, 22, 20, 0.05);
      color: #3d3d38;
      font-family: Georgia, serif;
      font-size: 0.86rem;
      line-height: 1.35;
    }
    .quote-form textarea[name="descripcion"],
    .quote-form textarea[name="nota"] {
      min-height: 88px;
    }
    .chart-svg { display: block; width: 100%; height: 220px; }
    .content { min-width: 0; margin-left: 300px; padding: 16px 28px 48px 12px; }
    .content > .top,
    .content > #vista {
      width: 100%;
      max-width: none;
    }
    .board {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.85fr);
      gap: 16px;
      width: 100%;
    }
    .tabs button.nav-desk-only { display: flex; }
    .tabs button.nav-mobile-only { display: none; }
    .account-board,
    .account-board.is-admin-edit {
      width: min(100%, 820px);
    }
    .panel-card, .catalog, .promo {
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 22px;
      background: #1c1c19;
    }
    .panel-card { padding: 18px 18px 8px; }
    .panel-card.chart-card {
      background: #f4f3ea;
      border-color: transparent;
      padding: 20px 18px 14px;
    }
    .chart-card h2 { margin: 0 0 4px; color: #161614; }
    .chart-card .muted { color: #5e5e56; }
    .chart-line {
      fill: none;
      stroke: #161614;
      stroke-width: 5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .chart-area { fill: #e8ff46; }
    .chart-dot { fill: #161614; stroke: #f4f3ea; stroke-width: 2; }
    .top-pages { padding-bottom: 16px; }
    .top-pages h2 { margin: 0; }
    .top-kicker {
      margin: 2px 0 14px;
      color: #e8ff46;
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 1.05rem;
    }
    .rank { list-style: none; margin: 0; padding: 0; }
    .rank li { margin: 0 0 8px; }
    .rank button {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      width: 100%;
      min-height: 0;
      margin: 0;
      padding: 10px;
      border-radius: 16px;
      background: #111;
      color: #fff;
      font-weight: 400;
      text-align: left;
    }
    .rank button:hover { background: #161614; }
    .rank-no {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: #1c1c19;
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
    }
    .rank li:first-child .rank-no { background: #e8ff46; color: #161614; }
    .rank-body b { display: block; margin: 0 0 6px; font-size: 0.98rem; }
    .rank-meta { display: block; margin-top: 5px; color: #9a9a94; font-size: 0.78rem; }
    .rank-track { display: block; height: 6px; overflow: hidden; border-radius: 999px; background: #2a2a26; }
    .rank-fill { display: block; height: 100%; width: 0; border-radius: inherit; background: rgba(232, 255, 70, 0.5); transform-origin: left center; }
    .rank li:first-child .rank-fill { background: #e8ff46; }
    .rank-count { text-align: right; }
    .rank-count strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.35rem;
      line-height: 1;
      color: #e8ff46;
    }
    .rank-count small { color: #9a9a94; font-size: 0.72rem; }
    .pages-board { display: grid; gap: 14px; }
    @media (min-width: 761px) {
      .pages-board {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: stretch;
      }
      .pages-board .page-sheet {
        grid-template-columns: auto minmax(0, 1fr);
        grid-template-areas:
          "no name"
          "no rate"
          "count count"
          "bar bar"
          "facts facts";
        height: 100%;
        align-content: start;
      }
      .pages-board .page-count { text-align: left; }
      .pages-board .page-count strong { font-size: 2.55rem; }
      .pages-board .page-name { font-size: 1.35rem; line-height: 1.05; }
      .pages-board .page-rate { font-size: 0.95rem; }
    }
    .page-sheet {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        "no name count"
        "no rate count"
        "bar bar bar"
        "facts facts facts";
      gap: 2px 16px;
      width: 100%;
      min-height: 0;
      margin: 0;
      padding: 18px 20px 16px;
      border: 0;
      border-radius: 28px;
      background: #f4f3ea;
      color: #161614;
      font-weight: 400;
      text-align: left;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }
    .page-sheet.lead { background: #e8ff46; }
    .page-sheet:hover { background: #fffdf4; }
    .page-sheet.lead:hover { background: #e8ff46; }
    .page-no {
      grid-area: no;
      align-self: start;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.35rem;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .page-name {
      grid-area: name;
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.7rem;
      line-height: 0.95;
      letter-spacing: -0.03em;
    }
    .page-rate {
      grid-area: rate;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 1.05rem;
    }
    .page-sheet.lead .page-rate { color: #161614; }
    .page-count { grid-area: count; text-align: right; }
    .page-count strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 3rem;
      line-height: 0.8;
      letter-spacing: -0.05em;
    }
    .page-count small {
      display: block;
      margin-top: 4px;
      color: #5e5e56;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .page-sheet.lead .page-count small { color: #161614; }
    .page-bar {
      grid-area: bar;
      display: block;
      height: 8px;
      margin-top: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(22, 22, 20, 0.12);
    }
    .page-bar span {
      display: block;
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: #161614;
      transform-origin: left center;
    }
    .page-facts {
      grid-area: facts;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .page-facts span {
      display: block;
      padding-top: 8px;
      border-top: 1px solid rgba(22, 22, 20, 0.16);
    }
    .page-facts b {
      display: block;
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.35rem;
      line-height: 1;
    }
    .page-facts span span {
      padding: 0;
      border: 0;
      color: #5e5e56;
      font-size: 0.78rem;
    }
    .page-sheet.lead .page-facts span span { color: #161614; }
    .catalogs, .promos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .catalog, .promo { padding: 18px; }
    .catalog em, .promo em { display: block; margin-bottom: 8px; color: #e8ff46; font-family: Georgia, serif; }
    .catalog-board { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 16px; align-items: start; }
    .catalog-pages { display: grid; gap: 8px; }
    .product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; grid-column: 2; }
    .product-form { grid-column: 1 / -1; display: grid; gap: 10px; padding: 18px; border-radius: 22px; background: #f4f3ea; color: #161614; }
    .product-form h2, .product-form p { margin: 0; }
    .product-form label { display: grid; gap: 4px; font-size: 13px; }
    .product-form label[hidden] { display: none; }
    .product-form input, .product-form textarea, .product-form select { width: 100%; border: 1px solid #d8d6cc; border-radius: 12px; padding: 10px 12px; background: #fff; color: #161614; font: inherit; }
    .product-form fieldset { display: flex; gap: 14px; border: 0; margin: 0; padding: 0; }
    .product-form fieldset label { display: flex; align-items: center; gap: 6px; }
    .product-card { display: grid; gap: 6px; padding: 12px; border-radius: 22px; background: #161614; border: 1px solid rgba(255,255,255,.08); }
    .product-card img { width: 100%; height: 150px; object-fit: cover; border-radius: 16px; }
    .product-card h3, .product-card p { margin: 0; }
    .product-card strong { color: #e8ff46; }
    .product-form .actions button.secondary, .product-card .actions button.secondary { background: transparent; color: inherit; border: 1px solid currentColor; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .actions a, .actions button, .promo-form button {
      width: auto;
      min-height: 40px;
      margin: 0;
      padding: 0 14px;
    }
    .actions a {
      display: inline-grid;
      place-items: center;
      border-radius: 999px;
      background: transparent;
      color: #e8ff46;
      border: 1px solid rgba(232, 255, 70, 0.7);
      font-weight: 700;
      text-decoration: none;
    }
    .promo-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
      padding: 18px;
      border-radius: 22px;
      background: #1c1c19;
    }
    .promo-form label { margin: 0; }
    .promo-form .full { grid-column: 1 / -1; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 12px 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: left; }
    .table th { color: #9a9a94; font-weight: 600; font-size: 0.82rem; }
    .desk {
      padding: 22px 20px;
      border-radius: 28px;
      background: #f4f3ea;
      color: #161614;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }
    .desk .muted, .desk .table th { color: #5e5e56; }
    .desk .table td { color: #161614; border-bottom-color: rgba(22, 22, 20, 0.12); }
    .account-board {
      display: grid;
      gap: 14px;
    }
    .account-board .stats { margin: 0; }
    .account-board-panel {
      padding: 16px;
      border-radius: 22px;
      background: #1c1c19;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .account-board-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
    }
    .account-board-head h2 {
      margin: 0;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .account-board-head em {
      color: #e8ff46;
      font-family: Georgia, serif;
      font-size: 0.92rem;
    }
    .account-board-facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .account-board-facts > div {
      padding: 12px;
      border-radius: 14px;
      background: #121210;
    }
    .account-board-facts em {
      display: block;
      margin: 0 0 4px;
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .account-board-facts strong {
      display: block;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }
    .account-back-btn {
      width: 100%;
      min-height: 48px;
      margin: 4px 0 0;
      border: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      font-weight: 700;
      box-shadow: 0 10px 24px rgba(232, 255, 70, 0.22);
    }
    .account-back-btn:hover { filter: brightness(1.04); }
    .account-board.is-admin-edit {
      gap: 12px;
      padding-bottom: 12px;
    }
    .account-edit-form {
      display: grid;
      gap: 12px;
    }
    .account-edit-panel {
      display: grid;
      gap: 14px;
      padding: 14px;
      border-radius: 24px;
      background:
        linear-gradient(180deg, rgba(232, 255, 70, 0.08), transparent 42%),
        #1c1c19;
      border: 1px solid rgba(232, 255, 70, 0.18);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
    }
    .account-edit-banner {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 16px;
      background: #e8ff46;
      color: #161614;
    }
    .account-edit-banner strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
      letter-spacing: -0.02em;
    }
    .account-edit-banner span {
      color: rgba(22, 22, 20, 0.72);
      font-family: Georgia, serif;
      font-size: 0.82rem;
      text-align: right;
    }
    .account-edit-block {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 18px;
      background: #121210;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .account-edit-block.is-money {
      border-color: rgba(232, 255, 70, 0.22);
      background:
        linear-gradient(135deg, rgba(232, 255, 70, 0.1), transparent 55%),
        #121210;
    }
    .account-edit-block-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }
    .account-edit-block-head h2 {
      margin: 0;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.08rem;
      letter-spacing: -0.02em;
    }
    .account-edit-block-head em {
      color: #e8ff46;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .account-edit-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr 1fr;
    }
    .account-edit-grid.is-three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .account-edit-field {
      display: grid;
      gap: 7px;
    }
    .account-edit-field.is-full {
      grid-column: 1 / -1;
    }
    .account-edit-field.is-money input {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      color: #e8ff46;
    }
    .account-edit-field > span {
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .account-edit-field input {
      width: 100%;
      min-height: 52px;
      padding: 0 14px;
      border: 1.5px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      background: #22221e;
      color: #fff;
      caret-color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.02rem;
      letter-spacing: -0.01em;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }
    .account-edit-field input:hover {
      border-color: rgba(232, 255, 70, 0.45);
      background: #2a2a25;
    }
    .account-edit-field input:focus {
      outline: none;
      border-color: #e8ff46;
      background: #2a2a25;
      box-shadow: 0 0 0 3px rgba(232, 255, 70, 0.22);
    }
    .account-edit-check {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(232, 255, 70, 0.08);
      border: 1px solid rgba(232, 255, 70, 0.2);
      color: #f2f2ea;
      font-family: Georgia, serif;
      font-size: 0.95rem;
    }
    .account-edit-check input {
      width: 18px;
      height: 18px;
      accent-color: #e8ff46;
    }
    .account-edit-live {
      margin-top: 2px;
    }
    .account-edit-calc {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .account-edit-calc > div {
      padding: 14px 12px;
      border-radius: 16px;
      background: #0c0c0a;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .account-edit-calc > div.is-lead {
      grid-column: 1 / -1;
      background: #e8ff46;
      border-color: transparent;
      color: #161614;
    }
    .account-edit-calc em {
      display: block;
      margin: 0 0 4px;
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .account-edit-calc > div.is-lead em { color: rgba(22, 22, 20, 0.62); }
    .account-edit-calc strong {
      display: block;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      letter-spacing: -0.03em;
      line-height: 1.15;
    }
    .account-edit-calc > div.is-lead strong {
      color: #161614;
      font-size: 1.55rem;
    }
    .account-edit-actions {
      position: sticky;
      bottom: 8px;
      z-index: 5;
      padding-top: 2px;
    }
    @media (max-width: 760px) {
      .account-edit-actions {
        bottom: calc(78px + env(safe-area-inset-bottom));
      }
    }
    .account-edit-save {
      width: 100%;
      min-height: 54px;
      border: 0;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      box-shadow: 0 12px 28px rgba(232, 255, 70, 0.28);
    }
    .account-edit-save:hover { filter: brightness(1.04); }
    .account-edit-save.is-saved {
      background: #161614;
      color: #e8ff46;
      box-shadow: none;
      border: 1px solid rgba(232, 255, 70, 0.45);
    }
    .account-edit-mini {
      margin-top: 6px;
      padding: 7px 12px;
      border: 1px solid rgba(232, 255, 70, 0.35);
      border-radius: 999px;
      background: rgba(232, 255, 70, 0.08);
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .account-history-open {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 16px 16px;
      border: 1px solid rgba(232, 255, 70, 0.28);
      border-radius: 20px;
      background:
        linear-gradient(135deg, rgba(232, 255, 70, 0.16), transparent 55%),
        #1c1c19;
      color: #fff;
      text-align: left;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
    }
    .account-history-open strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
    }
    .account-history-open em {
      display: block;
      margin-top: 4px;
      color: #b7b7ae;
      font-family: Georgia, serif;
      font-size: 0.9rem;
      font-style: italic;
    }
    .account-history-open-cta {
      flex: 0 0 auto;
      padding: 10px 14px;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .account-history-open.is-dark {
      background:
        linear-gradient(135deg, rgba(232, 255, 70, 0.12), transparent 55%),
        #161614;
    }
    .account-board.is-pagos {
      gap: 14px;
    }
    .pay-hero {
      position: relative;
      overflow: hidden;
      padding: 20px 18px 18px;
      border-radius: 26px;
      background:
        radial-gradient(circle at 88% 0%, rgba(232, 255, 70, 0.28), transparent 42%),
        linear-gradient(160deg, #24241f 0%, #121210 70%);
      border: 1px solid rgba(232, 255, 70, 0.24);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
      color: #fff;
    }
    .pay-hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .pay-hero-top span {
      color: #b7b7ae;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .pay-hero-top em {
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(232, 255, 70, 0.16);
      color: #e8ff46;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .pay-hero-amount {
      display: block;
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: clamp(1.8rem, 7vw, 2.35rem);
      letter-spacing: -0.04em;
      line-height: 1;
      color: #e8ff46;
    }
    .pay-hero-concept {
      margin: 10px 0 0;
      color: #f2f2ea;
      font-family: Georgia, serif;
      font-size: 1.05rem;
      line-height: 1.35;
    }
    .pay-hero-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
    }
    .pay-hero-meta > div {
      padding: 12px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .pay-hero-meta em {
      display: block;
      margin: 0 0 4px;
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .pay-hero-meta strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.98rem;
      letter-spacing: -0.02em;
    }
    .pay-add-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 16px;
      border: 1px solid rgba(232, 255, 70, 0.35);
      border-radius: 22px;
      background:
        linear-gradient(135deg, rgba(232, 255, 70, 0.18), transparent 58%),
        #1c1c19;
      color: #fff;
      text-align: left;
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
    }
    .pay-add-ico {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .pay-add-btn strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
    }
    .pay-add-btn em {
      display: block;
      margin-top: 3px;
      color: #b7b7ae;
      font-family: Georgia, serif;
      font-size: 0.9rem;
    }
    .account-edit-panel.is-history {
      gap: 12px;
    }
    .pay-timeline {
      position: relative;
      display: grid;
      gap: 0;
      padding-left: 4px;
    }
    .pay-timeline::before {
      content: "";
      position: absolute;
      top: 12px;
      bottom: 12px;
      left: 15px;
      width: 2px;
      background: linear-gradient(180deg, #e8ff46, rgba(232, 255, 70, 0.08));
    }
    .pay-timeline-item {
      position: relative;
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: start;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .pay-timeline-item:last-child { border-bottom: 0; }
    .pay-timeline-dot {
      width: 12px;
      height: 12px;
      margin: 6px 0 0 8px;
      border-radius: 999px;
      background: #e8ff46;
      box-shadow: 0 0 0 4px rgba(232, 255, 70, 0.14);
    }
    .pay-timeline-main strong {
      display: block;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.98rem;
      letter-spacing: -0.02em;
    }
    .pay-timeline-main p {
      margin: 4px 0 0;
      color: #9a9a94;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .pay-timeline-side {
      display: grid;
      justify-items: end;
      gap: 6px;
    }
    .pay-timeline-side > strong {
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }
    .pay-modal-kicker {
      margin: 0 0 8px;
      color: #7a776c;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .pay-history-sheet {
      max-height: min(88vh, 760px);
    }
    .pay-history-body {
      display: grid;
      gap: 16px;
      padding: 4px 2px 8px;
      overflow: auto;
    }
    .pay-history-lead {
      margin: 0 0 12px;
      color: #5e5e56;
      font-family: Georgia, serif;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .pay-history-form {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 18px;
      background: #f4f3ea;
      border: 1px solid rgba(22, 22, 20, 0.08);
    }
    .pay-history-form .account-edit-field > span { color: #7a776c; }
    .pay-history-form .account-edit-field input {
      background: #fff;
      border-color: rgba(22, 22, 20, 0.14);
      color: #161614;
      caret-color: #161614;
    }
    .pay-history-form .account-edit-field.is-money input { color: #161614; }
    .pay-history-form .account-edit-field input:focus {
      border-color: #161614;
      box-shadow: 0 0 0 3px rgba(232, 255, 70, 0.45);
      background: #fff;
    }
    .pay-history-form .account-edit-save {
      margin-top: 2px;
    }
    .pay-history-list-wrap {
      display: grid;
      gap: 10px;
    }
    .pay-history-list-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }
    .pay-history-list-head strong {
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      color: #161614;
    }
    .pay-history-list-head span {
      color: #7a776c;
      font-family: Georgia, serif;
      font-size: 0.9rem;
    }
    .pay-history-sheet .account-pay-list {
      background: #fff;
      border-radius: 16px;
      border: 1px solid rgba(22, 22, 20, 0.08);
      padding: 4px 14px;
    }
    .pay-history-sheet .account-pay-row {
      border-bottom-color: rgba(22, 22, 20, 0.08);
    }
    .pay-history-sheet .account-pay-row strong { color: #161614; }
    .pay-history-sheet .account-pay-row p { color: #7a776c; }
    .pay-history-sheet .account-edit-mini {
      border-color: rgba(22, 22, 20, 0.2);
      background: #161614;
      color: #e8ff46;
    }
    @media (max-width: 520px) {
      .account-edit-grid,
      .account-edit-grid.is-three { grid-template-columns: 1fr; }
      .account-edit-banner { flex-direction: column; align-items: flex-start; }
      .account-edit-banner span { text-align: left; }
    }
    .account-wa-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 48px;
      margin-top: 4px;
      padding: 0 16px;
      border-radius: 999px;
      background: #25d366;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
    }
    .account-wa-btn.is-soft {
      background: #161614;
      color: #e8ff46;
      border: 1px solid rgba(232, 255, 70, 0.45);
    }
    .account-wa-btn:hover { filter: brightness(1.05); }
    .account-desk {
      display: grid;
      gap: 12px;
    }
    .account-desk .account-back-btn {
      margin-top: 4px;
    }
    .account-desk-card {
      display: grid;
      gap: 8px;
      justify-items: start;
      padding: 18px 16px;
      border-radius: 20px;
      background: #fff;
      border: 1px solid rgba(22, 22, 20, 0.08);
    }
    .account-desk-hero {
      background:
        linear-gradient(135deg, rgba(232, 255, 70, 0.28), transparent 48%),
        #fff;
    }
    .account-desk-card h2 {
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.35rem;
      letter-spacing: -0.03em;
    }
    .account-desk-card p {
      margin: 0;
      color: #3d3d38;
      font-family: Georgia, serif;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .account-desk-kicker {
      display: block;
      margin: 0 0 4px;
      color: #7a776c;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .account-desk-amount {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 2rem;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .account-desk-next {
      background: #161614;
      color: #f4f3ea;
      border-color: transparent;
    }
    .account-desk-next .account-desk-kicker { color: #e8ff46; }
    .account-desk-next p { color: rgba(244, 243, 234, 0.82); }
    .account-desk-next .muted { color: rgba(244, 243, 234, 0.58); }
    .account-desk-next .account-desk-amount { color: #e8ff46; }
    .account-fact-grid,
    .account-metric-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: 100%;
    }
    .account-fact-grid > div,
    .account-metric-grid > div {
      padding: 12px;
      border-radius: 14px;
      background: #f6f5ef;
    }
    .account-fact-grid em,
    .account-metric-grid em {
      display: block;
      margin: 0 0 4px;
      color: #7a776c;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .account-fact-grid strong,
    .account-metric-grid strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.95rem;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }
    .account-metric-grid strong { font-size: 1.25rem; }
    .account-pay-list {
      display: grid;
      gap: 0;
      width: 100%;
    }
    .account-pay-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(22, 22, 20, 0.08);
    }
    .account-pay-row:last-child { border-bottom: 0; padding-bottom: 0; }
    .account-pay-row strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.92rem;
      letter-spacing: -0.02em;
    }
    .account-pay-row p {
      margin: 3px 0 0;
      color: #6f6c62;
      font-family: Georgia, serif;
      font-size: 0.8rem;
    }
    .account-pay-side {
      display: grid;
      justify-items: end;
      gap: 6px;
    }
    .account-pay-side strong {
      font-size: 0.95rem;
      white-space: nowrap;
    }
    .account-pay-list.is-dark .account-pay-row {
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }
    .account-pay-list.is-dark .account-pay-row strong { color: #fff; }
    .account-pay-list.is-dark .account-pay-row p { color: #9a9a94; }
    .account-pay-badge {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 10px;
      border-radius: 999px;
      background: #e8ff46;
      color: #161614;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .account-pay-badge.is-soft {
      background: #161614;
      color: #e8ff46;
      border: 1px solid rgba(232, 255, 70, 0.35);
    }
    .account-pay-badge.is-warn {
      background: #3a2a12;
      color: #ffd27a;
      border: 1px solid rgba(255, 210, 122, 0.4);
    }
    .refer-admin-list {
      display: grid;
      gap: 10px;
    }
    .refer-admin-item {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 18px;
      background: #121210;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .refer-admin-main strong {
      display: block;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      letter-spacing: -0.02em;
    }
    .refer-admin-main p {
      margin: 4px 0 0;
      color: #9a9a94;
      font-family: Georgia, serif;
      font-size: 0.9rem;
    }
    .refer-status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .refer-status-chip {
      min-height: 36px;
      padding: 0 12px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      background: #0c0c0a;
      color: #d8d8d0;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .refer-status-chip.is-on[data-status="proceso"] {
      background: #161614;
      border-color: rgba(232, 255, 70, 0.45);
      color: #e8ff46;
    }
    .refer-status-chip.is-on[data-status="cerrado"] {
      background: #e8ff46;
      border-color: #e8ff46;
      color: #161614;
    }
    .refer-status-chip.is-on[data-status="no-cerro"] {
      background: #3a2a12;
      border-color: rgba(255, 210, 122, 0.55);
      color: #ffd27a;
    }
    .license-hero {
      position: relative;
      overflow: hidden;
      padding: 20px 18px 18px;
      border-radius: 26px;
      background:
        radial-gradient(circle at 12% 0%, rgba(232, 255, 70, 0.24), transparent 40%),
        linear-gradient(155deg, #252520 0%, #121210 72%);
      border: 1px solid rgba(232, 255, 70, 0.24);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
      color: #fff;
    }
    .license-hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .license-hero-top span {
      color: #b7b7ae;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .license-hero-top em {
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(232, 255, 70, 0.16);
      color: #e8ff46;
      font-family: Georgia, serif;
      font-size: 0.88rem;
    }
    .license-hero-plan {
      display: block;
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: clamp(1.55rem, 6vw, 2rem);
      letter-spacing: -0.04em;
      line-height: 1.05;
      color: #e8ff46;
    }
    .license-hero-account {
      margin: 8px 0 0;
      color: #f2f2ea;
      font-family: Georgia, serif;
      font-size: 1rem;
      line-height: 1.35;
    }
    .license-hero-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
    }
    .license-hero-meta > div {
      padding: 12px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .license-hero-meta em {
      display: block;
      margin: 0 0 4px;
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.64rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .license-hero-meta strong {
      display: block;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.98rem;
      letter-spacing: -0.02em;
    }
    .account-edit-panel.is-license-form {
      gap: 12px;
      padding-top: 12px;
    }
    .license-edit-form {
      display: grid;
      gap: 12px;
    }
    .license-pricing {
      border-color: rgba(232, 255, 70, 0.22);
    }
    .license-price-stack {
      display: grid;
      gap: 8px;
    }
    .license-price-stack > div {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #121210;
    }
    .license-price-stack em {
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .license-price-stack strong {
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1rem;
      letter-spacing: -0.02em;
      text-align: right;
    }
    .license-price-stack .is-discount strong { color: #ffd27a; }
    .license-price-stack .is-muted strong { color: #7a776c; }
    .license-price-stack .is-final {
      background: #e8ff46;
    }
    .license-price-stack .is-final em { color: rgba(22, 22, 20, 0.62); }
    .license-price-stack .is-final strong {
      color: #161614;
      font-size: 1.25rem;
    }
    .license-price-stack.is-admin > div {
      background: #0c0c0a;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .license-price-stack.is-admin .is-final {
      background: #e8ff46;
      border-color: transparent;
    }
    .account-refer-field {
      display: grid;
      gap: 6px;
      width: 100%;
      margin: 0 0 10px;
      color: #c8c8c2;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.82rem;
    }
    .account-refer-field input {
      width: 100%;
      min-height: 46px;
      margin: 0;
      padding: 0 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      background: #121210;
      color: #fff;
      font: inherit;
    }
    .account-refer-field input:focus {
      outline: none;
      border-color: #e8ff46;
    }
    .account-refer-actions { width: 100%; }
    .account-refer-counts {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .account-refer-counts .stat {
      gap: 6px;
      padding: 10px 8px 12px;
      text-align: center;
      align-items: center;
    }
    .account-refer-counts .stat-top {
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    .account-refer-counts .stat-icon {
      width: 34px;
      height: 34px;
      border-radius: 999px;
    }
    .account-refer-counts .stat b { font-size: 1.25rem; }
    .account-refer-counts .stat-label { font-size: 0.72rem; }
    .account-include-list {
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 8px;
    }
    .account-include-list li {
      position: relative;
      padding: 10px 12px 10px 28px;
      border-radius: 12px;
      background: #f6f5ef;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.9rem;
    }
    .account-include-list li::before {
      content: "";
      position: absolute;
      left: 12px;
      top: 50%;
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #e8ff46;
      box-shadow: 0 0 0 3px rgba(22, 22, 20, 0.9);
      transform: translateY(-50%);
    }
    .account-include-list.is-dark li {
      background: #121210;
      color: #f4f3ea;
    }
    .account-include-list.is-dark li::before {
      box-shadow: 0 0 0 3px rgba(232, 255, 70, 0.18);
    }
    .account-board-note {
      margin: 12px 0 0;
      color: #bdbdb6;
      font-family: Georgia, serif;
      font-size: 0.9rem;
      line-height: 1.45;
    }
    .account-board-link {
      color: #e8ff46;
      text-decoration: none;
    }
    .account-board-link:hover { text-decoration: underline; }
    .account-upgrade {
      display: grid;
      gap: 12px;
      padding: 16px;
      border-radius: 22px;
      background: #1c1c19;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .account-upgrade-top h2 {
      margin: 0;
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .account-upgrade-top p {
      margin: 6px 0 0;
      color: #bdbdb6;
      font-family: Georgia, serif;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    .account-upgrade.is-basic {
      border-color: rgba(255, 255, 255, 0.1);
    }
    .account-upgrade.is-basic .account-upgrade-prices {
      grid-template-columns: 1fr;
    }
    .account-upgrade-prices {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 8px;
    }
    .account-upgrade-prices > div {
      display: grid;
      gap: 4px;
      padding: 14px 12px;
      border-radius: 16px;
      background: #121210;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .account-upgrade-prices > div.is-main {
      background: #e8ff46;
      border-color: transparent;
    }
    .account-upgrade-prices em {
      color: #9a9a94;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.68rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .account-upgrade-prices > div.is-main em,
    .account-upgrade-prices > div.is-main span { color: rgba(22, 22, 20, 0.72); }
    .account-upgrade-prices strong {
      color: #fff;
      font-family: Bahnschrift, sans-serif;
      font-size: 1.35rem;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .account-upgrade-prices > div.is-main strong { color: #161614; font-size: 1.55rem; }
    .account-upgrade-prices span {
      color: #8a8a84;
      font-family: Georgia, serif;
      font-size: 0.78rem;
    }
    .account-upgrade-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .account-upgrade-grid > div {
      padding: 12px;
      border-radius: 14px;
      background: #121210;
    }
    .account-upgrade-grid strong {
      display: block;
      margin: 0 0 4px;
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.88rem;
      letter-spacing: -0.02em;
    }
    .account-upgrade-grid p {
      margin: 0;
      color: #c8c8c2;
      font-family: Georgia, serif;
      font-size: 0.8rem;
      line-height: 1.35;
    }
    @media (max-width: 760px) {
      .account-upgrade-prices,
      .account-upgrade-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 980px) {
      .shell, .board, .catalogs, .promos, .stats.web, .catalog-board { grid-template-columns: 1fr; }
      .product-grid { grid-column: auto; }
      .side { position: static; width: auto; height: auto; margin: 12px 12px 0; border-radius: 22px; }
      .tabs { flex: none; flex-direction: row; overflow-x: auto; overflow-y: hidden; }
      .tabs button { width: auto; white-space: nowrap; }
      .content { margin-left: 0; padding: 16px 12px 32px; }
      .tabs button.nav-desk-only { display: none !important; }
      .tabs button.nav-mobile-only { display: flex; }
      .account-board,
      .account-board.is-admin-edit {
        width: 100%;
      }
      .top { flex-direction: column; }
      .page-sheet {
        grid-template-columns: auto minmax(0, 1fr);
        grid-template-areas:
          "no name"
          "no rate"
          "count count"
          "bar bar"
          "facts facts";
      }
      .page-count { text-align: left; }
      .page-count strong { font-size: 2.4rem; }
      .funnel-pick { grid-template-columns: 1fr; gap: 10px; }
      .page-pick { width: 100%; }
      .journey {
        padding: 14px 14px 12px;
        border-radius: 18px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
      }
      .journey-head { margin-bottom: 10px; gap: 8px; }
      .journey h2 { font-size: 1.15rem; }
      .journey-head em { font-size: 0.84rem; }
      .journey-note { margin-top: 10px; font-size: 0.92rem; }
      .journey-empty { min-height: 0; }
      .empty-path {
        width: 100%;
        margin: 16px 0 12px;
      }
      .empty-path span {
        width: 12px;
        height: 12px;
        border-width: 2px;
      }
      .empty-path::before { top: 5px; }
      .journey-empty .journey-note { font-size: 1.05rem; line-height: 1.25; }
      .journey-empty .muted { margin-top: 6px; font-size: 0.8rem; line-height: 1.35; }
      .step-n { font-size: 1rem; }
      .step-name, .step-pct { font-size: 0.66rem; }
      .compare-board { gap: 12px; padding-bottom: 88px; }
      .compare-grid {
        grid-auto-columns: minmax(78%, 300px);
        gap: 10px;
        margin: 0 -12px;
        padding: 2px 12px 12px;
        scroll-padding-inline: 12px;
      }
      .compare-card { gap: 10px; padding: 16px 14px 14px; border-radius: 20px; }
      .compare-card h3 { font-size: 1.05rem; }
      .compare-hero b { font-size: 2.2rem; }
      .compare-empty { padding: 18px 14px; border-radius: 20px; }
      .compare-empty h2 { font-size: 1.1rem; }
      .compare-empty p { font-size: 0.9rem; }
      .contact-fab {
        right: 16px;
        bottom: calc(86px + env(safe-area-inset-bottom));
        width: 52px;
        height: 52px;
      }
      .contact-sheet,
      .account-sheet {
        width: 100%;
        padding: 8px 14px calc(16px + env(safe-area-inset-bottom));
        border-radius: 24px 24px 0 0;
      }
      .account-option {
        grid-template-columns: 40px minmax(0, 1fr) auto;
        gap: 10px;
        padding: 12px;
        border-radius: 16px;
      }
      .account-option-ico { width: 40px; height: 40px; border-radius: 12px; }
      .account-option strong { font-size: 0.95rem; }
      .account-option p { font-size: 0.8rem; }
      .contact-form {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .contact-form label.full,
      .contact-form button[type="submit"] { grid-column: auto; }
      .contact-list { padding: 4px 6px; border-radius: 20px; }
      .contact-list.is-clients { gap: 10px; padding: 0; }
      .contact-item { gap: 7px; padding: 12px 10px; }
      .contact-item.client-card { gap: 10px; padding: 14px 12px 12px; border-radius: 20px; }
      .contact-item-top { gap: 10px; }
      .contact-avatar { width: 42px; height: 42px; font-size: 0.84rem; }
      .contact-item strong { font-size: 1rem; }
      .contact-item-note { padding: 9px 10px; font-size: 0.88rem; }
      .contact-action { min-height: 40px; font-size: 0.88rem; }
      .contact-status { max-width: 118px; font-size: 0.68rem; }
      .contact-status-row {
        margin: 0 -10px;
        padding: 2px 10px 0;
      }
      .trail { grid-template-columns: 1fr; }
      .trail::before { top: 16px; bottom: 16px; left: 7px; right: auto; width: 2px; height: auto; }
      .trail li {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        text-align: left;
      }
      .step-dot { margin: 0; }
      .step-n { grid-column: 3; grid-row: 1 / span 2; }
      .step-name { grid-column: 2; margin: 0; }
      .step-pct { grid-column: 2; margin: 0; }
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 0 0 8px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px 16px 18px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 22px;
      background: #1c1c19;
    }
    .stat-top { display: flex; align-items: center; gap: 8px; }
    .stat-icon {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      overflow: visible;
      background: #e8ff46;
      color: #161614;
      line-height: 0;
    }
    .stat-icon svg {
      display: block;
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }
    .stat b {
      display: block;
      margin: 0;
      font-family: Bahnschrift, sans-serif;
      font-size: 2.25rem;
      letter-spacing: -0.04em;
      line-height: 0.9;
      color: #fff;
    }
    .stat-label { color: #c8c8c2; font-size: 0.92rem; }
    .stats.web { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .stat.lead { background: #e8ff46; }
    .stat.lead .stat-icon { background: #161614; color: #e8ff46; }
    .stat.lead b, .stat.lead .stat-label { color: #161614; }
    .chart-wrap { position: relative; }
    .chart-tip {
      position: absolute;
      z-index: 4;
      width: max-content;
      max-width: 240px;
      padding: 10px 12px;
      border-radius: 14px;
      background: #161614;
      color: #f4f3ea;
      pointer-events: none;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
    }
    .chart-tip[hidden] { display: none; }
    .chart-tip strong {
      display: block;
      color: #e8ff46;
      font-family: Bahnschrift, sans-serif;
      font-size: 0.98rem;
    }
    .chart-tip span { display: block; margin-top: 4px; font-size: 0.86rem; line-height: 1.4; }
    .chart-guide { stroke: rgba(22, 22, 20, 0.28); stroke-width: 1.5; }
    .side form.logout { margin-top: auto; }
    @media (max-width: 980px) {
      .stats.web { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 760px) {
      .side {
        position: fixed;
        top: auto;
        left: 50%;
        right: auto;
        bottom: max(14px, env(safe-area-inset-bottom));
        width: auto;
        height: auto;
        margin: 0;
        padding: 6px;
        border-radius: 999px;
        transform: translateX(-50%);
        z-index: 30;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      }
      .side .brand, .side > .menu-label, .side .account, .tabs .nav-split { display: none; }
      .tabs button.nav-desk-only { display: none !important; }
      .tabs button.nav-mobile-only { display: flex; }
      .tabs { flex-direction: row; overflow: visible; gap: 2px; width: auto; }
      .tabs button {
        flex: 0 0 auto;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 46px;
        min-width: 46px;
        min-height: 46px;
        gap: 0;
        padding: 0;
        border-radius: 999px;
        color: #fff;
        white-space: nowrap;
        text-align: center;
      }
      .tabs button:hover { color: #e8ff46; }
      .tabs button[aria-current="page"],
      .tabs button[aria-current="page"]:hover { color: #161614; }
      .tabs button[aria-current="page"] .nav-ico,
      .tabs button[aria-current="page"] .nav-ico svg {
        color: #161614;
      }
      .tabs button[aria-current="page"] .nav-ico svg path,
      .tabs button[aria-current="page"] .nav-ico svg circle,
      .tabs button[aria-current="page"] .nav-ico svg rect {
        stroke: #161614;
      }
      .nav-label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
      .nav-ico { width: 20px; height: 20px; }
      .nav-ico svg { width: 20px; height: 20px; }
      .nav-pill { border-radius: 999px; background: #e8ff46; }
      .content { padding: 10px 12px calc(84px + env(safe-area-inset-bottom)); }
      .top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: "hello period" "hint hint";
        align-items: center;
        column-gap: 10px;
        row-gap: 4px;
        margin-bottom: 14px;
      }
      .appbar { display: none; }
      .hello-block { display: contents; }
      .hello {
        display: block;
        grid-area: hello;
        margin: 0;
        font-family: Bahnschrift, sans-serif;
        font-size: 1.2rem;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }
      .hello strong { display: none; }
      .hello-block h1 { display: none; }
      .hello-block .hint {
        grid-area: hint;
        margin: 0;
        font-size: 0.78rem;
        line-height: 1.3;
      }
      .toolbar { grid-area: period; align-self: center; }
      .period-kicker { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .period-btn { min-height: 32px; gap: 6px; padding: 2px 2px 2px 10px; }
      .period-value { font-size: 0.82rem; }
      .period-chevron { width: 24px; height: 24px; }
      .period-chevron svg { width: 12px; height: 12px; }
      .period-menu {
        width: 148px;
        gap: 2px;
        padding: 6px;
        border-radius: 14px;
      }
      .period-menu button {
        min-height: 32px;
        padding: 0 10px;
        border-radius: 10px;
        font-size: 0.86rem;
        font-weight: 600;
      }
      .period-menu button[aria-selected="true"]::after {
        width: 6px;
        height: 6px;
      }
      .stats { gap: 8px; margin-bottom: 6px; }
      .stats.web { grid-template-columns: 1fr 1fr; }
      .stat {
        gap: 8px;
        padding: 10px 12px 12px;
        border-radius: 16px;
      }
      .stat.lead {
        grid-column: 1 / -1;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
      }
      .stat.lead b { font-size: 2.35rem; letter-spacing: -0.04em; }
      .stat-label { font-size: 0.8rem; }
      .stat:not(.lead) { align-items: center; text-align: center; gap: 6px; padding: 10px 6px 12px; }
      .stat:not(.lead) .stat-top {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      .stat:not(.lead) .stat-icon {
        width: 34px;
        height: 34px;
        border-radius: 999px;
      }
      .stat:not(.lead) .stat-icon svg { width: 16px; height: 16px; }
      .stat:not(.lead) b { font-size: 1.25rem; }
      .panel-card, .panel-card.chart-card { padding: 14px 12px 10px; border-radius: 18px; }
      .chart-card h2 { font-size: 1rem; }
      .chart-svg { height: 160px; }
      .board { gap: 10px; }
      .pages-board { gap: 8px; }
      .page-sheet {
        gap: 2px 10px;
        padding: 12px 12px 10px;
        border-radius: 18px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
      }
      .page-no { font-size: 0.95rem; }
      .page-name { font-size: 1.15rem; line-height: 1.05; }
      .page-rate { font-size: 0.82rem; }
      .page-count strong { font-size: 1.7rem; line-height: 0.9; }
      .page-count small { margin-top: 2px; font-size: 0.62rem; }
      .page-bar { height: 5px; margin-top: 8px; }
      .page-facts { gap: 6px; margin-top: 8px; }
      .page-facts span { padding-top: 6px; }
      .page-facts b { font-size: 1rem; }
      .page-facts span span { font-size: 0.68rem; }
      .page-pick .period-menu { width: 100%; }
    }
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
