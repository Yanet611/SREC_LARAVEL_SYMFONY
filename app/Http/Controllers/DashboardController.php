<?php

namespace App\Http\Controllers;

use App\Models\Courrier;
use App\Models\Convention;
use App\Models\Mobilite;
use App\Models\NotificationSrec;
use App\Models\Partenaire;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->estRecteur()) {
            return redirect()->route('dashboard.recteur');
        }

        if ($user->estSecretariat()) {
            return redirect()->route('dashboard.secretariat');
        }

        // ── KPIs ─────────────────────────────────────────────────────────────
        $kpis = [
            'courriers_total'      => Courrier::actifs()->count(),
            'courriers_en_attente' => Courrier::actifs()->enAttente()->count(),
            'partenaires_actifs'   => Partenaire::actifs()->count(),
            'conventions_actives'  => Convention::actives()->signees()->count(),
            'conventions_en_cours' => Convention::actives()->enCours()->count(),
            'mobilites_annee'      => Mobilite::whereYear('date_depart', now()->year)->count(),
        ];

        // ── File d'attente "mon action" ──────────────────────────────────────
        $fileAction = [];

        if ($user->estDirectrice() || $user->estAdmin()) {
            $fileAction = Courrier::actifs()
                ->whereIn('statut', ['soumis_directrice'])
                ->with('soumisParUser')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($c) => [
                    'id'     => $c->id,
                    'type'   => 'courrier',
                    'label'  => $c->numero . ' — ' . $c->objet,
                    'statut' => $c->statut_label,
                    'color'  => $c->statut_color,
                    'date'   => $c->created_at->diffForHumans(),
                ]);

            // Ajouter les conventions en attente Directrice
            Convention::actives()
                ->whereIn('statut', ['soumise_directrice'])
                ->latest()
                ->take(5)
                ->get()
                ->each(fn($conv) => $fileAction->push([
                    'id'     => $conv->id,
                    'type'   => 'convention',
                    'label'  => $conv->reference . ' — ' . $conv->intitule,
                    'statut' => $conv->statut_label,
                    'color'  => $conv->statut_color,
                    'date'   => $conv->created_at->diffForHumans(),
                ]));
        }

        if ($user->estRecteur()) {
            $fileAction = collect();
            Courrier::actifs()
                ->where('statut', 'soumis_recteur')
                ->latest()->take(5)->get()
                ->each(fn($c) => $fileAction->push([
                    'id'    => $c->id, 'type' => 'courrier',
                    'label' => $c->numero . ' — ' . $c->objet,
                    'statut' => $c->statut_label, 'color' => $c->statut_color,
                    'date'  => $c->created_at->diffForHumans(),
                ]));
            Convention::actives()
                ->where('statut', 'soumise_recteur')
                ->latest()->take(5)->get()
                ->each(fn($conv) => $fileAction->push([
                    'id'    => $conv->id, 'type' => 'convention',
                    'label' => $conv->reference . ' — ' . $conv->intitule,
                    'statut' => $conv->statut_label, 'color' => $conv->statut_color,
                    'date'  => $conv->created_at->diffForHumans(),
                ]));
        }

        // ── Graphique : Courriers par mois (6 derniers mois) ─────────────────
        $courriersParMois = [];
        for ($i = 5; $i >= 0; $i--) {
            $mois = now()->subMonths($i);
            $courriersParMois[] = [
                'mois'   => $mois->locale('fr')->isoFormat('MMM YY'),
                'entrant' => Courrier::where('sens', 'entrant')
                    ->whereYear('date_courrier', $mois->year)
                    ->whereMonth('date_courrier', $mois->month)
                    ->count(),
                'sortant' => Courrier::where('sens', 'sortant')
                    ->whereYear('date_courrier', $mois->year)
                    ->whereMonth('date_courrier', $mois->month)
                    ->count(),
            ];
        }

        // ── Activité récente ─────────────────────────────────────────────────
        $activiteRecente = Courrier::actifs()
            ->with('soumisParUser')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($c) => [
                'id'      => $c->id,
                'numero'  => $c->numero,
                'objet'   => $c->objet,
                'statut'  => $c->statut_label,
                'color'   => $c->statut_color,
                'date'    => $c->created_at->diffForHumans(),
                'auteur'  => $c->soumisParUser?->name,
            ]);

        // ── Notifications non lues ────────────────────────────────────────────
        $notifs = $user->notificationsNonLues()
            ->latest('created_at')
            ->take(10)
            ->get();

        // ── Alertes d'inactivité (bloqués > 48h) ───────────────────────────────────
        $seuilH = 48;
        $courriersBlockes = [];
        if ($user->estDirectrice() || $user->estAdmin()) {
            $courriersBlockes = Courrier::actifs()
                ->whereIn('statut', ['soumis_directrice', 'examine_directrice'])
                ->where('updated_at', '<', now()->subHours($seuilH))
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($c) => [
                    'id'       => $c->id,
                    'numero'   => $c->numero,
                    'objet'    => $c->objet,
                    'statut'   => $c->statut_label,
                    'heures'   => (int) now()->diffInHours($c->updated_at),
                ])
                ->values();
        }
        if ($user->estSecretariat()) {
            $courriersBlockes = Courrier::actifs()
                ->whereIn('statut', ['soumis_directrice', 'examine_directrice', 'soumis_recteur'])
                ->where('updated_at', '<', now()->subHours($seuilH))
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($c) => [
                    'id'       => $c->id,
                    'numero'   => $c->numero,
                    'objet'    => $c->objet,
                    'statut'   => $c->statut_label,
                    'heures'   => (int) now()->diffInHours($c->updated_at),
                ])
                ->values();
        }

        return Inertia::render('Dashboard', [
            'kpis'             => $kpis,
            'fileAction'       => $fileAction->values(),
            'courriersParMois' => $courriersParMois,
            'activiteRecente'  => $activiteRecente,
            'notifications'    => $notifs,
            'courriersBlockes' => $courriersBlockes,
            'userRole'         => $user->roles->first()?->name ?? 'inconnu',
        ]);
    }

    public function recteur(Request $request): Response
    {
        $fileDecision = collect();

        Courrier::actifs()->where('statut', 'soumis_recteur')->with('soumisParUser')->latest()->take(10)->get()
            ->each(fn($c) => $fileDecision->push([
                'id' => $c->id, 'type' => 'courrier', 'numero' => $c->numero,
                'objet' => $c->objet, 'date' => $c->updated_at->format('d/m/Y'),
                'soumis_par' => $c->soumisParUser?->name,
            ]));

        Convention::actives()->where('statut', 'soumise_recteur')->with('partenaire', 'soumisePar')->latest()->take(10)->get()
            ->each(fn($conv) => $fileDecision->push([
                'id' => $conv->id, 'type' => 'convention', 'numero' => $conv->reference,
                'objet' => $conv->intitule, 'date' => $conv->updated_at->format('d/m/Y'),
                'soumis_par' => $conv->soumisePar?->name, 'partenaire' => $conv->partenaire->nom,
            ]));

        // ── Statistiques avancées Executive Dashboard ─────────────────────
        $totalTraites = Courrier::whereIn('statut', ['valide', 'rejete'])->count();
        $totalValides  = Courrier::where('statut', 'valide')->count();
        $tauxValidation = $totalTraites > 0 ? round(($totalValides / $totalTraites) * 100) : 0;

        // Top 5 partenaires par nb de conventions
        $topPartenaires = Partenaire::withCount('conventions')
            ->orderByDesc('conventions_count')
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'nom'    => $p->nom,
                'sigle'  => $p->sigle,
                'pays'   => $p->pays,
                'count'  => $p->conventions_count,
            ]);

        // Évolution conventions signées (5 dernières années)
        $evolutionConventions = [];
        for ($i = 4; $i >= 0; $i--) {
            $annee = now()->subYears($i)->year;
            $evolutionConventions[] = [
                'annee' => $annee,
                'count' => Convention::where('statut', 'signee')->whereYear('date_signature', $annee)->count(),
            ];
        }

        // Répartition types de courriers entrants
        $repartitionTypes = [
            ['type' => 'Demande partenariat', 'count' => Courrier::where('type','demande_partenariat')->where('sens','entrant')->count()],
            ['type' => 'Demande convention',  'count' => Courrier::where('type','demande_convention')->where('sens','entrant')->count()],
            ['type' => 'Invitation',           'count' => Courrier::where('type','invitation')->where('sens','entrant')->count()],
            ['type' => 'Information',          'count' => Courrier::where('type','information')->where('sens','entrant')->count()],
        ];

        // Conventions expirant dans < 30 jours
        $conventionsExpirant = Convention::where('statut', 'signee')
            ->whereNotNull('date_fin')
            ->whereDate('date_fin', '>=', today())
            ->whereDate('date_fin', '<=', today()->addDays(30))
            ->with('partenaire')
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'reference'  => $c->reference,
                'intitule'   => $c->intitule,
                'partenaire' => $c->partenaire?->nom,
                'date_fin'   => $c->date_fin->format('d/m/Y'),
                'jours'      => (int) today()->diffInDays($c->date_fin),
            ])
            ->values();

        return Inertia::render('Dashboard/Recteur', [
            'fileDecision'         => $fileDecision->values(),
            'stats' => [
                'en_attente'       => $fileDecision->count(),
                'traites_mois'     => Courrier::where('statut', 'valide')->whereMonth('updated_at', now()->month)->count(),
                'taux_validation'  => $tauxValidation,
                'conventions_signees' => Convention::where('statut', 'signee')->count(),
                'partenaires_actifs'  => Partenaire::actifs()->count(),
            ],
            'topPartenaires'       => $topPartenaires,
            'evolutionConventions' => $evolutionConventions,
            'repartitionTypes'     => $repartitionTypes,
            'conventionsExpirant'  => $conventionsExpirant,
        ]);
    }

    public function secretariat(Request $request): Response
    {
        $courriersDuJour = Courrier::actifs()
            ->whereDate('created_at', today())
            ->with('soumisParUser')
            ->get();

        $enAttente = Courrier::actifs()
            ->whereIn('statut', ['soumis', 'recu'])
            ->latest()->take(10)->get();

        return Inertia::render('Dashboard/Secretariat', [
            'courriersDuJour' => $courriersDuJour->map(fn($c) => [
                'id' => $c->id, 'numero' => $c->numero, 'objet' => $c->objet,
                'statut' => $c->statut_label, 'color' => $c->statut_color,
            ]),
            'enAttente' => $enAttente->map(fn($c) => [
                'id' => $c->id, 'numero' => $c->numero, 'objet' => $c->objet,
                'statut' => $c->statut_label, 'color' => $c->statut_color,
                'date' => $c->created_at->diffForHumans(),
            ]),
            'stats' => [
                'total_aujourd_hui' => $courriersDuJour->count(),
                'non_traites'       => Courrier::actifs()->whereIn('statut', ['soumis', 'recu'])->count(),
                'total_semaine'     => Courrier::actifs()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ],
        ]);
    }
}
