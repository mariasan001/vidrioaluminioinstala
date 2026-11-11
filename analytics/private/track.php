<?php

declare(strict_types=1);

require_once __DIR__ . '/Domain/bootstrap.php';

// Autoload TrackValidator so global AVI_EVENT_TYPES / AVI_SECTIONS / AVI_SOURCES / AVI_DEVICES exist.
class_exists(\Avi\Domain\Track\TrackValidator::class);

function avi_handle_track(): void
{
    \Avi\Domain\Track\TrackController::handle();
}
