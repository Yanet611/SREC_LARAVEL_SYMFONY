<?php

namespace App\Console\Commands;

use App\Models\Convention;
use App\Models\Courrier;
use App\Models\NotificationSrec;
use App\Models\RendezVous;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AlertesQuotidiennes extends Command
{
    protected $signature   = 'alertes:quotidiennes';
    protected $description = 'Envoie les alertes quotidiennes : conventions expirant + courriers en attente > 3 jours';

    public function handle(): int
    {
        $this->info('🔔 Lancement des alertes quotidiennes SREC...');

        $this->alertesConventions();
        $this->alertesCourriersEnAttente();
        $this->alertesRelancesRdv();

        $this->info('✅ Alertes envoyées avec succès.');
        return self::SUCCESS;
    }

    // ── 1. Alertes conventions qui expirent ──────────────────────────────────

    private function alertesConventions(): void
    {
        $destinataires = $this->destinatairesSrec();
        $today = Carbon::today();
        $alreadyNotified = [];

        // Conventions actives avec une date de fin définie
        $conventions = Convention::with('partenaire')
            ->where('statut', 'approuvee')
            ->whereNotNull('date_fin')
            ->where('archive', false)
            ->get();

        foreach ($conventions as $convention) {
            $dateFin    = Carbon::parse($convention->date_fin);
            $joursRestants = $today->diffInDays($dateFin, false); // négatif si déjà expirée

            // Déjà expirée (date_fin < aujourd'hui)
            if ($joursRestants < 0) {
                $this->notifier(
                    $destinataires,
                    "⚠️ Convention expirée — {$convention->reference}",
                    "La convention « {$convention->intitule} » avec {$convention->partenaire?->nom} a expiré le {$dateFin->format('d/m/Y')}. Elle doit être renouvelée ou archivée.",
                    'alerte', 'urgente', $convention
                );
                continue;
            }

            // Expire dans 7 jours ou moins
            if ($joursRestants <= 7) {
                $this->notifier(
                    $destinataires,
                    "🔴 Convention expire dans {$joursRestants} jour(s) — {$convention->reference}",
                    "La convention « {$convention->intitule} » avec {$convention->partenaire?->nom} expire le {$dateFin->format('d/m/Y')}. Action urgente requise.",
                    'action_requise', 'haute', $convention
                );
                continue;
            }

            // Expire dans 30 jours ou moins
            if ($joursRestants <= 30) {
                $this->notifier(
                    $destinataires,
                    "🟡 Convention expire dans {$joursRestants} jours — {$convention->reference}",
                    "La convention « {$convention->intitule} » avec {$convention->partenaire?->nom} expire le {$dateFin->format('d/m/Y')}. Pensez à engager le renouvellement.",
                    'info', 'normale', $convention
                );
            }
        }

        $this->info("  → Conventions vérifiées : {$conventions->count()}");
    }

    // ── 2. Alertes courriers demande partenariat non pris en charge (+3j) ────

    private function alertesCourriersEnAttente(): void
    {
        $destinataires = $this->destinatairesSrec();
        $limite = Carbon::now()->subDays(3);

        $courriersEnRetard = Courrier::where('type', 'demande_partenariat')
            ->where('statut', 'soumis_directrice')
            ->where('archive', false)
            ->where('created_at', '<=', $limite)
            ->get();

        foreach ($courriersEnRetard as $courrier) {
            $joursEcoules = Carbon::parse($courrier->created_at)->diffInDays(now());

            $this->notifier(
                $destinataires,
                "🚨 Courrier en attente depuis {$joursEcoules} jours — {$courrier->numero}",
                "Le courrier de demande de partenariat « {$courrier->objet} » de {$courrier->expediteur} n'a pas encore été pris en charge (reçu le {$courrier->created_at->format('d/m/Y')}). Une action est requise.",
                'action_requise', 'urgente', $courrier
            );
        }

        $this->info("  → Courriers en retard détectés : {$courriersEnRetard->count()}");
    }

    // ── 3. Alertes Relances RDV (Sans rapport > 48h) ─────────────────────────

    private function alertesRelancesRdv(): void
    {
        $limite = Carbon::now()->subHours(48);

        $rdvsEnRetard = RendezVous::with('courrier')
            ->doesntHave('rapport')
            ->where('date_heure', '<=', $limite)
            ->where('statut', '!=', 'annule')
            ->get();

        $secretaires = User::role('secretariat')->get();
        $directrice = User::role('directrice')->first();
        $destinataires = $secretaires;
        if ($directrice) {
            $destinataires->push($directrice);
        }

        foreach ($rdvsEnRetard as $rdv) {
            $this->notifier(
                $destinataires,
                "⏳ Rapport de RDV en retard — Courrier {$rdv->courrier?->numero}",
                "Le rendez-vous prévu le {$rdv->date_heure->format('d/m/Y à H:i')} est passé depuis plus de 48h et aucun rapport d'entretien n'a été rédigé. Le workflow est bloqué.",
                'action_requise', 'haute', $rdv->courrier
            );
        }

        $this->info("  → RDV en attente de rapport détectés : {$rdvsEnRetard->count()}");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Retourne la Directrice + l'Admin comme destinataires des alertes internes.
     */
    private function destinatairesSrec(): \Illuminate\Support\Collection
    {
        return User::role(['directrice', 'admin'])->get();
    }

    /**
     * Envoie une notification à une liste d'utilisateurs.
     */
    private function notifier(
        \Illuminate\Support\Collection $users,
        string $titre,
        string $message,
        string $type,
        string $priorite,
        mixed $entite
    ): void {
        foreach ($users as $user) {
            NotificationSrec::envoyer($user->id, $titre, $message, $type, $priorite, $entite);
        }
    }
}
