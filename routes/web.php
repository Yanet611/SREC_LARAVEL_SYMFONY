<?php

use App\Http\Controllers\ActiviteController;
use App\Http\Controllers\CourrierController;
use App\Http\Controllers\ConventionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MobiliteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PartenaireController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\StatistiqueController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\LogController;
use Illuminate\Support\Facades\Route;

// ── Accueil → redirection vers login ─────────────────────────────────────────
Route::get('/', fn() => redirect()->route('login'));

// ── Authentifiés ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard par rôle
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/recteur', [DashboardController::class, 'recteur'])
        ->middleware('role:recteur|admin')->name('dashboard.recteur');
    Route::get('/dashboard/secretariat', [DashboardController::class, 'secretariat'])
        ->middleware('role:secretariat|admin')->name('dashboard.secretariat');

    // Courriers — création & modification : secrétariat uniquement
    Route::group(['middleware' => ['role:secretariat']], function () {
        Route::resource('courriers', CourrierController::class)->only(['create', 'store', 'edit', 'update']);
        Route::get('courriers/convocation/{rendez_vous}', [CourrierController::class, 'convocationRdv'])
            ->name('courriers.convocation');
    });

    // Courriers — consultation & statuts : tous les rôles
    Route::group(['middleware' => ['role:admin|directrice|recteur|secretariat']], function () {
        Route::resource('courriers', CourrierController::class)->only(['index', 'show']);
        Route::post('courriers/{courrier}/statut', [CourrierController::class, 'changerStatut'])
            ->name('courriers.statut');
        Route::post('courriers/{courrier}/archiver', [CourrierController::class, 'archiver'])
            ->name('courriers.archiver');
    });

    // Partenaires — création & modification : directrice uniquement (pas le recteur)
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('partenaires', PartenaireController::class)->only(['create', 'store', 'edit', 'update']);
    });
    // Partenaires — lecture : directrice et recteur
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('partenaires', PartenaireController::class)->only(['index', 'show']);
    });

    // Conventions — création & modification : directrice uniquement (pas le recteur)
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('conventions', ConventionController::class)->only(['create', 'store', 'edit', 'update']);
        Route::post('conventions/brouillon/{courrier}', [ConventionController::class, 'genererBrouillon'])
            ->name('conventions.brouillon');
    });
    // Conventions — lecture & actions de statut : directrice et recteur
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('conventions', ConventionController::class)->only(['index', 'show']);
        Route::post('conventions/{convention}/statut', [ConventionController::class, 'changerStatut'])
            ->name('conventions.statut');
        Route::post('conventions/{convention}/signer', [ConventionController::class, 'signer'])
            ->name('conventions.signer');
    });

    // Activités
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('activites', ActiviteController::class);
    });

    // Mobilités — création, modification & suppression : directrice uniquement (pas le recteur)
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('mobilites', MobiliteController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
    });
    // Mobilités — lecture : directrice et recteur
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('mobilites', MobiliteController::class)->only(['index', 'show']);
    });

    // Rendez-vous & Rapports
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('rendez-vous', RendezVousController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('rendez-vous/{rendez_vou}/rapport', [RendezVousController::class, 'storeRapport'])
            ->name('rendez-vous.rapport');
    });

    // Statistiques
    Route::get('/statistiques', [StatistiqueController::class, 'index'])
        ->name('statistiques.index')
        ->middleware('role:admin|directrice');

    // Archives
    Route::get('/archives', [ArchiveController::class, 'index'])
        ->name('archives.index')
        ->middleware('role:admin|directrice');

    // Administration (utilisateurs & logs) — réservé admin
    Route::group(['middleware' => ['role:admin']], function () {
        Route::resource('users', UserController::class)->except(['show']);
        Route::get('/logs', [LogController::class, 'index'])->name('logs.index');
    });

    // Notifications (JSON)
    Route::prefix('api')->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{notification}/lue', [NotificationController::class, 'marquerLue'])->name('notifications.lue');
        Route::post('/notifications/tout-lire', [NotificationController::class, 'marquerToutesLues'])->name('notifications.tout-lire');
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
