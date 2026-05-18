<?php

use App\Console\Commands\AlertesQuotidiennes;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Alertes quotidiennes SREC ─────────────────────────────────────────────────
// Envoie chaque matin à 8h00 :
//  - Alertes conventions qui expirent (30j / 7j / expirées)
//  - Alertes demandes de partenariat non traitées depuis plus de 3 jours
Schedule::command(AlertesQuotidiennes::class)
    ->dailyAt('08:00')
    ->timezone('Africa/Conakry')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/alertes.log'));
