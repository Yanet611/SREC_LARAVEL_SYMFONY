<?php

namespace App\Http\Controllers;

use App\Models\Courrier;
use App\Models\Convention;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $courriersArchives = Courrier::where('statut', 'archive')
            ->when($search, fn($q) => $q->where('objet', 'like', "%{$search}%")->orWhere('numero', 'like', "%{$search}%"))
            ->orderByDesc('updated_at')
            ->paginate(10, ['*'], 'courriersPage')
            ->withQueryString();

        $conventionsExpirees = Convention::whereIn('statut', ['expiree', 'annulee'])
            ->when($search, fn($q) => $q->where('intitule', 'like', "%{$search}%")->orWhere('reference', 'like', "%{$search}%"))
            ->orderByDesc('updated_at')
            ->paginate(10, ['*'], 'conventionsPage')
            ->withQueryString();

        return Inertia::render('Archives/Index', [
            'courriers'   => $courriersArchives,
            'conventions' => $conventionsExpirees,
            'filtres'     => ['search' => $search],
        ]);
    }
}
