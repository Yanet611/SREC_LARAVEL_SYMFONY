<?php

namespace App\Http\Controllers;

use App\Models\Courrier;
use App\Models\Historique;
use App\Models\NotificationSrec;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Partenaire;
use Inertia\Inertia;
use Inertia\Response;

class CourrierController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isRecteur    = $user->hasRole('recteur');
        $isDirectrice = $user->hasRole('directrice');

        $query = Courrier::with('soumisParUser', 'prisEnChargeParUser')
            // Le Recteur ne voit que les courriers ENTRANTS à son niveau ou déjà décidés
            ->when($isRecteur, fn($q) => $q->where('sens', '!=', 'sortant')
                ->whereIn('statut', ['soumis_recteur', 'valide', 'rejete', 'archive']))
            // La Directrice ne voit que les courriers ENTRANTS (informée par notification pour les sortants)
            ->when($isDirectrice, fn($q) => $q->where('sens', '!=', 'sortant'))
            ->when($request->filled('statut'),  fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('sens'),    fn($q) => $q->where('sens', $request->sens))
            ->when($request->filled('type'),    fn($q) => $q->where('type', $request->type))
            ->when($request->filled('search'),  fn($q) => $q->where(function($sq) use ($request) {
                $sq->where('numero', 'like', '%' . $request->search . '%')
                   ->orWhere('objet', 'like', '%' . $request->search . '%')
                   ->orWhere('expediteur', 'like', '%' . $request->search . '%');
            }))
            ->when($request->filled('archive'), fn($q) => $q->where('archive', $request->archive === 'true'),
                                                fn($q) => $q->where('archive', false))
            ->latest();

        return Inertia::render('Courriers/Index', [
            'courriers' => $query->paginate(15)->withQueryString(),
            'filtres'   => $request->only(['statut', 'sens', 'type', 'search', 'archive']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Courriers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'objet'        => 'required|string|max:255',
            'sens'         => 'required|in:entrant,sortant',
            'type'         => 'required|in:demande_partenariat,demande_convention,invitation,information,autre,rendez_vous',
            'date_courrier' => 'required|date',
            'expediteur'   => 'required|string|max:255',
            'destinataire' => 'required|string|max:255',
            'observations' => 'nullable|string',
            'piece_jointe' => 'nullable|required_if:type,demande_convention|file|mimes:pdf|max:10240',
        ]);

        $validated['soumis_par'] = auth()->id();
        $validated['numero']     = Courrier::genererNumero();

        // Statut initial : toujours soumis à la Directrice
        $validated['statut'] = 'soumis_directrice';

        if ($request->hasFile('piece_jointe')) {
            $validated['piece_jointe'] = $request->file('piece_jointe')
                ->store('courriers', 'public');
        }

        $courrier = Courrier::create($validated);
        Historique::enregistrer($courrier, 'created', null, 'soumis_directrice', 'Courrier créé et soumis à la Directrice');

        // Notifier la Directrice
        $directrice = User::role('directrice')->first();
        if ($directrice) {
            if ($validated['sens'] === 'sortant') {
                // Courrier sortant → notification informative uniquement (pas d'action requise)
                NotificationSrec::envoyer(
                    $directrice->id,
                    "Courrier sortant — {$courrier->numero}",
                    "Le secrétariat a enregistré un courrier sortant : « {$courrier->objet} » destiné à {$courrier->destinataire}. Ce courrier est géré par le secrétariat.",
                    'info', 'normale', $courrier
                );
            } else {
                // Courrier entrant → action requise
                NotificationSrec::envoyer(
                    $directrice->id,
                    "Nouveau courrier — {$courrier->numero}",
                    "Un nouveau courrier a été enregistré par le secrétariat : « {$courrier->objet} » (de {$courrier->expediteur}). Votre prise en charge est attendue.",
                    'action_requise', 'haute', $courrier
                );
            }
        }

        return redirect()->route('courriers.show', $courrier)
            ->with('success', "Courrier {$courrier->numero} créé et soumis à la Directrice.");
    }

    public function show(Courrier $courrier): Response
    {
        $user = auth()->user();

        // Recteur et Directrice ne peuvent pas accéder aux courriers sortants
        if ($courrier->sens === 'sortant' && ($user->hasRole('recteur') || $user->hasRole('directrice'))) {
            abort(403, 'Les courriers sortants ne sont pas accessibles à votre rôle.');
        }

        // Le Recteur ne peut pas accéder aux dossiers qui ne lui ont pas encore été soumis
        if ($user->hasRole('recteur') && !in_array($courrier->statut, ['soumis_recteur', 'valide', 'rejete', 'archive'])) {
            abort(403, 'Ce courrier n\'a pas encore été soumis au Recteur.');
        }

        $courrier->load('soumisParUser', 'prisEnChargeParUser', 'partenaires', 'conventions', 'rendezVous.rapport');
        $historique = $courrier->historiques()
            ->with('user')
            ->oldest('created_at')
            ->get()
            ->map(fn($h) => [
                'id'             => $h->id,
                'action'         => $h->action,
                'ancien_statut'  => $h->ancien_statut,
                'nouveau_statut' => $h->nouveau_statut,
                'commentaire'    => $h->commentaire,
                'user'           => $h->user?->name ?? 'Système',
                'date'           => $h->created_at->format('d/m/Y H:i'),
            ]);

        // Recherche d'un partenaire potentiel pour la transformation intelligente
        $partenairePotentiel = null;
        if ($courrier->statut === 'valide' && $courrier->partenaires->isEmpty()) {
            $motsCles = explode(' ', $courrier->expediteur);
            $premierMotSignificatif = collect($motsCles)->filter(fn($mot) => strlen($mot) > 3)->first() ?? $courrier->expediteur;
            $partenairePotentiel = Partenaire::where('nom', 'like', '%' . $premierMotSignificatif . '%')->first();
        }

        // Dernier RDV pour la carte secrétariat
        $dernierRdv = $courrier->rendezVous->last();

        return Inertia::render('Courriers/Show', [
            'courrier'             => $courrier,
            'historique'           => $historique,
            'partenaire_potentiel' => $partenairePotentiel,
            'dernier_rdv'          => $dernierRdv,
        ]);
    }

    public function edit(Courrier $courrier): Response
    {
        return Inertia::render('Courriers/Edit', ['courrier' => $courrier]);
    }

    public function update(Request $request, Courrier $courrier): RedirectResponse
    {
        $validated = $request->validate([
            'objet'        => 'required|string|max:255',
            'expediteur'   => 'required|string|max:255',
            'destinataire' => 'required|string|max:255',
            'observations' => 'nullable|string',
        ]);

        $courrier->update($validated);
        Historique::enregistrer($courrier, 'updated', null, null, 'Courrier modifié');

        return redirect()->route('courriers.show', $courrier)
            ->with('success', 'Courrier mis à jour.');
    }

    public function changerStatut(Request $request, Courrier $courrier): RedirectResponse
    {
        $request->validate([
            'statut'      => 'required|string',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $ancienStatut = $courrier->statut;
        $nouveauStatut = $request->statut;

        // Mise à jour du statut
        $data = ['statut' => $nouveauStatut];

        // Si prise en charge → enregistrer qui
        if ($nouveauStatut === 'examine_directrice') {
            $data['pris_en_charge_par'] = auth()->id();
        }

        // Si rejeté → archivage automatique avec marque
        if ($nouveauStatut === 'rejete') {
            $data['archive']       = true;
            $data['date_archivage'] = now();
        }

        $courrier->update($data);

        Historique::enregistrer(
            $courrier, 'statut_change',
            $ancienStatut, $nouveauStatut,
            $request->commentaire
        );

        // Notifications automatiques ciblées
        $this->envoyerNotification($courrier, $ancienStatut, $nouveauStatut, $request->commentaire);

        $message = match($nouveauStatut) {
            'examine_directrice' => 'Courrier pris en charge.',
            'rdv_planifie'      => 'Statut mis à jour.',
            'entretien_realise' => 'Rapport soumis. Vous pouvez maintenant transmettre au Recteur.',
            'soumis_recteur'    => 'Courrier soumis au Recteur pour décision.',
            'valide'            => 'Courrier validé par le Recteur.',
            'rejete'            => 'Courrier rejeté et archivé automatiquement.',
            default             => 'Statut mis à jour.',
        };

        // Après validation d'une demande de partenariat → rediriger vers création du partenaire
        if ($nouveauStatut === 'valide'
            && $courrier->type === 'demande_partenariat'
            && $courrier->partenaires()->count() === 0
        ) {
            $nomPredefini = urlencode($courrier->expediteur);
            return redirect()
                ->route('partenaires.create', [
                    'source_courrier_id' => $courrier->id,
                    'nom_predefini'      => $courrier->expediteur,
                ])
                ->with('success', $message . ' Créez maintenant le profil du partenaire.');
        }

        return back()->with('success', $message);
    }

    public function archiver(Courrier $courrier): RedirectResponse
    {
        $courrier->update([
            'archive'       => true,
            'statut'        => 'archive',
            'date_archivage' => now(),
        ]);
        Historique::enregistrer($courrier, 'archived', $courrier->statut, 'archive', 'Archivé manuellement');

        return back()->with('success', "Courrier {$courrier->numero} archivé.");
    }

    /**
     * Génère un formulaire de courrier sortant pré-rempli comme convocation RDV.
     */
    public function convocationRdv(RendezVous $rendezVous): Response
    {
        $rendezVous->load('courrier');
        $courrier = $rendezVous->courrier;

        $dateRdv = $rendezVous->date_heure
            ? \Carbon\Carbon::parse($rendezVous->date_heure)->locale('fr')->isoFormat('dddd D MMMM YYYY [à] HH[h]mm')
            : 'date à confirmer';

        $prefill = [
            'sens'         => 'sortant',
            'type'         => 'invitation',
            'expediteur'   => 'SREC — UGANC',
            'destinataire' => $courrier?->expediteur ?? '',
            'date_courrier' => now()->toDateString(),
            'objet'        => "Convocation — Rendez-vous du {$dateRdv}",
            'observations' => "Suite à votre courrier « {$courrier?->objet} », nous avons le plaisir de vous convoquer à un rendez-vous le {$dateRdv}" . ($rendezVous->lieu ? ", au {$rendezVous->lieu}" : '') . ".\n\n" . ($rendezVous->ordre_du_jour ? "Ordre du jour : {$rendezVous->ordre_du_jour}" : ''),
        ];

        return Inertia::render('Courriers/Create', ['prefill' => $prefill]);
    }

    private function envoyerNotification(Courrier $courrier, string $ancien, string $nouveau, ?string $commentaire = null): void
    {
        $titre = "Courrier {$courrier->numero}";

        switch ($nouveau) {
            // Prise en charge → pas de notification externe
            case 'examine_directrice':
                break;

            // RDV planifié → notifier le Secrétariat
            case 'rdv_planifie':
                $rdv = $courrier->rendezVous()->latest()->first();
                $dateRdv = $rdv?->date_heure
                    ? \Carbon\Carbon::parse($rdv->date_heure)->format('d/m/Y à H\hi')
                    : 'date à préciser';
                $lieu = $rdv?->lieu ? " — Lieu : {$rdv->lieu}" : '';

                $secretariats = User::role('secretariat')->get();
                foreach ($secretariats as $sec) {
                    NotificationSrec::envoyer(
                        $sec->id,
                        "{$titre} — Rendez-vous planifié",
                        "La Directrice a planifié un rendez-vous pour le courrier « {$courrier->objet} ».\n- Date : {$dateRdv}{$lieu}\n\nUne convocation doit être envoyée au partenaire ({$courrier->expediteur}).",
                        'action_requise', 'haute', $courrier
                    );
                }
                break;

            // Rapport soumis → notifier le Secrétariat (confirmation)
            case 'entretien_realise':
                $secretariats = User::role('secretariat')->get();
                foreach ($secretariats as $sec) {
                    NotificationSrec::envoyer(
                        $sec->id,
                        "{$titre} — Rapport de RDV soumis",
                        "La Directrice a soumis le rapport de l'entretien concernant « {$courrier->objet} ». Le dossier sera prochainement transmis au Recteur.",
                        'info', 'normale', $courrier
                    );
                }
                break;

            // Soumis au Recteur → notifier UNIQUEMENT si courrier entrant
            case 'soumis_recteur':
                if ($courrier->sens !== 'sortant') {
                    $recteur = User::role('recteur')->first();
                    if ($recteur) {
                        NotificationSrec::envoyer(
                            $recteur->id,
                            "{$titre} — Décision requise",
                            "La Directrice vous soumet le dossier « {$courrier->objet} » pour décision finale (validation ou rejet).",
                            'action_requise', 'urgente', $courrier
                        );
                    }
                }
                break;

            // Décision finale → notifier Directrice + Secrétariat
            case 'valide':
            case 'rejete':
                $label = $nouveau === 'valide' ? 'Validé' : 'Rejeté';
                $msg   = $nouveau === 'valide'
                    ? "Le Recteur a validé le dossier « {$courrier->objet} »."
                    : "Le Recteur a rejeté le dossier « {$courrier->objet} ». Le courrier a été archivé automatiquement." . ($commentaire ? "\nMotif : {$commentaire}" : '');

                $directrice = User::role('directrice')->first();
                if ($directrice) {
                    NotificationSrec::envoyer(
                        $directrice->id,
                        "{$titre} — {$label}",
                        $msg,
                        $nouveau === 'valide' ? 'succes' : 'alerte',
                        $nouveau === 'valide' ? 'normale' : 'haute',
                        $courrier
                    );
                }
                $secretariats = User::role('secretariat')->get();
                foreach ($secretariats as $sec) {
                    NotificationSrec::envoyer(
                        $sec->id,
                        "{$titre} — {$label}",
                        $msg,
                        $nouveau === 'valide' ? 'succes' : 'info',
                        'normale',
                        $courrier
                    );
                }
                break;
        }
    }
}
