<?php

declare(strict_types=1);

namespace Avi\Domain\Catalog;

/**
 * Catalog use-cases: read, upsert product, delete product.
 */
final class CatalogService
{
    public function __construct(private readonly CatalogRepository $repository)
    {
    }

    /** @return array{productos: list<mixed>} */
    public function listAll(): array
    {
        return $this->repository->read();
    }

    /**
     * @param array<string, mixed> $product
     * @return array{ok: bool, productos?: list<mixed>, error?: string}
     */
    public function save(string $action, string $id, array $product): array
    {
        $store = $this->repository->read();

        if ($action === 'eliminar') {
            if (!preg_match('/^[a-z0-9_-]{4,40}$/', $id)) {
                return ['ok' => false, 'error' => 'id'];
            }

            $store['productos'] = array_values(array_filter(
                $store['productos'],
                static fn ($row): bool => !is_array($row) || ($row['id'] ?? '') !== $id
            ));
        } else {
            $nextId = $action === 'editar' && preg_match('/^[a-z0-9_-]{4,40}$/', $id)
                ? $id
                : 'p' . bin2hex(random_bytes(4));
            $clean = $this->normalize($product, $nextId);

            if ($clean === null) {
                return ['ok' => false, 'error' => 'validation'];
            }

            $replaced = false;
            foreach ($store['productos'] as $index => $row) {
                if (is_array($row) && ($row['id'] ?? '') === $nextId) {
                    $store['productos'][$index] = $clean;
                    $replaced = true;
                }
            }

            if (!$replaced) {
                $store['productos'][] = $clean;
            }
        }

        if (!$this->repository->write($store)) {
            return ['ok' => false, 'error' => 'write'];
        }

        return ['ok' => true, 'productos' => $store['productos']];
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, string>|null
     */
    private function normalize(array $row, string $id): ?array
    {
        $pagina = isset($row['pagina']) && is_string($row['pagina']) ? $row['pagina'] : '';
        $titulo = isset($row['titulo']) && is_string($row['titulo']) ? trim($row['titulo']) : '';
        $accion = isset($row['accion']) && is_string($row['accion']) ? $row['accion'] : 'preguntar';

        if ($titulo === '' || strlen($titulo) > 120 || !preg_match('#^/[a-z0-9/_-]*$#', $pagina) || strlen($pagina) > 200) {
            return null;
        }

        if (!in_array($accion, ['preguntar', 'precio', 'color'], true)) {
            $accion = 'preguntar';
        }

        $text = static function ($value, int $max): string {
            $clean = is_string($value) ? trim($value) : '';

            return strlen($clean) > $max ? substr($clean, 0, $max) : $clean;
        };

        $imagen = $text($row['imagen'] ?? '', 1800000);

        if ($imagen !== '' && !str_starts_with($imagen, '/img/') && !str_starts_with($imagen, '/catalogo/') && !str_starts_with($imagen, 'data:image/')) {
            $imagen = '';
        }

        return [
            'id' => $id,
            'pagina' => $pagina,
            'titulo' => $titulo,
            'descripcion' => $text($row['descripcion'] ?? '', 600),
            'caracteristicas' => $text($row['caracteristicas'] ?? '', 300),
            'imagen' => $imagen,
            'accion' => $accion,
            'precio' => $accion === 'precio' ? $text($row['precio'] ?? '', 40) : '',
            'color' => $accion === 'color' ? $text($row['color'] ?? '', 40) : '',
        ];
    }
}
