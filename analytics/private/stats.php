<?php

declare(strict_types=1);

require_once __DIR__ . '/Domain/bootstrap.php';

function avi_stats_resumen(): void
{
    \Avi\Domain\Stats\StatsController::resumen();
}

function avi_stats_clics(): void
{
    \Avi\Domain\Stats\StatsController::clics();
}

function avi_stats_paginas(): void
{
    \Avi\Domain\Stats\StatsController::paginas();
}

function avi_stats_embudo(): void
{
    \Avi\Domain\Stats\StatsController::embudo();
}

function avi_stats_referidos(): void
{
    \Avi\Domain\Stats\StatsController::referidos();
}

function avi_stats_visitas(): void
{
    \Avi\Domain\Stats\StatsController::visitas();
}

function avi_stats_visita(): void
{
    \Avi\Domain\Stats\StatsController::visita();
}
