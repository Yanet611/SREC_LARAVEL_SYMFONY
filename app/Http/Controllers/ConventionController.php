<?php

namespace App\Http\Controllers;

use App\Models\Convention;
use App\Models\Courrier;
use App\Models\Historique;
use App\Models\NotificationSrec;
use App\Models\Partenaire;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConventionController extends Controller
{
    public function index(Request $request): Response
    {
        $conventions = Convention::with('partenaire', 'creeePar')
            ->when($request->filled('statut'),    fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('partenaire'), fn($q) => $q->where('partenaire_id', $request->partenaire))
            ->when($request->filled('search'),    fn($q) => $q->where(function($sq) use ($request) {
                $sq->where('reference', 'like', '%' . $request->search . '%')
                   ->orWhere('intitule', 'like', '%' . $request->search . '%');
            }))
            ->when(!$request->filled('archive'),  fn($q) => $q->where('archive', false))
            ->latest()
            ->paginate(15)->withQueryString();

        return Inertia::render('Conventions/Index', [
            'conventions' => $conventions,
            'partenaires' => Partenaire::actifs()->orderBy('nom')->get(['id', 'nom', 'sigle']),
            'filtres'     => $request->only(['statut', 'partenaire', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Conventions/Create', [
            'partenaires' => Partenaire::actifs()->orderBy('nom')->get(['id', 'nom', 'sigle', 'pays']),
            'source_courrier_id' => $request->source_courrier_id,
            'partenaire_id_predefini' => $request->partenaire_id,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'partenaire_id'  => 'required|exists:partenaires,id',
            'courrier_id'    => 'nullable|exists:courriers,id',
            'intitule'       => 'required|string|max:255',
            'type'           => 'required|in:accord_cadre,memorandum,accord_specifique,protocole,autre',
            'date_debut'     => 'nullable|date',
            'date_fin'       => 'nullable|date|after:date_debut',
            'reconductible'  => 'boolean',
            'description'    => 'nullable|string',
            'document_pdf'   => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $validated['creee_par'] = auth()->id();
        $validated['reference'] = Convention::genererReference();

        if ($request->hasFile('document_pdf')) {
            $validated['document_pdf'] = $request->file('document_pdf')->store('conventions', 'public');
        }

        $convention = Convention::create($validated);
        Historique::enregistrer($convention, 'created', null, 'brouillon', 'Convention créée');

        return redirect()->route('conventions.show', $convention)
            ->with('success', "Convention {$convention->reference} créée.");
    }
    public function edit(Convention $convention): Response
    {
        return Inertia::render('Conventions/Edit', [
            'convention' => $convention,
            'partenaires' => Partenaire::actifs()->orderBy('nom')->get(['id', 'nom', 'sigle', 'pays']),
        ]);
    }

    public function update(Request $request, Convention $convention): RedirectResponse
    {
        $validated = $request->validate([
            'intitule'       => 'required|string|max:255',
            'type'           => 'required|in:accord_cadre,memorandum,accord_specifique,protocole,autre',
            'date_debut'     => 'nullable|date',
            'date_fin'       => 'nullable|date|after:date_debut',
            'reconductible'  => 'boolean',
            'description'    => 'nullable|string',
            'document_pdf'   => 'nullable|file|mimes:pdf|max:20480',
        ]);

        if ($request->hasFile('document_pdf')) {
            $validated['document_pdf'] = $request->file('document_pdf')->store('conventions', 'public');
        }

        $convention->update($validated);
        Historique::enregistrer($convention, 'updated', null, null, 'Informations de la convention modifiées');

        return redirect()->route('conventions.show', $convention)
            ->with('success', "Convention {$convention->reference} mise à jour.");
    }


    public function show(Convention $convention): Response
    {
        $convention->load('partenaire', 'creeePar', 'soumisePar', 'decideePar', 'activites', 'mobilites');
        $historique = $convention->historiques()->with('user')->oldest('created_at')->get()
            ->map(fn($h) => [
                'id'             => $h->id,
                'action'         => $h->action,
                'ancien_statut'  => $h->ancien_statut,
                'nouveau_statut' => $h->nouveau_statut,
                'commentaire'    => $h->commentaire,
                'user'           => $h->user?->name ?? 'Système',
                'date'           => $h->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Conventions/Show', [
            'convention' => $convention,
            'historique' => $historique,
        ]);
    }

    public function changerStatut(Request $request, Convention $convention): RedirectResponse
    {
        $request->validate([
            'statut'       => 'required|string',
            'commentaire'  => 'nullable|string|max:1000',
            'motif_rejet'  => 'nullable|string|max:1000',
        ]);

        $ancienStatut = $convention->statut;
        $data = ['statut' => $request->statut];
        if ($request->filled('motif_rejet')) {
            $data['motif_rejet'] = $request->motif_rejet;
        }
        if (in_array($request->statut, ['approuvee', 'rejetee', 'revision'])) {
            $data['decidee_par'] = auth()->id();
        }
        if ($request->statut === 'soumise_recteur') {
            $data['soumise_par'] = auth()->id();
        }

        $convention->update($data);
        Historique::enregistrer($convention, 'statut_change', $ancienStatut, $request->statut, $request->commentaire);

        if ($request->statut === 'soumise_recteur') {
            $recteur = User::role('recteur')->first();
            if ($recteur) {
                NotificationSrec::envoyer(
                    $recteur->id,
                    "Convention à examiner — {$convention->reference}",
                    "La convention « {$convention->intitule} » vous a été soumise pour approbation.",
                    'action_requise', 'haute', $convention
                );
            }
        }

        return back()->with('success', 'Statut de la convention mis à jour.');
    }

    public function genererBrouillon(Request $request, Courrier $courrier): RedirectResponse
    {
        $request->validate([
            'partenaire_id' => 'required|exists:partenaires,id',
        ]);

        $partenaire = Partenaire::find($request->partenaire_id);

        $convention = Convention::create([
            'partenaire_id' => $partenaire->id,
            'courrier_id'   => $courrier->id,
            'reference'     => Convention::genererReference(),
            'intitule'      => "Convention de Partenariat avec {$partenaire->nom}",
            'type'          => 'accord_cadre',
            'statut'        => 'brouillon',
            'creee_par'     => auth()->id(),
        ]);

        Historique::enregistrer($convention, 'created', null, 'brouillon', 'Brouillon généré automatiquement depuis le courrier');

        return redirect()->route('conventions.edit', $convention->id)
            ->with('success', 'Brouillon de convention généré. Veuillez compléter les informations.');
    }

    public function signer(Convention $convention): RedirectResponse
    {
        $user = auth()->user();

        // Seul le Recteur ou l'admin peut signer
        if (!$user->hasRole('recteur') && !$user->hasRole('admin')) {
            abort(403, 'Seul le Recteur peut apposer sa signature électronique.');
        }

        // La convention doit être approuvée
        if ($convention->statut !== 'approuvee') {
            return back()->with('error', 'Seule une convention approuvée peut être signée électroniquement.');
        }

        // Générer un token unique de vérification
        $token = hash('sha256', $convention->reference . now()->timestamp . $user->name . config('app.key'));

        $convention->update([
            'signe_par'                  => $user->id,
            'date_signature_electronique' => now(),
            'signature_token'             => $token,
            'statut'                      => 'signee',
        ]);

        Historique::enregistrer($convention, 'signed', 'approuvee', 'signee',
            "Convention signée électroniquement par {$user->name}. Token : {$token}");

        // Notifier la Directrice et le Secrétariat
        $notifyRoles = ['directrice', 'secretariat'];
        foreach ($notifyRoles as $role) {
            foreach (User::role($role)->get() as $dest) {
                NotificationSrec::envoyer(
                    $dest->id,
                    "Convention {$convention->reference} — Signée",
                    "Le Recteur a apposé sa signature électronique sur la convention « {$convention->intitule} ». Elle est désormais officiellement en vigueur.",
                    'info', 'haute', $convention
                );
            }
        }

        return redirect()->route('conventions.show', $convention)
            ->with('success', "Signature électronique apposée sur {$convention->reference}. La convention est maintenant en vigueur.");
    }
}
