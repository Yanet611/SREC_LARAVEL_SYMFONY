<?php

namespace App\Http\Controllers;

use App\Models\Courrier;
use App\Models\RendezVous;
use App\Models\RapportEntretien;
use App\Models\Historique;
use App\Models\NotificationSrec;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RendezVousController extends Controller
{
    public function index(Request $request): Response
    {
        $rendezVous = RendezVous::with('courrier', 'organisePar', 'rapport')
            ->when($request->filled('statut'), fn($q) => $q->where('statut', $request->statut))
            ->orderBy('date_heure', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('RendezVous/Index', [
            'rendezVous' => $rendezVous,
            'filtres'    => $request->only('statut'),
            'courriers'  => Courrier::orderByDesc('id')->take(50)->get(['id', 'numero', 'objet']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'courrier_id'   => 'required|exists:courriers,id',
            'date_heure'    => 'required|date',
            'lieu'          => 'nullable|string|max:255',
            'ordre_du_jour' => 'nullable|string',
            'notes'         => 'nullable|string',
        ]);

        $validated['organise_par'] = auth()->id();
        $validated['statut'] = 'planifie';

        $rdv = RendezVous::create($validated);

        // Notifier le Secrétariat avec les détails du RDV
        $courrier = Courrier::find($validated['courrier_id']);
        if ($courrier) {
            $dateFormatee = \Carbon\Carbon::parse($validated['date_heure'])->format('d/m/Y à H\hi');
            $lieu = $validated['lieu'] ? " au {$validated['lieu']}" : '';
            $odj  = $validated['ordre_du_jour'] ? "\nOrdre du jour : {$validated['ordre_du_jour']}" : '';

            $secretariats = User::role('secretariat')->get();
            foreach ($secretariats as $sec) {
                NotificationSrec::envoyer(
                    $sec->id,
                    "RDV planifié — {$courrier->numero}",
                    "La Directrice a planifié un rendez-vous pour le courrier « {$courrier->objet} ».\n📅 Le {$dateFormatee}{$lieu}.{$odj}\n\n👉 Une convocation doit être envoyée au partenaire : {$courrier->expediteur}",
                    'action_requise', 'haute', $courrier
                );
            }
        }

        return back()->with('success', 'Rendez-vous planifié avec succès.');
    }

    public function update(Request $request, RendezVous $rendezVou): RedirectResponse
    {
        $validated = $request->validate([
            'date_heure'    => 'required|date',
            'lieu'          => 'nullable|string|max:255',
            'ordre_du_jour' => 'nullable|string',
            'statut'        => 'required|in:planifie,realise,annule',
            'notes'         => 'nullable|string',
        ]);

        $rendezVou->update($validated);

        return back()->with('success', 'Rendez-vous mis à jour.');
    }

    public function storeRapport(Request $request, RendezVous $rendezVou): RedirectResponse
    {
        $validated = $request->validate([
            'compte_rendu'         => 'required|string',
            'decision_recommandee' => 'required|in:favorable,defavorable,en_attente',
            'observations'         => 'nullable|string',
            'fichier'              => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('rapports', 'public');
            $validated['fichier'] = $path;
        }

        $validated['redacteur_id']   = auth()->id();
        $validated['rendez_vous_id'] = $rendezVou->id;

        RapportEntretien::create($validated);

        // Marquer le RDV comme réalisé
        $rendezVou->update(['statut' => 'realise']);

        // Passer le statut du courrier à "entretien_realise"
        // La Directrice devra manuellement soumettre au Recteur ensuite
        $courrier = $rendezVou->courrier;
        if ($courrier && $courrier->statut === 'rdv_planifie') {
            $ancienStatut = $courrier->statut;
            $courrier->update(['statut' => 'entretien_realise']);

            Historique::enregistrer(
                $courrier, 'statut_change', $ancienStatut, 'entretien_realise',
                "Rapport d'entretien soumis par la Directrice."
            );

            // Notifier le Secrétariat (confirmation, pas d'action requise)
            $secretariats = User::role('secretariat')->get();
            foreach ($secretariats as $sec) {
                NotificationSrec::envoyer(
                    $sec->id,
                    "Rapport soumis — {$courrier->numero}",
                    "La Directrice a soumis le rapport de l'entretien pour le courrier « {$courrier->objet} ». Le dossier sera prochainement transmis au Recteur pour décision.",
                    'info', 'normale', $courrier
                );
            }
        }

        return back()->with('success', "Rapport d'entretien enregistré. Vous pouvez maintenant soumettre le dossier au Recteur.");
    }
}
