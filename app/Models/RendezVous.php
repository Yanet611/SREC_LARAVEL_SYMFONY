<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RendezVous extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rendez_vous';

    protected $fillable = [
        'courrier_id',
        'organise_par',
        'date_heure',
        'type_rdv',
        'lieu',
        'ordre_du_jour',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
    ];

    public function courrier()
    {
        return $this->belongsTo(Courrier::class);
    }

    public function organisePar()
    {
        return $this->belongsTo(User::class, 'organise_par');
    }

    public function rapport()
    {
        return $this->hasOne(RapportEntretien::class);
    }
}
