<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partenaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id', 'nom', 'sigle', 'type', 'nature', 'pays', 'ville',
        'adresse', 'site_web', 'email', 'telephone',
        'contact_nom', 'contact_fonction', 'contact_email', 'contact_telephone',
        'statut', 'notes',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function conventions(): HasMany
    {
        return $this->hasMany(Convention::class);
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getNomCompletAttribute(): string
    {
        return $this->sigle ? "{$this->nom} ({$this->sigle})" : $this->nom;
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'universite'                => 'Université',
            'ong'                       => 'ONG',
            'ambassade'                 => 'Ambassade',
            'organisation_internationale' => 'Organisation Internationale',
            'entreprise'                => 'Entreprise',
            'autre'                     => 'Autre',
            default                     => ucfirst($this->type),
        };
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeInternationaux($query)
    {
        return $query->where('nature', 'international');
    }

    public function scopeNationaux($query)
    {
        return $query->where('nature', 'national');
    }
}
