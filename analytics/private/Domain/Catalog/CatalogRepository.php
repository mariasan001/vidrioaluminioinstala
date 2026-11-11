<?php

declare(strict_types=1);

namespace Avi\Domain\Catalog;

/**
 * Persistence for the live product catalog (JSON file under public_html/data).
 */
final class CatalogRepository
{
    public function __construct(private readonly string $file)
    {
    }

    public static function resolvePath(): string
    {
        $candidates = [
            dirname(__DIR__, 3) . '/public_html/data/catalogo.json',
            dirname(__DIR__, 4) . '/public/data/catalogo.json',
        ];

        foreach ($candidates as $path) {
            if (is_file($path) || is_dir(dirname($path))) {
                return $path;
            }
        }

        return $candidates[0];
    }

    /** @return array{productos: list<mixed>} */
    public function read(): array
    {
        if (!is_file($this->file)) {
            return ['productos' => []];
        }

        $decoded = json_decode((string) file_get_contents($this->file), true);

        if (!is_array($decoded) || !isset($decoded['productos']) || !is_array($decoded['productos'])) {
            return ['productos' => []];
        }

        return $decoded;
    }

    /** @param array{productos: list<mixed>} $data */
    public function write(array $data): bool
    {
        $dir = dirname($this->file);

        if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
            return false;
        }

        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

        if (!is_string($json)) {
            return false;
        }

        return file_put_contents($this->file, $json . "\n", LOCK_EX) !== false;
    }
}
