<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Convention extends Model
{
    use HasFactory;

    protected $fillable = [
        'partenaire_id', 'courrier_id', 'reference', 'intitule', 'type',
        'date_signature', 'date_debut', 'date_fin', 'reconductible',
        'creee_par', 'soumise_par', 'decidee_par',
        'statut', 'document_pdf', 'description', 'motif_rejet', 'observations',
        'archive', 'date_archivage',
    ];

    protected $casts = [
        'date_signature' => 'date',
        'date_debut'     => 'date',
        'date_fin'       => 'date',
        'reconductible'  => 'boolean',
        'archive'        => 'boolean',
        'date_archivage' => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function partenaire(): BelongsTo
    {
        return $this->belongsTo(Partenaire::class);
    }

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function creeePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creee_par');
    }

    public function soumisePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'soumise_par');
    }

    public function decideePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decidee_par');
    }

    public function activites(): HasMany
    {
        return $this->hasMany(Activite::class);
    }

    public function mobilites(): HasMany
    {
        return $this->hasMany(Mobilite::class);
    }

    public function historiques(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Historique::class, 'entite');
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getStatutLabelAttribute(): string
    {
        return match ($this->statut) {
            'brouillon'          => 'Brouillon',
            'soumise_directrice' => 'Soumise à la Directrice',
            'soumise_recteur'    => 'Soumise au Recteur',
            'approuvee'          => 'Approuvée',
            'rejetee'            => 'Rejetée',
            'revision'           => 'En révision',
            'signee'             => 'Signée',
            'expiree'            => 'Expirée',
            'archive'            => 'Archivée',
            default              => ucfirst($this->statut),
        };
    }

    public function getStatutColorAttribute(): string
    {
        return match ($this->statut) {
            'brouillon'                      => 'gray',
            'soumise_directrice', 'soumise_recteur' => 'yellow',
            'approuvee', 'signee'            => 'green',
            'rejetee'                        => 'red',
            'revision'                       => 'orange',
            'expiree', 'archive'             => 'slate',
            default                          => 'gray',
        };
    }

    public function getEstExpireAttribute(): bool
    {
        return $this->date_fin && $this->date_fin->isPast() && $this->statut === 'signee';
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActives($query)
    {
        return $query->where('archive', false);
    }

    public function scopeSignees($query)
    {
        return $query->where('statut', 'signee');
    }

    public function scopeEnCours($query)
    {
        return $query->whereIn('statut', ['soumise_directrice', 'soumise_recteur', 'revision']);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public static function genererReference(): string
    {
        $annee = now()->year;
        $derniere = static::whereYear('created_at', $annee)->orderByDesc('id')->first();
        $seq = $derniere ? ((int) substr($derniere->reference, -3)) + 1 : 1;
        return sprintf('CONV-%d-%03d', $annee, $seq);
    }
}
