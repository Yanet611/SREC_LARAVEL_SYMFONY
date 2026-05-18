<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'fonction',
        'service',
        'avatar',
        'actif',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
        'role_display',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'actif'             => 'boolean',
        ];
    }

    // ─── Relations ───────────────────────────────────────────────────────────

    public function courrierssoumis(): HasMany
    {
        return $this->hasMany(Courrier::class, 'soumis_par');
    }

    public function courriersEnCharge(): HasMany
    {
        return $this->hasMany(Courrier::class, 'pris_en_charge_par');
    }

    public function conventionsCrees(): HasMany
    {
        return $this->hasMany(Convention::class, 'creee_par');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationSrec::class, 'destinataire_id')->orderByDesc('created_at');
    }

    public function notificationsNonLues(): HasMany
    {
        return $this->hasMany(NotificationSrec::class, 'destinataire_id')->where('lue', false);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function estDirectrice(): bool
    {
        return $this->hasRole('directrice');
    }

    public function estRecteur(): bool
    {
        return $this->hasRole('recteur');
    }

    public function estSecretariat(): bool
    {
        return $this->hasRole('secretariat');
    }

    public function estAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function getRoleDisplayAttribute(): string
    {
        return match (true) {
            $this->hasRole('admin')       => 'Administrateur',
            $this->hasRole('directrice')  => 'Directrice SREC',
            $this->hasRole('recteur')     => 'Recteur',
            $this->hasRole('secretariat') => 'Secrétariat',
            default                       => 'Utilisateur',
        };
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }

        $name = urlencode($this->name);
        return "https://ui-avatars.com/api/?name={$name}&background=1e293b&color=38bdf8&rounded=true&bold=true";
    }

    public function getDashboardRouteAttribute(): string
    {
        return match (true) {
            $this->hasRole('admin')       => '/dashboard',
            $this->hasRole('directrice')  => '/dashboard',
            $this->hasRole('recteur')     => '/dashboard/recteur',
            $this->hasRole('secretariat') => '/dashboard/secretariat',
            default                       => '/dashboard',
        };
    }
}
