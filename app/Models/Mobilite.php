<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mobilite extends Model
{
    use HasFactory;

    protected $fillable = [
        'convention_id', 'creee_par', 'reference',
        'nom_beneficiaire', 'email_beneficiaire', 'telephone_beneficiaire',
        'type_beneficiaire', 'type_mobilite', 'institution_accueil',
        'pays_destination', 'ville_destination', 'objet_sejour',
        'date_depart', 'date_retour', 'financement', 'montant_financement',
        'statut', 'rapport_pdf', 'observations',
    ];

    protected $casts = [
        'date_depart'        => 'date',
        'date_retour'        => 'date',
        'montant_financement' => 'decimal:2',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function convention(): BelongsTo
    {
        return $this->belongsTo(Convention::class);
    }

    public function creeePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creee_par');
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getStatutLabelAttribute(): string
    {
        return match ($this->statut) {
            'en_attente' => 'En attente',
            'approuvee'  => 'Approuvée',
            'en_cours'   => 'En cours',
            'realisee'   => 'Réalisée',
            'annulee'    => 'Annulée',
            default      => ucfirst($this->statut),
        };
    }

    public function getDureeDaysAttribute(): int
    {
        return $this->date_depart->diffInDays($this->date_retour);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public static function genererReference(): string
    {
        $annee = now()->year;
        $derniere = static::whereYear('created_at', $annee)->orderByDesc('id')->first();
        $seq = $derniere ? ((int) substr($derniere->reference, -3)) + 1 : 1;
        return sprintf('MOB-%d-%03d', $annee, $seq);
    }
}
