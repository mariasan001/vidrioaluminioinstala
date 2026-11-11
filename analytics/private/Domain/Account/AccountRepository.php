<?php

declare(strict_types=1);

namespace Avi\Domain\Account;

use PDO;
use Throwable;

/**
 * Persistence for account_* tables. Receives already-normalized values.
 */
final class AccountRepository
{
    private const SINGLETON_TABLES = [
        'account_campana',
        'account_pagos_proximo',
        'account_licencia',
        'account_referidos_config',
    ];

    public function __construct(private readonly PDO $pdo)
    {
    }

    /**
     * @template T
     * @param callable(): T $work
     * @return T
     */
    public function transactional(callable $work): mixed
    {
        if ($this->pdo->inTransaction()) {
            return $work();
        }

        $this->pdo->beginTransaction();
        try {
            $result = $work();
            $this->pdo->commit();

            return $result;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }
    }

    public function hasRow(string $table, int $siteId): bool
    {
        if (!in_array($table, self::SINGLETON_TABLES, true)) {
            throw new \InvalidArgumentException('table');
        }

        $stmt = $this->pdo->prepare("SELECT 1 FROM {$table} WHERE site_id = ? LIMIT 1");
        $stmt->execute([$siteId]);

        return $stmt->fetchColumn() !== false;
    }

