<?php

declare(strict_types=1);

namespace Avi\Domain\Account;

/**
 * Account use-cases: seeding, loading, normalizing and saving sections.
 */
final class AccountService
{
    public function __construct(private readonly AccountRepository $repository)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
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

    public function ensureSeed(int $siteId): void
    {
        $defaults = self::defaults();
        $repo = $this->repository;

        if (!$repo->hasRow('account_campana', $siteId)) {
            $repo->upsertCampana($siteId, $this->normalizeCampana($defaults['campana']));
        }

        if (!$repo->hasRow('account_pagos_proximo', $siteId)) {
            $repo->transactional(function () use ($repo, $siteId, $defaults): void {
                $repo->upsertPagosProximo($siteId, $this->normalizeProximo($defaults['pagos']['proximo']));
                $repo->syncPagosHistorial($siteId, $this->normalizeHistorial($defaults['pagos']['historial']));
            });
        }

        if (!$repo->hasRow('account_licencia', $siteId)) {
            $repo->upsertLicencia($siteId, $this->normalizeLicencia($defaults['licencia']));
        }

        if (!$repo->hasRow('account_referidos_config', $siteId)) {
            $repo->upsertReferidosConfig($siteId, $this->normalizeReferidosConfig($defaults['referidosConfig']));
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function load(int $siteId): array
    {
        $this->ensureSeed($siteId);
        $repo = $this->repository;

        $camp = $repo->findCampana($siteId);
        $prox = $repo->findPagosProximo($siteId);
        $lic = $repo->findLicencia($siteId);
        $cfg = $repo->findReferidosConfig($siteId);

        $historial = [];
        foreach ($repo->listPagosHistorial($siteId) as $row) {
            $historial[] = [
                'id' => (string) $row['id'],
                'fecha' => (string) $row['fecha'],
                'concepto' => (string) $row['concepto'],
                'monto' => (float) $row['monto'],
                'estado' => (string) $row['estado'],
            ];
        }

        $referidos = [];
        foreach ($repo->listReferidos($siteId) as $row) {
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

    /**
     * Public response payload (without role) shared by GET and POST.
     *
     * @return array{account: array<string, mixed>, referidos: list<array<string, mixed>>}
     */
    public function payload(int $siteId): array
    {
        $data = $this->load($siteId);

        return [
            'account' => [
                'campana' => $data['campana'],
                'pagos' => $data['pagos'],
                'licencia' => $data['licencia'],
                'referidosConfig' => $data['referidosConfig'],
            ],
            'referidos' => $data['referidos'],
        ];
    }

    public static function isKnownSection(string $section): bool
    {
        return in_array($section, ['campana', 'pagos', 'licencia', 'referidosConfig', 'referidos'], true);
    }

    /**
     * Saves a section. Caller must have validated the section and the role.
     *
     * @param array<string, mixed> $data
     */
    public function saveSection(int $siteId, string $section, array $data): void
    {
        $repo = $this->repository;

        switch ($section) {
            case 'campana':
                $repo->upsertCampana($siteId, $this->normalizeCampana($data));
                break;
            case 'pagos':
                $proximo = is_array($data['proximo'] ?? null) ? $data['proximo'] : [];
                $historial = (array_key_exists('historial', $data) && is_array($data['historial']))
                    ? $this->normalizeHistorial($data['historial'])
                    : null;

                $repo->transactional(function () use ($repo, $siteId, $proximo, $historial): void {
                    $repo->upsertPagosProximo($siteId, $this->normalizeProximo($proximo));
                    if ($historial !== null) {
                        $repo->syncPagosHistorial($siteId, $historial);
                    }
                });
                break;
            case 'licencia':
                $repo->upsertLicencia($siteId, $this->normalizeLicencia($data));
                break;
            case 'referidosConfig':
                $repo->upsertReferidosConfig($siteId, $this->normalizeReferidosConfig($data));
                break;
            case 'referidos':
                $repo->syncReferidos($siteId, $this->normalizeReferidos($data));
                break;
        }
    }

    // ---- Normalization -------------------------------------------------------

    private static function str(mixed $value, int $max): string
    {
        return substr(trim((string) $value), 0, $max);
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    private function normalizeCampana(array $body): array
    {
        return [
            'name' => self::str($body['name'] ?? '', 160),
            'canal' => self::str($body['canal'] ?? '', 80),
            'zona' => self::str($body['zona'] ?? '', 160),
            'inicio' => self::str($body['inicio'] ?? '', 40),
            'status' => self::str($body['status'] ?? 'Activa', 40),
            'presupuesto' => max(0, (float) ($body['presupuesto'] ?? 0)),
            'iva' => max(0, (float) ($body['iva'] ?? 0)),
            'gastado' => max(0, (float) ($body['gastado'] ?? 0)),
            'visitas' => max(0, (int) ($body['visitas'] ?? 0)),
            'clics' => max(0, (int) ($body['clics'] ?? 0)),
            'llamadas' => max(0, (int) ($body['llamadas'] ?? 0)),
        ];
    }

    /**
     * @param array<string, mixed> $proximo
     * @return array<string, mixed>
     */
    private function normalizeProximo(array $proximo): array
    {
        return [
            'fecha' => self::str($proximo['fecha'] ?? '', 40),
            'concepto' => self::str($proximo['concepto'] ?? '', 200),
            'monto' => max(0, (float) ($proximo['monto'] ?? 0)),
            'estado' => self::str($proximo['estado'] ?? 'Programado', 40),
        ];
    }

    /**
     * @param array<mixed> $rows
     * @return list<array{id: int|null, fecha: string, concepto: string, monto: float, estado: string}>
     */
    private function normalizeHistorial(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            $out[] = [
                'id' => self::numericId($row['id'] ?? null, false),
                'fecha' => self::str($row['fecha'] ?? '', 40),
                'concepto' => self::str($row['concepto'] ?? '', 200),
                'monto' => max(0, (float) ($row['monto'] ?? 0)),
                'estado' => self::str($row['estado'] ?? 'Pagado', 40),
            ];
        }

        return $out;
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    private function normalizeLicencia(array $body): array
    {
        return [
            'status' => self::str($body['status'] ?? 'Activa', 40),
            'plan' => self::str($body['plan'] ?? '', 80),
            'cuenta' => self::str($body['cuenta'] ?? '', 160),
            'inicio' => self::str($body['inicio'] ?? '', 40),
            'fin' => self::str($body['fin'] ?? '', 40),
            'precioPro' => self::str($body['precioPro'] ?? '', 40),
            'precioEspecial' => self::str($body['precioEspecial'] ?? '', 40),
        ];
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    private function normalizeReferidosConfig(array $body): array
    {
        $activo = trim((string) ($body['activoDesde'] ?? ''));
        if ($activo !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $activo)) {
            $activo = null;
        }

        return [
            'descuentoDueno' => max(0, min(100, (int) ($body['descuentoDueno'] ?? 50))),
            'descuentoReferido' => max(0, min(100, (int) ($body['descuentoReferido'] ?? 10))),
            'activoDesde' => $activo,
            'empleado' => self::str($body['empleado'] ?? '', 120),
        ];
    }

    /**
     * Rows are returned reversed (as in the legacy snapshot) so the first
     * incoming row ends up with the highest id after inserts.
     *
     * @param array<mixed> $rows
     * @return list<array{id: int|null, nombre: string, telefono: string, estado: string, cerrado: int}>
     */
    private function normalizeReferidos(array $rows): array
    {
        $out = [];
        foreach (array_reverse($rows) as $row) {
            if (!is_array($row)) {
                continue;
            }
            $nombre = self::str($row['nombre'] ?? '', 120);
            if ($nombre === '') {
                continue;
            }
            $out[] = [
                'id' => self::numericId($row['id'] ?? null, true),
                'nombre' => $nombre,
                'telefono' => self::str($row['telefono'] ?? '', 40),
                'estado' => self::str($row['estado'] ?? 'En proceso', 40),
                'cerrado' => !empty($row['cerrado']) ? 1 : 0,
            ];
        }

        return $out;
    }

    /**
     * Parses a client id ("15", or "r15" when $allowPrefix) into a DB primary key.
     * Unknown / non-matching ids return null (treated as a new row).
     */
    private static function numericId(mixed $value, bool $allowPrefix): ?int
    {
        if (!is_string($value) && !is_int($value)) {
            return null;
        }

        $pattern = $allowPrefix ? '/^r?(\d{1,18})$/' : '/^(\d{1,18})$/';
        if (!preg_match($pattern, (string) $value, $m)) {
            return null;
        }

        $id = (int) $m[1];

        return $id > 0 ? $id : null;
    }
}
