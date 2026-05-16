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

    // Courriers — consultation & statuts : tous les rôles
    Route::group(['middleware' => ['role:admin|directrice|recteur|secretariat']], function () {
        Route::resource('courriers', CourrierController::class)->only(['index', 'show']);
        Route::post('courriers/{courrier}/statut', [CourrierController::class, 'changerStatut'])
            ->name('courriers.statut');
        Route::post('courriers/{courrier}/archiver', [CourrierController::class, 'archiver'])
            ->name('courriers.archiver');
    });

    // Courriers — création & modification : secrétariat uniquement
    Route::group(['middleware' => ['role:secretariat']], function () {
        Route::resource('courriers', CourrierController::class)->only(['create', 'store', 'edit', 'update']);
        Route::get('courriers/convocation/{rendez_vous}', [CourrierController::class, 'convocationRdv'])
            ->name('courriers.convocation');
    });

    // Partenaires
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('partenaires', PartenaireController::class)->except(['destroy']);
    });

    // Conventions
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('conventions', ConventionController::class)->except(['destroy']);
        Route::post('conventions/{convention}/statut', [ConventionController::class, 'changerStatut'])
            ->name('conventions.statut');
        Route::post('conventions/brouillon/{courrier}', [ConventionController::class, 'genererBrouillon'])
            ->name('conventions.brouillon');
    });

    // Activités
    Route::group(['middleware' => ['role:admin|directrice']], function () {
        Route::resource('activites', ActiviteController::class);
    });

    // Mobilités
    Route::group(['middleware' => ['role:admin|directrice|recteur']], function () {
        Route::resource('mobilites', MobiliteController::class);
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

    // Administration (utilisateurs) — réservé admin
    Route::resource('users', UserController::class)
        ->middleware('role:admin')
        ->except(['show']);

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
