<?php

declare(strict_types=1);

namespace Avi\Domain\Crm;

use PDO;
use Throwable;

/**
 * Persistence for crm_contacts / crm_quotes. Receives already-normalized rows.
 *
 * Primary keys are global (id only), so upserts never take over a row that
 * belongs to another site: every column assignment is guarded by site_id.
 */
final class CrmRepository
{
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

    /** @return list<array<string, mixed>> */
    public function listContacts(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, nombre, telefono, canal, servicio, fecha, estatus, nota, rol, historial
             FROM crm_contacts WHERE site_id = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** @return list<array<string, mixed>> */
    public function listQuotes(int $siteId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, contact_id, payload FROM crm_quotes WHERE site_id = ? ORDER BY updated_at DESC'
        );
        $stmt->execute([$siteId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Upserts the given contacts and deletes the site's contacts that are not
     * in the incoming set. Must run inside a transaction (see syncSnapshot()).
     *
     * @param list<array<string, mixed>> $contacts normalized rows
     */
    public function syncContacts(int $siteId, array $contacts): void
    {
        $upsert = $this->pdo->prepare(
            'INSERT INTO crm_contacts
             (id, site_id, nombre, telefono, canal, servicio, fecha, estatus, nota, rol, historial)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               nombre = IF(site_id = VALUES(site_id), VALUES(nombre), nombre),
               telefono = IF(site_id = VALUES(site_id), VALUES(telefono), telefono),
               canal = IF(site_id = VALUES(site_id), VALUES(canal), canal),
               servicio = IF(site_id = VALUES(site_id), VALUES(servicio), servicio),
               fecha = IF(site_id = VALUES(site_id), VALUES(fecha), fecha),
               estatus = IF(site_id = VALUES(site_id), VALUES(estatus), estatus),
               nota = IF(site_id = VALUES(site_id), VALUES(nota), nota),
               rol = IF(site_id = VALUES(site_id), VALUES(rol), rol),
               historial = IF(site_id = VALUES(site_id), VALUES(historial), historial)'
        );

        $ids = [];
        foreach ($contacts as $row) {
            $upsert->execute([
                $row['id'],
                $siteId,
                $row['nombre'],
                $row['telefono'],
                $row['canal'],
                $row['servicio'],
                $row['fecha'],
                $row['estatus'],
                $row['nota'],
                $row['rol'],
                $row['historial'],
            ]);
            $ids[$row['id']] = true;
        }

        $this->deleteMissing('crm_contacts', $siteId, array_map('strval', array_keys($ids)));
    }

    /**
     * @param list<array<string, mixed>> $quotes normalized rows
     */
    public function syncQuotes(int $siteId, array $quotes): void
    {
        $upsert = $this->pdo->prepare(
            'INSERT INTO crm_quotes (id, site_id, contact_id, payload)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               contact_id = IF(site_id = VALUES(site_id), VALUES(contact_id), contact_id),
               payload = IF(site_id = VALUES(site_id), VALUES(payload), payload)'
        );

        $ids = [];
        foreach ($quotes as $row) {
            $upsert->execute([$row['id'], $siteId, $row['contactId'], $row['payload']]);
            $ids[$row['id']] = true;
        }

        $this->deleteMissing('crm_quotes', $siteId, array_map('strval', array_keys($ids)));
    }

    /**
     * Deletes the site's rows whose id is not in $keepIds. With no incoming ids
     * the snapshot is empty, so every row of the site is removed.
     *
     * @param 'crm_contacts'|'crm_quotes' $table fixed identifier, never user input
     * @param list<string> $keepIds
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
