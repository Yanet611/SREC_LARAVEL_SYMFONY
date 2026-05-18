<?php

namespace App\Http\Controllers;

use App\Models\Historique;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Historique::with(['user', 'entite'])
            ->when($request->filled('user_id'), fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->filled('action'), fn($q) => $q->where('action', $request->action))
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->whereHas('user', fn($uq) => $uq->where('name', 'like', '%' . $request->search . '%'))
                  ->orWhere('commentaire', 'like', '%' . $request->search . '%');
            })
            ->latest('created_at');

        $logs = $query->paginate(50)->withQueryString()->through(fn ($log) => [
            'id'             => $log->id,
            'user'           => $log->user ? $log->user->name : 'Système',
            'user_role'      => $log->user && $log->user->roles->isNotEmpty() ? $log->user->roles->first()->name : null,
            'action'         => $log->action,
            'entite_type'    => class_basename($log->entite_type),
            'entite_id'      => $log->entite_id,
            'entite_nom'     => $this->getEntiteNom($log->entite),
            'ancien_statut'  => $log->ancien_statut,
            'nouveau_statut' => $log->nouveau_statut,
            'commentaire'    => $log->commentaire,
            'date'           => $log->created_at->format('d/m/Y H:i:s'),
            'diffForHumans'  => $log->created_at->diffForHumans(),
        ]);

        return Inertia::render('Admin/Logs', [
            'logs'    => $logs,
            'filtres' => $request->only(['user_id', 'action', 'search']),
            'users'   => \App\Models\User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    private function getEntiteNom($entite): string
    {
        if (!$entite) return 'Entité supprimée';

        if ($entite instanceof \App\Models\Courrier) {
            return "Courrier {$entite->numero}";
        }
        if ($entite instanceof \App\Models\Convention) {
            return "Convention {$entite->reference}";
        }
        if ($entite instanceof \App\Models\Partenaire) {
            return "Partenaire {$entite->nom}";
        }
        if ($entite instanceof \App\Models\Mobilite) {
            return "Mobilité {$entite->reference}";
        }
        if ($entite instanceof \App\Models\Activite) {
            return "Activité {$entite->titre}";
        }

        return "ID: {$entite->id}";
    }
}
