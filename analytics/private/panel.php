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
    .nav-split { margin-top: 22px; }
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
    .nav-ico { display: grid; place-items: center; width: 22px; height: 22px; }
    .nav-ico svg { display: block; }
    .nav-label { font-family: Bahnschrift, sans-serif; font-size: 1.02rem; letter-spacing: 0.01em; }
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
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 18px;
      align-items: start;
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
    .chart-svg { display: block; width: 100%; height: 220px; }
    .content { min-width: 0; margin-left: 300px; padding: 16px 24px 48px 8px; }
    .board { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.8fr); gap: 16px; }
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
    @media (max-width: 980px) {
      .shell, .board, .catalogs, .promos, .stats.web, .catalog-board { grid-template-columns: 1fr; }
      .product-grid { grid-column: auto; }
      .side { position: static; width: auto; height: auto; margin: 12px 12px 0; border-radius: 22px; }
      .tabs { flex: none; flex-direction: row; overflow-x: auto; overflow-y: hidden; }
      .tabs button { width: auto; white-space: nowrap; }
      .content { margin-left: 0; padding: 16px 12px 32px; }
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
      .funnel-pick { grid-template-columns: 1fr; }
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
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #e8ff46;
      color: #161614;
    }
    .stat-icon svg { display: block; }
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
        left: 12px;
        right: 12px;
        bottom: max(10px, env(safe-area-inset-bottom));
        width: auto;
        height: auto;
        margin: 0;
        padding: 8px;
        border-radius: 28px;
        z-index: 30;
      }
      .side .brand, .side > .menu-label, .side .account { display: none; }
      .tabs { flex-direction: row; overflow: visible; gap: 4px; }
      .tabs button {
        flex: 1;
        flex-direction: column;
        justify-content: center;
        width: auto;
        min-height: 58px;
        gap: 3px;
        padding: 6px 4px;
        white-space: normal;
        text-align: center;
      }
      .nav-label { font-size: 0.68rem; line-height: 1.1; }
      .nav-pill { border-radius: 18px; }
      .content { padding: 8px 14px calc(108px + env(safe-area-inset-bottom)); }
      .top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: "app app" "hello period" "hint hint";
        align-items: center;
        gap: 8px 12px;
        margin-bottom: 14px;
      }
      .appbar { display: flex; grid-area: app; align-items: center; justify-content: space-between; }
      .appbar form, .appbar button.logout { margin: 0; }
      .appbar button.logout {
        width: 42px;
        height: 42px;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border-radius: 14px;
        font-family: Bahnschrift, sans-serif;
      }
      .hello-block { display: contents; }
      .hello { display: block; grid-area: hello; margin: 0; font-family: Bahnschrift, sans-serif; font-size: 1.45rem; line-height: 1.05; }
      .hello strong { display: block; }
      .hello-block h1 { display: none; }
      .hello-block .hint { grid-area: hint; margin: 0; }
      .toolbar { grid-area: period; align-self: end; }
      .period-kicker { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .period-btn { min-height: 40px; gap: 8px; padding: 4px 4px 4px 12px; }
      .stats.web { grid-template-columns: 1fr 1fr; }
      .stat.lead {
        grid-column: 1 / -1;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
      }
      .stat.lead b { font-size: 4rem; }
      .stat:not(.lead) { align-items: center; text-align: center; gap: 8px; padding: 14px 8px 16px; }
      .stat:not(.lead) .stat-top { flex-direction: column; }
      .stat:not(.lead) .stat-icon { width: 42px; height: 42px; border-radius: 999px; }
      .stat:not(.lead) b { font-size: 1.55rem; }
      .funnel-pick .pick-list { max-height: none; }
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
          <button type="button" data-vista="catalogos" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5zM5 5.5V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Catálogos</span></button>
          <button type="button" data-vista="promociones" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 12.5 4H20v7.5L11.5 20zM16.5 8.2h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Promociones</span></button>
          <p class="menu-label nav-split" hidden>Opciones</p>
          <button type="button" data-vista="referidos" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.8 3.8 0 0 1 7 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="nav-label">Referidos</span></button>
          <button type="button" data-vista="pagos" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 8.5h17v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17.5zM3.5 8.5 6 5h12l2.5 3.5M3.5 12.5h17" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Pagos</span></button>
          <button type="button" data-vista="campana" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 10.5v3h3.2L14 18V6l-6.8 4.5zM16.5 9.2a3.2 3.2 0 0 1 0 5.6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg></span><span class="nav-label">Campaña</span></button>
          <button type="button" data-vista="problema" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4.2 3.8 19h16.4zM12 10v4.2M12 16.8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="nav-label">Algún problema</span></button>
          <button type="button" data-vista="compras" hidden><span class="nav-ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6.5 8h11l-.9 11h-9.2zM9 8V6.4A3 3 0 0 1 12 3.4 3 3 0 0 1 15 6.4V8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="nav-label">Historia de compras</span></button>
        </nav>
        <div class="account">
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
            <p class="hello"><span id="hello-time">Hola</span><strong id="hello-name"></strong></p>
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
    <script src="/panel/gsap.min.js" defer></script>
    <script src="/panel/app.js" defer></script>
HTML;
        avi_panel_document('Panel', $body, true, $head);
    } catch (Throwable $error) {
        avi_log('home_page ' . $error->getMessage());
        avi_unavailable();
    }
}
