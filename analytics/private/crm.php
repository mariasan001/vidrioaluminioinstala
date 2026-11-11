<?php

declare(strict_types=1);

require_once __DIR__ . '/Domain/bootstrap.php';

function avi_crm_dispatch(): void
{
    \Avi\Domain\Crm\CrmController::dispatch();
}
