<?php

namespace App\Http\Controllers;

use App\Models\Courrier;
use App\Models\Convention;
use App\Models\Mobilite;
use App\Models\Activite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatistiqueController extends Controller
{
    public function index()
    {
        // KPIs Globaux
        $totalCourriers = Courrier::count();
        $conventionsActives = Convention::where('statut', 'signee')->count();
        $mobilitesEnCours = Mobilite::whereIn('statut', ['approuvee', 'en_cours'])->count();
        $activitesPlanifiees = Activite::where('statut', 'planifiee')->count();

        // Répartition des courriers par type
        $courriersParType = Courrier::selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return ['name' => ucfirst($item->type), 'value' => $item->count];
            })->values()->toArray();

        // Mobilités par type
        $mobilitesParSens = Mobilite::selectRaw('type_mobilite, count(*) as count')
            ->groupBy('type_mobilite')
            ->get()
            ->map(function ($item) {
                return ['name' => ucfirst($item->type_mobilite), 'value' => $item->count];
            })->values()->toArray();

        // Évolution des courriers (6 derniers mois)
        $evolutionCourriers = Courrier::selectRaw('DATE_FORMAT(created_at, "%b") as mois, count(*) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('mois')
            ->orderByRaw('MIN(created_at) asc')
            ->get()->toArray();

        return Inertia::render('Statistiques/Index', [
            'kpis' => [
                'totalCourriers' => $totalCourriers,
                'conventionsActives' => $conventionsActives,
                'mobilitesEnCours' => $mobilitesEnCours,
                'activitesPlanifiees' => $activitesPlanifiees,
            ],
            'charts' => [
                'courriersParType' => $courriersParType,
                'mobilitesParSens' => $mobilitesParSens,
                'evolutionCourriers' => $evolutionCourriers,
            ]
        ]);
    }
}
