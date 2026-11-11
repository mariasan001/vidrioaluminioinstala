<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/auth.php';

function avi_account_site_id(): int
{
    $statement = avi_pdo()->prepare('SELECT id FROM sites WHERE dominio = ? LIMIT 1');
    $statement->execute(['aluminioyvidrioinstala.mx']);
    $id = $statement->fetchColumn();

    return $id === false ? 0 : (int) $id;
}

function avi_account_role(): string
{
    avi_session_start();

    return (($_SESSION['role'] ?? '') === 'dueno') ? 'dueno' : 'admin';
}

function avi_account_is_admin(): bool
{
    return avi_account_role() === 'admin';
}

function avi_account_guard(string $method = 'GET'): int
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        avi_json(405);
    }

    avi_session_start();

    if (avi_user_id() === null) {
        avi_json(401);
    }

    $siteId = avi_account_site_id();

    if ($siteId < 1) {
        avi_json(500, ['ok' => false, 'error' => 'site']);
    }

    return $siteId;
}

/**
 * @return array<string, mixed>
 */
function avi_account_defaults(): array
{
    return [
        'campana' => [
            'name' => 'Instala · Vidrio y aluminio',
            'canal' => 'Google Ads',
            'zona' => 'Toluca, Metepec y alrededores',
            'inicio' => '12 ago 2026',
            'status' => 'Activa',
            'presupuesto' => 18000,
            'iva' => 2880,
            'gastado' => 9640,
            'visitas' => 93,
            'clics' => 148,
            'llamadas' => 15,
        ],
        'pagos' => [
            'proximo' => [
                'fecha' => '15 nov 2026',
                'concepto' => 'Mensualidad panel + campaña',
                'monto' => 2500,
                'estado' => 'Programado',
            ],
            'historial' => [
                ['fecha' => '15 oct 2026', 'concepto' => 'Mensualidad panel + campaña', 'monto' => 2500, 'estado' => 'Pagado'],
                ['fecha' => '15 sep 2026', 'concepto' => 'Mensualidad panel + campaña', 'monto' => 2500, 'estado' => 'Pagado'],
                ['fecha' => '15 ago 2026', 'concepto' => 'Alta de licencia anual', 'monto' => 4800, 'estado' => 'Pagado'],
                ['fecha' => '12 ago 2026', 'concepto' => 'Setup campaña Google Ads', 'monto' => 1200, 'estado' => 'Pagado'],
            ],
        ],
        'licencia' => [
            'status' => 'Activa',
            'plan' => 'Instala Pro',
            'cuenta' => 'Aluminios y Vidrios Instala',
            'inicio' => '10 feb 2026',
            'fin' => '10 feb 2027',
            'precioPro' => '$2,500 MXN',
            'precioEspecial' => '$1,300 MXN',
        ],
        'referidosConfig' => [
            'descuentoDueno' => 50,
            'descuentoReferido' => 10,
            'activoDesde' => '2026-11-01',
            'empleado' => 'Equipo Aurena',
        ],
    ];
}