    /** @return array<string, mixed> */
    public function findCampana(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT name, canal, zona, inicio, status, presupuesto, iva, gastado, visitas, clics, llamadas
             FROM account_campana WHERE site_id = ? LIMIT 1'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /** @return array<string, mixed> */
    public function findPagosProximo(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT fecha, concepto, monto, estado FROM account_pagos_proximo WHERE site_id = ? LIMIT 1'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /** @return list<array<string, mixed>> */
    public function listPagosHistorial(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, fecha, concepto, monto, estado
             FROM account_pagos_historial WHERE site_id = ? ORDER BY id DESC'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** @return array<string, mixed> */
    public function findLicencia(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT status, plan, cuenta, inicio, fin, precio_pro AS precioPro, precio_especial AS precioEspecial
             FROM account_licencia WHERE site_id = ? LIMIT 1'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /** @return array<string, mixed> */
    public function findReferidosConfig(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT descuento_dueno AS descuentoDueno, descuento_referido AS descuentoReferido,
                    activo_desde AS activoDesde, empleado
             FROM account_referidos_config WHERE site_id = ? LIMIT 1'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /** @return list<array<string, mixed>> */
    public function listReferidos(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, nombre, telefono, estado, cerrado
             FROM account_referidos WHERE site_id = ? ORDER BY id DESC'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** @param array<string, mixed> $c normalized campana */
    public function upsertCampana(int $siteId, array $c): void
    {
        $this->pdo->prepare(
            'INSERT INTO account_campana
             (site_id, name, canal, zona, inicio, status, presupuesto, iva, gastado, visitas, clics, llamadas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               name = VALUES(name), canal = VALUES(canal), zona = VALUES(zona), inicio = VALUES(inicio),
               status = VALUES(status), presupuesto = VALUES(presupuesto), iva = VALUES(iva),
               gastado = VALUES(gastado), visitas = VALUES(visitas), clics = VALUES(clics),
               llamadas = VALUES(llamadas)'
        )->execute([
            $siteId,
            $c['name'],
            $c['canal'],
            $c['zona'],
            $c['inicio'],
            $c['status'],
            $c['presupuesto'],
            $c['iva'],
            $c['gastado'],
            $c['visitas'],
            $c['clics'],
            $c['llamadas'],
        ]);
    }

    /** @param array<string, mixed> $p normalized proximo pago */
    public function upsertPagosProximo(int $siteId, array $p): void
    {
        $this->pdo->prepare(
            'INSERT INTO account_pagos_proximo (site_id, fecha, concepto, monto, estado)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               fecha = VALUES(fecha), concepto = VALUES(concepto), monto = VALUES(monto), estado = VALUES(estado)'
        )->execute([$siteId, $p['fecha'], $p['concepto'], $p['monto'], $p['estado']]);
    }

    /** @param array<string, mixed> $l normalized licencia */
    public function upsertLicencia(int $siteId, array $l): void
    {
        $this->pdo->prepare(
            'INSERT INTO account_licencia
             (site_id, status, plan, cuenta, inicio, fin, precio_pro, precio_especial)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               status = VALUES(status), plan = VALUES(plan), cuenta = VALUES(cuenta),
               inicio = VALUES(inicio), fin = VALUES(fin),
               precio_pro = VALUES(precio_pro), precio_especial = VALUES(precio_especial)'
        )->execute([
            $siteId,
            $l['status'],
            $l['plan'],
            $l['cuenta'],
            $l['inicio'],
            $l['fin'],
            $l['precioPro'],
            $l['precioEspecial'],
        ]);
    }

    /** @param array<string, mixed> $c normalized referidos config */
    public function upsertReferidosConfig(int $siteId, array $c): void
    {
        $this->pdo->prepare(
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
            $c['descuentoDueno'],
            $c['descuentoReferido'],
            $c['activoDesde'],
            $c['empleado'],
        ]);
    }

    /**
     * Snapshot sync of the payments history inside the caller's transaction scope:
     * rows with an existing id (for this site) are updated in place, others are
     * inserted, and rows missing from the snapshot are deleted.
     *
     * @param list<array{id: int|null, fecha: string, concepto: string, monto: float, estado: string}> $rows
     */
    public function syncPagosHistorial(int $siteId, array $rows): void
    {
        $this->transactional(function () use ($siteId, $rows): void {
            $existing = $this->existingIds('account_pagos_historial', $siteId);

            $update = $this->pdo->prepare(
                'UPDATE account_pagos_historial
                 SET fecha = ?, concepto = ?, monto = ?, estado = ?
                 WHERE id = ? AND site_id = ?'
            );
            $insert = $this->pdo->prepare(
                'INSERT INTO account_pagos_historial (site_id, fecha, concepto, monto, estado)
                 VALUES (?, ?, ?, ?, ?)'
            );

            $keep = [];
            foreach ($rows as $row) {
                $id = $row['id'];
                if ($id !== null && isset($existing[$id]) && !isset($keep[$id])) {
                    $update->execute([$row['fecha'], $row['concepto'], $row['monto'], $row['estado'], $id, $siteId]);
                    $keep[$id] = true;
                    continue;
                }

                $insert->execute([$siteId, $row['fecha'], $row['concepto'], $row['monto'], $row['estado']]);
                $keep[(int) $this->pdo->lastInsertId()] = true;
            }

            $this->deleteMissing('account_pagos_historial', $siteId, array_keys($keep));
        });
    }

    /**
     * Snapshot sync of the referidos list. Rows are expected in the order they
     * must be inserted (callers pass them reversed so newest gets highest id).
     *
     * @param list<array{id: int|null, nombre: string, telefono: string, estado: string, cerrado: int}> $rows
     */
    public function syncReferidos(int $siteId, array $rows): void
    {
        $this->transactional(function () use ($siteId, $rows): void {
            $existing = $this->existingIds('account_referidos', $siteId);

            $update = $this->pdo->prepare(
                'UPDATE account_referidos
                 SET nombre = ?, telefono = ?, estado = ?, cerrado = ?
                 WHERE id = ? AND site_id = ?'
            );
            $insert = $this->pdo->prepare(
                'INSERT INTO account_referidos (site_id, nombre, telefono, estado, cerrado)
                 VALUES (?, ?, ?, ?, ?)'
            );

            $keep = [];
            foreach ($rows as $row) {
                $id = $row['id'];
                if ($id !== null && isset($existing[$id]) && !isset($keep[$id])) {
                    $update->execute([$row['nombre'], $row['telefono'], $row['estado'], $row['cerrado'], $id, $siteId]);
                    $keep[$id] = true;
                    continue;
                }

                $insert->execute([$siteId, $row['nombre'], $row['telefono'], $row['estado'], $row['cerrado']]);
                $keep[(int) $this->pdo->lastInsertId()] = true;
            }

            $this->deleteMissing('account_referidos', $siteId, array_keys($keep));
        });
    }

    /**
     * @return array<int, true> set of ids belonging to the site
     */
    private function existingIds(string $table, int $siteId): array
    {
        $stmt = $this->pdo->prepare("SELECT id FROM {$table} WHERE site_id = ?");
        $stmt->execute([$siteId]);

        $ids = [];
        foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $id) {
            $ids[(int) $id] = true;
        }

        return $ids;
    }

    /**
     * @param list<int> $keepIds
     */
    private function deleteMissing(string $table, int $siteId, array $keepIds): void
    {
        if ($keepIds === []) {
            $this->pdo->prepare("DELETE FROM {$table} WHERE site_id = ?")->execute([$siteId]);

            return;
        }

        $placeholders = implode(',', array_fill(0, count($keepIds), '?'));
        $this->pdo->prepare("DELETE FROM {$table} WHERE site_id = ? AND id NOT IN ({$placeholders})")
            ->execute(array_merge([$siteId], $keepIds));
    }
}
