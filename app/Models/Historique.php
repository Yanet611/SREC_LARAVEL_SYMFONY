<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Historique extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'entite_type', 'entite_id',
        'action', 'ancien_statut', 'nouveau_statut', 'commentaire', 'meta',
    ];

    protected $casts = [
        'meta'       => 'array',
        'created_at' => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function entite(): MorphTo
    {
        return $this->morphTo();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public static function enregistrer(
        $entite,
        string $action,
        ?string $ancienStatut = null,
        ?string $nouveauStatut = null,
        ?string $commentaire = null,
        ?array $meta = null
    ): static {
        return static::create([
            'user_id'       => auth()->id(),
            'entite_type'   => get_class($entite),
            'entite_id'     => $entite->id,
            'action'        => $action,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => $nouveauStatut,
            'commentaire'   => $commentaire,
            'meta'          => $meta,
            'created_at'    => now(),
        ]);
    }
}
