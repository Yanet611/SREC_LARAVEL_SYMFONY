<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activite extends Model
{
    use HasFactory;

    protected $fillable = [
        'convention_id', 'creee_par', 'titre', 'description', 'type',
        'date_debut', 'date_fin', 'lieu', 'participants_prevus', 'participants_reels',
        'statut', 'rapport_pdf', 'observations',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
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
            'planifiee'  => 'Planifiée',
            'en_cours'   => 'En cours',
            'realisee'   => 'Réalisée',
            'annulee'    => 'Annulée',
            default      => ucfirst($this->statut),
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'formation'   => 'Formation',
            'recherche'   => 'Recherche',
            'echange'     => 'Échange',
            'conference'  => 'Conférence',
            'stage'       => 'Stage',
            'autre'       => 'Autre',
            default       => ucfirst($this->type),
        };
    }
}