function avi_account_ensure_seed(int $siteId): void
{
    $defaults = avi_account_defaults();
    $pdo = avi_pdo();

    $hasCampana = $pdo->prepare('SELECT 1 FROM account_campana WHERE site_id = ? LIMIT 1');
    $hasCampana->execute([$siteId]);
    if ($hasCampana->fetchColumn() === false) {
        $camp = $defaults['campana'];
        $pdo->prepare(
            'INSERT INTO account_campana
             (site_id, name, canal, zona, inicio, status, presupuesto, iva, gastado, visitas, clics, llamadas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $siteId,
            $camp['name'],
            $camp['canal'],
            $camp['zona'],
            $camp['inicio'],
            $camp['status'],
            $camp['presupuesto'],
            $camp['iva'],
            $camp['gastado'],
            $camp['visitas'],
            $camp['clics'],
            $camp['llamadas'],
        ]);
    }

    $hasPago = $pdo->prepare('SELECT 1 FROM account_pagos_proximo WHERE site_id = ? LIMIT 1');
    $hasPago->execute([$siteId]);
    if ($hasPago->fetchColumn() === false) {
        $prox = $defaults['pagos']['proximo'];
        $pdo->prepare(
            'INSERT INTO account_pagos_proximo (site_id, fecha, concepto, monto, estado)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([$siteId, $prox['fecha'], $prox['concepto'], $prox['monto'], $prox['estado']]);

        $insertHist = $pdo->prepare(
            'INSERT INTO account_pagos_historial (site_id, fecha, concepto, monto, estado)
             VALUES (?, ?, ?, ?, ?)'
        );
        foreach ($defaults['pagos']['historial'] as $row) {
            $insertHist->execute([$siteId, $row['fecha'], $row['concepto'], $row['monto'], $row['estado']]);
        }
    }

    $hasLic = $pdo->prepare('SELECT 1 FROM account_licencia WHERE site_id = ? LIMIT 1');
    $hasLic->execute([$siteId]);
    if ($hasLic->fetchColumn() === false) {
        $lic = $defaults['licencia'];
        $pdo->prepare(
            'INSERT INTO account_licencia
             (site_id, status, plan, cuenta, inicio, fin, precio_pro, precio_especial)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $siteId,
            $lic['status'],
            $lic['plan'],
            $lic['cuenta'],
            $lic['inicio'],
            $lic['fin'],
            $lic['precioPro'],
            $lic['precioEspecial'],
        ]);
    }

    $hasRef = $pdo->prepare('SELECT 1 FROM account_referidos_config WHERE site_id = ? LIMIT 1');
    $hasRef->execute([$siteId]);
    if ($hasRef->fetchColumn() === false) {
        $cfg = $defaults['referidosConfig'];
        $pdo->prepare(
            'INSERT INTO account_referidos_config
             (site_id, descuento_dueno, descuento_referido, activo_desde, empleado)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([
            $siteId,
            $cfg['descuentoDueno'],
            $cfg['descuentoReferido'],
            $cfg['activoDesde'],
            $cfg['empleado'],
        ]);
    }
}

/**
 * @return array<string, mixed>
 */
function avi_account_load(int $siteId): array
{
    avi_account_ensure_seed($siteId);
    $pdo = avi_pdo();

    $campStmt = $pdo->prepare(
        'SELECT name, canal, zona, inicio, status, presupuesto, iva, gastado, visitas, clics, llamadas
         FROM account_campana WHERE site_id = ? LIMIT 1'
    );
    $campStmt->execute([$siteId]);
    $camp = $campStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $proxStmt = $pdo->prepare(
        'SELECT fecha, concepto, monto, estado FROM account_pagos_proximo WHERE site_id = ? LIMIT 1'
    );
    $proxStmt->execute([$siteId]);
    $prox = $proxStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $histStmt = $pdo->prepare(
        'SELECT id, fecha, concepto, monto, estado
         FROM account_pagos_historial WHERE site_id = ? ORDER BY id DESC'
    );
    $histStmt->execute([$siteId]);
    $historial = [];
    foreach ($histStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $historial[] = [
            'id' => (string) $row['id'],
            'fecha' => (string) $row['fecha'],
            'concepto' => (string) $row['concepto'],
            'monto' => (float) $row['monto'],
            'estado' => (string) $row['estado'],
        ];
    }

    $licStmt = $pdo->prepare(
        'SELECT status, plan, cuenta, inicio, fin, precio_pro AS precioPro, precio_especial AS precioEspecial
         FROM account_licencia WHERE site_id = ? LIMIT 1'
    );
    $licStmt->execute([$siteId]);
    $lic = $licStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $cfgStmt = $pdo->prepare(
        'SELECT descuento_dueno AS descuentoDueno, descuento_referido AS descuentoReferido,
                activo_desde AS activoDesde, empleado
         FROM account_referidos_config WHERE site_id = ? LIMIT 1'
    );
    $cfgStmt->execute([$siteId]);
    $cfg = $cfgStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $refStmt = $pdo->prepare(
        'SELECT id, nombre, telefono, estado, cerrado
         FROM account_referidos WHERE site_id = ? ORDER BY id DESC'
    );
    $refStmt->execute([$siteId]);
    $referidos = [];
    foreach ($refStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $referidos[] = [
            'id' => 'r' . $row['id'],
            'nombre' => (string) $row['nombre'],
            'telefono' => (string) $row['telefono'],
            'estado' => (string) $row['estado'],
            'cerrado' => ((int) $row['cerrado']) === 1,
        ];
    }

    return [
        'campana' => [
            'name' => (string) ($camp['name'] ?? ''),
            'canal' => (string) ($camp['canal'] ?? ''),
            'zona' => (string) ($camp['zona'] ?? ''),
            'inicio' => (string) ($camp['inicio'] ?? ''),
            'status' => (string) ($camp['status'] ?? 'Activa'),
            'presupuesto' => (float) ($camp['presupuesto'] ?? 0),
            'iva' => (float) ($camp['iva'] ?? 0),
            'gastado' => (float) ($camp['gastado'] ?? 0),
            'visitas' => (int) ($camp['visitas'] ?? 0),
            'clics' => (int) ($camp['clics'] ?? 0),
            'llamadas' => (int) ($camp['llamadas'] ?? 0),
        ],
        'pagos' => [
            'proximo' => [
                'fecha' => (string) ($prox['fecha'] ?? ''),
                'concepto' => (string) ($prox['concepto'] ?? ''),
                'monto' => (float) ($prox['monto'] ?? 0),
                'estado' => (string) ($prox['estado'] ?? 'Programado'),
            ],
            'historial' => $historial,
        ],
        'licencia' => [
            'status' => (string) ($lic['status'] ?? 'Activa'),
            'plan' => (string) ($lic['plan'] ?? ''),
            'cuenta' => (string) ($lic['cuenta'] ?? ''),
            'inicio' => (string) ($lic['inicio'] ?? ''),
            'fin' => (string) ($lic['fin'] ?? ''),
            'precioPro' => (string) ($lic['precioPro'] ?? ''),
            'precioEspecial' => (string) ($lic['precioEspecial'] ?? ''),
        ],
        'referidosConfig' => [
            'descuentoDueno' => (int) ($cfg['descuentoDueno'] ?? 50),
            'descuentoReferido' => (int) ($cfg['descuentoReferido'] ?? 10),
            'activoDesde' => (string) ($cfg['activoDesde'] ?? ''),
            'empleado' => (string) ($cfg['empleado'] ?? ''),
        ],
        'referidos' => $referidos,
    ];
}

function avi_account_get(): void
{
    try {
        $siteId = avi_account_guard('GET');
        $data = avi_account_load($siteId);
        avi_json(200, [
            'ok' => true,
            'role' => avi_account_role(),
            'account' => [
                'campana' => $data['campana'],
                'pagos' => $data['pagos'],
                'licencia' => $data['licencia'],
                'referidosConfig' => $data['referidosConfig'],
            ],
            'referidos' => $data['referidos'],
        ]);
    } catch (Throwable $error) {
        avi_log('account_get ' . $error->getMessage());
        avi_json(500);
    }
}

/**
 * @param array<string, mixed> $body
 */
function avi_account_save_campana(int $siteId, array $body): void
{
    avi_pdo()->prepare(
        'INSERT INTO account_campana
         (site_id, name, canal, zona, inicio, status, presupuesto, iva, gastado, visitas, clics, llamadas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), canal = VALUES(canal), zona = VALUES(zona), inicio = VALUES(inicio),
           status = VALUES(status), presupuesto = VALUES(presupuesto), iva = VALUES(iva),
           gastado = VALUES(gastado), visitas = VALUES(visitas), clics = VALUES(clics), llamadas = VALUES(llamadas)'
    )->execute([
        $siteId,
        substr(trim((string) ($body['name'] ?? '')), 0, 160),
        substr(trim((string) ($body['canal'] ?? '')), 0, 80),
        substr(trim((string) ($body['zona'] ?? '')), 0, 160),
        substr(trim((string) ($body['inicio'] ?? '')), 0, 40),
        substr(trim((string) ($body['status'] ?? 'Activa')), 0, 40),
        max(0, (float) ($body['presupuesto'] ?? 0)),
        max(0, (float) ($body['iva'] ?? 0)),
        max(0, (float) ($body['gastado'] ?? 0)),
        max(0, (int) ($body['visitas'] ?? 0)),
        max(0, (int) ($body['clics'] ?? 0)),
        max(0, (int) ($body['llamadas'] ?? 0)),
    ]);
}

/**
 * @param array<string, mixed> $body
 */
function avi_account_save_pagos(int $siteId, array $body): void
{
    $proximo = is_array($body['proximo'] ?? null) ? $body['proximo'] : [];
    avi_pdo()->prepare(
        'INSERT INTO account_pagos_proximo (site_id, fecha, concepto, monto, estado)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           fecha = VALUES(fecha), concepto = VALUES(concepto), monto = VALUES(monto), estado = VALUES(estado)'
    )->execute([
        $siteId,
        substr(trim((string) ($proximo['fecha'] ?? '')), 0, 40),
        substr(trim((string) ($proximo['concepto'] ?? '')), 0, 200),
        max(0, (float) ($proximo['monto'] ?? 0)),
        substr(trim((string) ($proximo['estado'] ?? 'Programado')), 0, 40),
    ]);

    if (array_key_exists('historial', $body) && is_array($body['historial'])) {
        $pdo = avi_pdo();
        $pdo->prepare('DELETE FROM account_pagos_historial WHERE site_id = ?')->execute([$siteId]);
        $insert = $pdo->prepare(
            'INSERT INTO account_pagos_historial (site_id, fecha, concepto, monto, estado)
             VALUES (?, ?, ?, ?, ?)'
        );
        foreach ($body['historial'] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $insert->execute([
                $siteId,
                substr(trim((string) ($row['fecha'] ?? '')), 0, 40),
                substr(trim((string) ($row['concepto'] ?? '')), 0, 200),
                max(0, (float) ($row['monto'] ?? 0)),
                substr(trim((string) ($row['estado'] ?? 'Pagado')), 0, 40),
            ]);
        }
    }
}

/**
 * @param array<string, mixed> $body
 */
function avi_account_save_licencia(int $siteId, array $body): void
{
    avi_pdo()->prepare(
        'INSERT INTO account_licencia
         (site_id, status, plan, cuenta, inicio, fin, precio_pro, precio_especial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status), plan = VALUES(plan), cuenta = VALUES(cuenta),
           inicio = VALUES(inicio), fin = VALUES(fin),
           precio_pro = VALUES(precio_pro), precio_especial = VALUES(precio_especial)'
    )->execute([
        $siteId,
        substr(trim((string) ($body['status'] ?? 'Activa')), 0, 40),
        substr(trim((string) ($body['plan'] ?? '')), 0, 80),
        substr(trim((string) ($body['cuenta'] ?? '')), 0, 160),
        substr(trim((string) ($body['inicio'] ?? '')), 0, 40),
        substr(trim((string) ($body['fin'] ?? '')), 0, 40),
        substr(trim((string) ($body['precioPro'] ?? '')), 0, 40),
        substr(trim((string) ($body['precioEspecial'] ?? '')), 0, 40),
    ]);
}

/**
 * @param array<string, mixed> $body
 */
function avi_account_save_referidos_config(int $siteId, array $body): void
{
    $activo = trim((string) ($body['activoDesde'] ?? ''));
    if ($activo !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $activo)) {
        $activo = null;
    }
    avi_pdo()->prepare(
        'INSERT INTO account_referidos_config
         (site_id, descuento_dueno, descuento_referido, activo_desde, empleado)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           descuento_dueno = VALUES(descuento_dueno),
           descuento_referido = VALUES(descuento_referido),
           activo_desde = VALUES(activo_desde),
           empleado = VALUES(empleado)'
    )->execute([
        $siteId,
        max(0, min(100, (int) ($body['descuentoDueno'] ?? 50))),
        max(0, min(100, (int) ($body['descuentoReferido'] ?? 10))),
        $activo,
        substr(trim((string) ($body['empleado'] ?? '')), 0, 120),
    ]);
}

