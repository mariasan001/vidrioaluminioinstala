<?php

declare(strict_types=1);

namespace Avi\Domain\Crm;

/**
 * CRM use-cases: read model and transactional snapshot sync.
 */
final class CrmService
{
    public function __construct(private readonly CrmRepository $repository)
    {
    }

    /**
     * @return array{contacts: list<array<string, mixed>>, quotes: list<array<string, mixed>>}
     */
    public function listAll(int $siteId): array
    {
        $contacts = [];
        foreach ($this->repository->listContacts($siteId) as $row) {
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

        $quotes = [];
        foreach ($this->repository->listQuotes($siteId) as $row) {
            $payload = [];
            if (is_string($row['payload'] ?? null)) {
                $decoded = json_decode($row['payload'], true);
                if (is_array($decoded)) {
                    $payload = $decoded;
                }
            }
            $quotes[] = array_merge(
                ['id' => (string) $row['id'], 'contactId' => (string) $row['contact_id']],
                $payload
            );
        }

        return ['contacts' => $contacts, 'quotes' => $quotes];
    }

    /**
     * Full-snapshot sync in a single transaction. A null argument means the
     * collection was not sent and is left untouched.
     *
     * @param array<mixed>|null $contacts
     * @param array<mixed>|null $quotes
     */
    public function sync(int $siteId, ?array $contacts, ?array $quotes): void
    {
        $normalizedContacts = $contacts === null ? null : $this->normalizeContacts($contacts);
        $normalizedQuotes = $quotes === null ? null : $this->normalizeQuotes($quotes);

        $this->repository->transactional(function () use ($siteId, $normalizedContacts, $normalizedQuotes): void {
            if ($normalizedContacts !== null) {
                $this->repository->syncContacts($siteId, $normalizedContacts);
            }
            if ($normalizedQuotes !== null) {
                $this->repository->syncQuotes($siteId, $normalizedQuotes);
            }
        });
    }

    /**
     * @param array<mixed> $rows
     * @return list<array<string, mixed>>
     */
    private function normalizeContacts(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            $id = substr(trim((string) ($row['id'] ?? '')), 0, 40);
            $nombre = substr(trim((string) ($row['nombre'] ?? '')), 0, 120);
            if ($id === '' || $nombre === '') {
                continue;
            }

            $fecha = (string) ($row['fecha'] ?? date('Y-m-d'));
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                $fecha = date('Y-m-d');
            }

            $historial = json_encode(
                is_array($row['historial'] ?? null) ? $row['historial'] : [],
                JSON_UNESCAPED_UNICODE
            );

            $out[] = [
                'id' => $id,
                'nombre' => $nombre,
                'telefono' => substr(trim((string) ($row['telefono'] ?? '')), 0, 40),
                'canal' => (($row['canal'] ?? '') === 'llamada') ? 'llamada' : 'whatsapp',
                'servicio' => substr(trim((string) ($row['servicio'] ?? '')), 0, 80),
                'fecha' => $fecha,
                'estatus' => substr(trim((string) ($row['estatus'] ?? 'Nuevo')), 0, 40),
                'nota' => substr(trim((string) ($row['nota'] ?? '')), 0, 500),
                'rol' => (($row['rol'] ?? '') === 'cliente') ? 'cliente' : 'prospecto',
                'historial' => $historial === false ? '[]' : $historial,
            ];
        }

        return $out;
    }

    /**
     * @param array<mixed> $rows
     * @return list<array<string, mixed>>
     */
    private function normalizeQuotes(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
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

            $out[] = [
                'id' => $id,
                'contactId' => $contactId,
                'payload' => $json === false ? '{}' : $json,
            ];
        }

        return $out;
    }
}
