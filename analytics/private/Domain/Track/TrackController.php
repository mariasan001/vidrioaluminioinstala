<?php

declare(strict_types=1);

namespace Avi\Domain\Track;

use Throwable;

final class TrackController
{
    public static function handle(): void
    {
        try {
            (new TrackService(new TrackRepository()))->handle();
        } catch (Throwable $error) {
            avi_log('track_exception ' . $error->getMessage());
            avi_json(500);
        }
    }
}