/**
 * @param list<mixed> $rows
 */
function avi_account_save_referidos_list(int $siteId, array $rows): void
{
    $pdo = avi_pdo();
    $pdo->prepare('DELETE FROM account_referidos WHERE site_id = ?')->execute([$siteId]);
    $insert = $pdo->prepare(
        'INSERT INTO account_referidos (site_id, nombre, telefono, estado, cerrado)
         VALUES (?, ?, ?, ?, ?)'
    );
    foreach (array_reverse($rows) as $row) {
        if (!is_array($row)) {
            continue;
        }
        $nombre = substr(trim((string) ($row['nombre'] ?? '')), 0, 120);
        if ($nombre === '') {
            continue;
        }
        $insert->execute([
            $siteId,
            $nombre,
            substr(trim((string) ($row['telefono'] ?? '')), 0, 40),
            substr(trim((string) ($row['estado'] ?? 'En proceso')), 0, 40),
            !empty($row['cerrado']) ? 1 : 0,
        ]);
    }
}

function avi_account_post(): void
{
    try {
        $siteId = avi_account_guard('POST');
        $raw = file_get_contents('php://input');
        $body = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($body)) {
            avi_json(400);
        }

        $csrf = (string) ($body['csrf'] ?? '');
        if (!avi_csrf_valid($csrf)) {
            avi_json(403);
        }

        $section = (string) ($body['section'] ?? '');
        $data = is_array($body['data'] ?? null) ? $body['data'] : [];
        $adminOnly = ['campana', 'pagos', 'licencia', 'referidosConfig'];

        if (in_array($section, $adminOnly, true) && !avi_account_is_admin()) {
            avi_json(403, ['ok' => false, 'error' => 'role']);
        }

        if ($section === 'campana') {
            avi_account_save_campana($siteId, $data);
        } elseif ($section === 'pagos') {
            avi_account_save_pagos($siteId, $data);
        } elseif ($section === 'licencia') {
            avi_account_save_licencia($siteId, $data);
        } elseif ($section === 'referidosConfig') {
            avi_account_save_referidos_config($siteId, $data);
        } elseif ($section === 'referidos') {
            avi_account_save_referidos_list($siteId, $data);
        } else {
            avi_json(400, ['ok' => false, 'error' => 'section']);
        }

        $loaded = avi_account_load($siteId);
        avi_json(200, [
            'ok' => true,
            'role' => avi_account_role(),
            'account' => [
                'campana' => $loaded['campana'],
                'pagos' => $loaded['pagos'],
                'licencia' => $loaded['licencia'],
                'referidosConfig' => $loaded['referidosConfig'],
            ],
            'referidos' => $loaded['referidos'],
        ]);
    } catch (Throwable $error) {
        avi_log('account_post ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_account_dispatch(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        avi_account_get();
    }
    if ($method === 'POST') {
        avi_account_post();
    }
    avi_json(405);
}

