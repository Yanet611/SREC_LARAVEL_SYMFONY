<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Convention;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActiviteController extends Controller
{
    public function index(Request $request): Response
    {
        $activites = Activite::with('convention.partenaire', 'creeePar')
            ->when($request->filled('statut'),      fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('type'),        fn($q) => $q->where('type', $request->type))
            ->when($request->filled('convention'),  fn($q) => $q->where('convention_id', $request->convention))
            ->when($request->filled('search'),      fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('titre', 'like', '%' . $request->search . '%')
                   ->orWhere('lieu', 'like', '%' . $request->search . '%');
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Activites/Index', [
            'activites'   => $activites,
            'conventions' => Convention::orderByDesc('id')->get(['id', 'reference', 'intitule']),
            'filtres'     => $request->only(['statut', 'type', 'convention', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Activites/Create', [
            'conventions' => Convention::whereIn('statut', ['approuvee', 'signee'])
                ->orderByDesc('id')
                ->get(['id', 'reference', 'intitule']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'convention_id'       => 'required|exists:conventions,id',
            'titre'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'type'                => 'required|in:formation,recherche,echange,conference,stage,autre',
            'date_debut'          => 'required|date',
            'date_fin'            => 'nullable|date|after_or_equal:date_debut',
            'lieu'                => 'nullable|string|max:255',
            'participants_prevus' => 'nullable|integer|min:0',
            'observations'        => 'nullable|string',
        ]);

        $validated['creee_par'] = auth()->id();
        $activite = Activite::create($validated);

        return redirect()->route('activites.show', $activite)
            ->with('success', "Activité « {$activite->titre} » créée.");
    }

    public function show(Activite $activite): Response
    {
        $activite->load('convention.partenaire', 'creeePar');

        return Inertia::render('Activites/Show', [
            'activite' => $activite,
        ]);
    }

    public function edit(Activite $activite): Response
    {
        return Inertia::render('Activites/Edit', [
            'activite'    => $activite->load('convention'),
            'conventions' => Convention::whereIn('statut', ['approuvee', 'signee'])
                ->orderByDesc('id')
                ->get(['id', 'reference', 'intitule']),
        ]);
    }

    public function update(Request $request, Activite $activite): RedirectResponse
    {
        $validated = $request->validate([
            'convention_id'        => 'required|exists:conventions,id',
            'titre'                => 'required|string|max:255',
            'description'          => 'nullable|string',
            'type'                 => 'required|in:formation,recherche,echange,conference,stage,autre',
            'date_debut'           => 'required|date',
            'date_fin'             => 'nullable|date|after_or_equal:date_debut',
            'lieu'                 => 'nullable|string|max:255',
            'participants_prevus'  => 'nullable|integer|min:0',
            'participants_reels'   => 'nullable|integer|min:0',
            'statut'               => 'required|in:planifiee,en_cours,realisee,annulee',
            'observations'         => 'nullable|string',
        ]);

        $activite->update($validated);

        return redirect()->route('activites.show', $activite)
            ->with('success', 'Activité mise à jour.');
    }

    public function destroy(Activite $activite): RedirectResponse
    {
        $activite->delete();
        return redirect()->route('activites.index')
            ->with('success', 'Activité supprimée.');
    }
}
