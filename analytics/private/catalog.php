<?php

declare(strict_types=1);

require_once __DIR__ . '/Domain/bootstrap.php';

function avi_catalog_dispatch(): void
{
    \Avi\Domain\Catalog\CatalogController::dispatch();
}