function avi_crm_get_contacts(): void
{
    try {
        $siteId = avi_account_guard('GET');
        $stmt = avi_pdo()->prepare(
            'SELECT id, nombre, telefono, canal, servicio, fecha, estatus, nota, rol, historial
             FROM crm_contacts WHERE site_id = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([$siteId]);
        $contacts = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $historial = [];
            if (is_string($row['historial'] ?? null) && $row['historial'] !== '') {
                $decoded = json_decode($row['historial'], true);
                if (is_array($decoded)) {
                    $historial = $decoded;
                }
            }
            $contacts[] = [
                'id' => (string) $row['id'],
                'nombre' => (string) $row['nombre'],
                'telefono' => (string) $row['telefono'],
                'canal' => (string) $row['canal'],
                'servicio' => (string) $row['servicio'],
                'fecha' => (string) $row['fecha'],
                'estatus' => (string) $row['estatus'],
                'nota' => (string) $row['nota'],
                'rol' => (string) $row['rol'],
                'historial' => $historial,
            ];
        }

        $qStmt = avi_pdo()->prepare(
            'SELECT id, contact_id, payload FROM crm_quotes WHERE site_id = ? ORDER BY updated_at DESC'
        );
        $qStmt->execute([$siteId]);
        $quotes = [];
        foreach ($qStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $payload = [];
            if (is_string($row['payload'] ?? null)) {
                $decoded = json_decode($row['payload'], true);
                if (is_array($decoded)) {
                    $payload = $decoded;
                }
            }
            $quotes[] = array_merge(['id' => (string) $row['id'], 'contactId' => (string) $row['contact_id']], $payload);
        }

        avi_json(200, ['ok' => true, 'contacts' => $contacts, 'quotes' => $quotes, 'role' => avi_account_role()]);
    } catch (Throwable $error) {
        avi_log('crm_get ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_crm_post_contacts(): void
{
    try {
        $siteId = avi_account_guard('POST');
        $raw = file_get_contents('php://input');
        $body = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($body) || !avi_csrf_valid((string) ($body['csrf'] ?? ''))) {
            avi_json(403);
        }

        // Dueño edita CRM; admin solo observa → bloquear writes de admin
        if (avi_account_is_admin()) {
            avi_json(403, ['ok' => false, 'error' => 'role']);
        }

        $contacts = is_array($body['contacts'] ?? null) ? $body['contacts'] : null;
        $quotes = is_array($body['quotes'] ?? null) ? $body['quotes'] : null;
        $pdo = avi_pdo();

        if (is_array($contacts)) {
            $pdo->prepare('DELETE FROM crm_contacts WHERE site_id = ?')->execute([$siteId]);
            $insert = $pdo->prepare(
                'INSERT INTO crm_contacts
                 (id, site_id, nombre, telefono, canal, servicio, fecha, estatus, nota, rol, historial)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            foreach ($contacts as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $id = substr(trim((string) ($row['id'] ?? '')), 0, 40);
                $nombre = substr(trim((string) ($row['nombre'] ?? '')), 0, 120);
                if ($id === '' || $nombre === '') {
                    continue;
                }
                $canal = (($row['canal'] ?? '') === 'llamada') ? 'llamada' : 'whatsapp';
                $rol = (($row['rol'] ?? '') === 'cliente') ? 'cliente' : 'prospecto';
                $fecha = (string) ($row['fecha'] ?? date('Y-m-d'));
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                    $fecha = date('Y-m-d');
                }
                $historial = json_encode(is_array($row['historial'] ?? null) ? $row['historial'] : [], JSON_UNESCAPED_UNICODE);
                $insert->execute([
                    $id,
                    $siteId,
                    $nombre,
                    substr(trim((string) ($row['telefono'] ?? '')), 0, 40),
                    $canal,
                    substr(trim((string) ($row['servicio'] ?? '')), 0, 80),
                    $fecha,
                    substr(trim((string) ($row['estatus'] ?? 'Nuevo')), 0, 40),
                    substr(trim((string) ($row['nota'] ?? '')), 0, 500),
                    $rol,
                    $historial === false ? '[]' : $historial,
                ]);
            }
        }

        if (is_array($quotes)) {
            $pdo->prepare('DELETE FROM crm_quotes WHERE site_id = ?')->execute([$siteId]);
            $insert = $pdo->prepare(
                'INSERT INTO crm_quotes (id, site_id, contact_id, payload) VALUES (?, ?, ?, ?)'
            );
            foreach ($quotes as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $id = substr(trim((string) ($row['id'] ?? '')), 0, 40);
                $contactId = substr(trim((string) ($row['contactId'] ?? $row['contact_id'] ?? '')), 0, 40);
                if ($id === '' || $contactId === '') {
                    continue;
                }
                $payload = $row;
                unset($payload['id'], $payload['contactId'], $payload['contact_id']);
                $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
                $insert->execute([$id, $siteId, $contactId, $json === false ? '{}' : $json]);
            }
        }

        avi_crm_get_contacts();
    } catch (Throwable $error) {
        avi_log('crm_post ' . $error->getMessage());
        avi_json(500);
    }
}

function avi_crm_dispatch(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        avi_crm_get_contacts();
    }
    if ($method === 'POST') {
        avi_crm_post_contacts();
    }
    avi_json(405);
}
