<?php

declare(strict_types=1);

require_once __DIR__ . '/Domain/bootstrap.php';

function avi_account_dispatch(): void
{
    \Avi\Domain\Account\AccountController::dispatch();
}
