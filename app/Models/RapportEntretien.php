<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RapportEntretien extends Model
{
    use HasFactory;

    protected $table = 'rapports_entretien';

    protected $fillable = [
        'rendez_vous_id',
        'redacteur_id',
        'compte_rendu',
        'decision_recommandee',
        'observations',
        'fichier',
    ];

    public function rendezVous()
    {
        return $this->belongsTo(RendezVous::class);
    }

    public function redacteur()
    {
        return $this->belongsTo(User::class, 'redacteur_id');
    }
}
