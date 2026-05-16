<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Courrier extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero', 'objet', 'sens', 'type', 'date_courrier',
        'expediteur', 'destinataire', 'soumis_par', 'pris_en_charge_par',
        'statut', 'piece_jointe', 'observations', 'archive', 'date_archivage',
    ];

    protected $casts = [
        'date_courrier' => 'date',
        'archive' => 'boolean',
        'date_archivage' => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function soumisParUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'soumis_par');
    }

    public function prisEnChargeParUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pris_en_charge_par');
    }

    public function partenaires(): HasMany
    {
        return $this->hasMany(Partenaire::class);
    }

    public function conventions(): HasMany
    {
        return $this->hasMany(Convention::class);
    }

    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class);
    }

    public function historiques(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Historique::class, 'entite');
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getStatutLabelAttribute(): string
    {
        return match ($this->statut) {
            'soumis'              => 'Soumis',
            'recu'                => 'Reçu',
            'pris_en_charge'      => 'Pris en charge',
            'rdv_planifie'        => 'RDV planifié',
            'entretien_realise'   => 'Entretien réalisé',
            'soumis_directrice'   => 'Soumis à la Directrice',
            'examine_directrice'  => 'Examiné (Directrice)',
            'soumis_recteur'      => 'Soumis au Recteur',
            'valide'              => 'Validé (Partenariat Accepté)',
            'rejete'              => 'Rejeté par le Recteur',
            'archive'             => 'Archivé',
            default               => ucfirst($this->statut),
        };
    }

    public function getStatutColorAttribute(): string
    {
        return match ($this->statut) {
            'soumis', 'recu'                  => 'blue',
            'pris_en_charge', 'rdv_planifie'  => 'orange',
            'entretien_realise', 'examine_directrice' => 'purple',
            'soumis_directrice', 'soumis_recteur' => 'yellow',
            'valide'                          => 'green',
            'rejete'                          => 'red',
            'archive'                         => 'gray',
            default                           => 'gray',
        };
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActifs($query)
    {
        return $query->where('archive', false);
    }

    public function scopeArchives($query)
    {
        return $query->where('archive', true);
    }

    public function scopeEnAttente($query)
    {
        return $query->whereIn('statut', ['soumis', 'recu', 'pris_en_charge', 'soumis_directrice', 'soumis_recteur']);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public static function genererNumero(): string
    {
        $annee = now()->year;
        $derniere = static::whereYear('created_at', $annee)->orderByDesc('id')->first();
        $seq = $derniere ? ((int) substr($derniere->numero, -3)) + 1 : 1;
        return sprintf('SREC-%d-%03d', $annee, $seq);
    }
}
