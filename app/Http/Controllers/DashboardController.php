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

        return Inertia::render('Dashboard', [
            'kpis'             => $kpis,
            'fileAction'       => $fileAction->values(),
            'courriersParMois' => $courriersParMois,
            'activiteRecente'  => $activiteRecente,
            'notifications'    => $notifs,
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

        return Inertia::render('Dashboard/Recteur', [
            'fileDecision' => $fileDecision->values(),
            'stats' => [
                'en_attente' => $fileDecision->count(),
                'traites_mois' => Courrier::where('statut', 'valide')
                    ->whereMonth('updated_at', now()->month)->count(),
            ],
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
