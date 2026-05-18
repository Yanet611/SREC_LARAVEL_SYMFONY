<?php

namespace App\Http\Controllers;

use App\Models\Partenaire;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartenaireController extends Controller
{
    public function index(Request $request): Response
    {
        $partenaires = Partenaire::withCount('conventions')
            ->when($request->filled('statut'),  fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('type'),    fn($q) => $q->where('type', $request->type))
            ->when($request->filled('nature'),  fn($q) => $q->where('nature', $request->nature))
            ->when($request->filled('search'),  fn($q) => $q->where(function($sq) use ($request) {
                $sq->where('nom', 'like', '%' . $request->search . '%')
                   ->orWhere('sigle', 'like', '%' . $request->search . '%')
                   ->orWhere('pays', 'like', '%' . $request->search . '%');
            }))
            ->orderBy('nom')
            ->paginate(15)->withQueryString();

        return Inertia::render('Partenaires/Index', [
            'partenaires' => $partenaires,
            'filtres'     => $request->only(['statut', 'type', 'nature', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Partenaires/Create', [
            'source_courrier_id' => $request->source_courrier_id,
            'nom_predefini'      => $request->nom_predefini,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'courrier_id'      => 'nullable|exists:courriers,id',
            'nom'              => 'required|string|max:255',
            'sigle'            => 'nullable|string|max:50',
            'type'             => 'required|in:universite,ong,ambassade,organisation_internationale,entreprise,autre',
            'nature'           => 'required|in:national,international',
            'pays'             => 'required|string|max:100',
            'ville'            => 'nullable|string|max:100',
            'adresse'          => 'nullable|string|max:500',
            'site_web'         => 'nullable|url|max:255',
            'email'            => 'nullable|email|max:255',
            'telephone'        => 'nullable|string|max:50',
            'contact_nom'      => 'nullable|string|max:255',
            'contact_fonction' => 'nullable|string|max:255',
            'contact_email'    => 'nullable|email|max:255',
            'contact_telephone'=> 'nullable|string|max:50',
            'notes'            => 'nullable|string',
            'logo'             => 'nullable|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('partenaires_logos', 'public');
        }

        $partenaire = Partenaire::create($validated);

        if (!empty($validated['courrier_id'])) {
            return redirect()->route('courriers.show', $validated['courrier_id'])
                ->with('success', "Partenaire « {$partenaire->nom} » créé et lié avec succès.");
        }

        return redirect()->route('partenaires.show', $partenaire)
            ->with('success', "Partenaire « {$partenaire->nom} » créé.");
    }

    public function show(Partenaire $partenaire): Response
    {
        $partenaire->load('conventions');
        return Inertia::render('Partenaires/Show', [
            'partenaire' => $partenaire,
        ]);
    }

    public function edit(Partenaire $partenaire): Response
    {
        return Inertia::render('Partenaires/Edit', ['partenaire' => $partenaire]);
    }

    public function update(Request $request, Partenaire $partenaire): RedirectResponse
    {
        $validated = $request->validate([
            'nom'              => 'required|string|max:255',
            'sigle'            => 'nullable|string|max:50',
            'pays'             => 'required|string|max:100',
            'ville'            => 'nullable|string|max:100',
            'site_web'         => 'nullable|url|max:255',
            'email'            => 'nullable|email|max:255',
            'contact_nom'      => 'nullable|string|max:255',
            'contact_email'    => 'nullable|email|max:255',
            'statut'           => 'required|in:actif,inactif,suspendu',
            'notes'            => 'nullable|string',
            'logo'             => 'nullable|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($partenaire->logo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($partenaire->logo);
            }
            $validated['logo'] = $request->file('logo')->store('partenaires_logos', 'public');
        }

        $partenaire->update($validated);

        return redirect()->route('partenaires.show', $partenaire)
            ->with('success', 'Partenaire mis à jour.');
    }
}
