<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSrec extends Model
{
    public $timestamps = false;

    protected $table = 'notifications_srec';

    protected $fillable = [
        'destinataire_id', 'emetteur_id', 'entite_type', 'entite_id',
        'titre', 'message', 'type', 'priorite', 'lue', 'lue_le',
    ];

    protected $casts = [
        'lue'        => 'boolean',
        'lue_le'     => 'datetime',
        'created_at' => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    public function emetteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'emetteur_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeNonLues($query)
    {
        return $query->where('lue', false);
    }

    public function scopeUrgentes($query)
    {
        return $query->where('priorite', 'urgente');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public static function envoyer(
        int $destinataireId,
        string $titre,
        string $message,
        string $type = 'info',
        string $priorite = 'normale',
        $entite = null
    ): static {
        return static::create([
            'destinataire_id' => $destinataireId,
            'emetteur_id'     => auth()->id(),
            'entite_type'     => $entite ? get_class($entite) : null,
            'entite_id'       => $entite?->id,
            'titre'           => $titre,
            'message'         => $message,
            'type'            => $type,
            'priorite'        => $priorite,
            'created_at'      => now(),
        ]);
    }

    public function marquerLue(): void
    {
        $this->update(['lue' => true, 'lue_le' => now()]);
    }
}
