<?php

namespace App\Http\Controllers;

use App\Models\Convention;
use App\Models\Mobilite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MobiliteController extends Controller
{
    public function index(Request $request): Response
    {
        $mobilites = Mobilite::with('convention.partenaire', 'creeePar')
            ->when($request->filled('statut'),          fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('type_mobilite'),   fn($q) => $q->where('type_mobilite', $request->type_mobilite))
            ->when($request->filled('type_beneficiaire'), fn($q) => $q->where('type_beneficiaire', $request->type_beneficiaire))
            ->when($request->filled('convention'),      fn($q) => $q->where('convention_id', $request->convention))
            ->when($request->filled('search'),          fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('nom_beneficiaire', 'like', '%' . $request->search . '%')
                   ->orWhere('reference', 'like', '%' . $request->search . '%')
                   ->orWhere('institution_accueil', 'like', '%' . $request->search . '%')
                   ->orWhere('pays_destination', 'like', '%' . $request->search . '%');
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Mobilites/Index', [
            'mobilites'   => $mobilites,
            'conventions' => Convention::orderByDesc('id')->get(['id', 'reference', 'intitule']),
            'filtres'     => $request->only(['statut', 'type_mobilite', 'type_beneficiaire', 'convention', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Mobilites/Create', [
            'conventions' => Convention::whereIn('statut', ['approuvee', 'signee'])
                ->orderByDesc('id')
                ->get(['id', 'reference', 'intitule']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'convention_id'          => 'required|exists:conventions,id',
            'nom_beneficiaire'        => 'required|string|max:255',
            'email_beneficiaire'      => 'nullable|email|max:255',
            'telephone_beneficiaire'  => 'nullable|string|max:50',
            'type_beneficiaire'       => 'required|in:etudiant,enseignant,chercheur,personnel_admin',
            'type_mobilite'           => 'required|in:entrant,sortant',
            'institution_accueil'     => 'required|string|max:255',
            'pays_destination'        => 'required|string|max:100',
            'ville_destination'       => 'nullable|string|max:100',
            'objet_sejour'            => 'required|string|max:500',
            'date_depart'             => 'required|date',
            'date_retour'             => 'nullable|date|after:date_depart',
            'financement'             => 'nullable|string|max:255',
            'montant_financement'     => 'nullable|numeric|min:0',
            'observations'            => 'nullable|string',
        ]);

        $validated['creee_par'] = auth()->id();
        $validated['reference'] = Mobilite::genererReference();

        $mobilite = Mobilite::create($validated);

        return redirect()->route('mobilites.show', $mobilite)
            ->with('success', "Mobilité « {$mobilite->reference} » enregistrée.");
    }

    public function show(Mobilite $mobilite): Response
    {
        $mobilite->load('convention.partenaire', 'creeePar');

        return Inertia::render('Mobilites/Show', [
            'mobilite' => $mobilite,
        ]);
    }

    public function edit(Mobilite $mobilite): Response
    {
        return Inertia::render('Mobilites/Edit', [
            'mobilite'    => $mobilite->load('convention'),
            'conventions' => Convention::whereIn('statut', ['approuvee', 'signee'])
                ->orderByDesc('id')
                ->get(['id', 'reference', 'intitule']),
        ]);
    }

    public function update(Request $request, Mobilite $mobilite): RedirectResponse
    {
        $validated = $request->validate([
            'convention_id'          => 'required|exists:conventions,id',
            'nom_beneficiaire'        => 'required|string|max:255',
            'email_beneficiaire'      => 'nullable|email|max:255',
            'telephone_beneficiaire'  => 'nullable|string|max:50',
            'type_beneficiaire'       => 'required|in:etudiant,enseignant,chercheur,personnel_admin',
            'type_mobilite'           => 'required|in:entrant,sortant',
            'institution_accueil'     => 'required|string|max:255',
            'pays_destination'        => 'required|string|max:100',
            'ville_destination'       => 'nullable|string|max:100',
            'objet_sejour'            => 'required|string|max:500',
            'date_depart'             => 'required|date',
            'date_retour'             => 'nullable|date|after:date_depart',
            'financement'             => 'nullable|string|max:255',
            'montant_financement'     => 'nullable|numeric|min:0',
            'statut'                  => 'required|in:en_attente,approuvee,en_cours,realisee,annulee',
            'observations'            => 'nullable|string',
        ]);

        $mobilite->update($validated);

        return redirect()->route('mobilites.show', $mobilite)
            ->with('success', 'Mobilité mise à jour.');
    }

    public function destroy(Mobilite $mobilite): RedirectResponse
    {
        $mobilite->delete();
        return redirect()->route('mobilites.index')
            ->with('success', 'Mobilité supprimée.');
    }
}
