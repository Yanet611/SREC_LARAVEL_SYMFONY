<?php

namespace Database\Seeders;

use App\Models\Courrier;
use App\Models\Convention;
use App\Models\Partenaire;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Vider le cache des permissions ────────────────────────────────
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── 2. Créer les rôles ───────────────────────────────────────────────
        $admin       = Role::firstOrCreate(['name' => 'admin',       'guard_name' => 'web']);
        $directrice  = Role::firstOrCreate(['name' => 'directrice',  'guard_name' => 'web']);
        $recteur     = Role::firstOrCreate(['name' => 'recteur',     'guard_name' => 'web']);
        $secretariat = Role::firstOrCreate(['name' => 'secretariat', 'guard_name' => 'web']);

        // ── 3. Créer les permissions ─────────────────────────────────────────
        $permissions = [
            // Courriers
            'courrier.voir', 'courrier.creer', 'courrier.modifier', 'courrier.supprimer',
            'courrier.soumettre', 'courrier.prendre_en_charge', 'courrier.valider', 'courrier.rejeter',
            'courrier.archiver',
            // Partenaires
            'partenaire.voir', 'partenaire.creer', 'partenaire.modifier', 'partenaire.supprimer',
            // Conventions
            'convention.voir', 'convention.creer', 'convention.modifier', 'convention.supprimer',
            'convention.soumettre', 'convention.approuver', 'convention.rejeter', 'convention.archiver',
            // Activités
            'activite.voir', 'activite.creer', 'activite.modifier',
            // Mobilités
            'mobilite.voir', 'mobilite.creer', 'mobilite.modifier', 'mobilite.approuver',
            // Stats & Admin
            'stats.voir', 'admin.users', 'admin.logs',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // ── 4. Assigner les permissions aux rôles ────────────────────────────
        $admin->syncPermissions(Permission::all());

        $directrice->syncPermissions([
            'courrier.voir', 'courrier.modifier', 'courrier.valider', 'courrier.rejeter',
            'courrier.archiver', 'courrier.soumettre',
            'partenaire.voir', 'partenaire.creer', 'partenaire.modifier',
            'convention.voir', 'convention.creer', 'convention.modifier',
            'convention.soumettre', 'convention.archiver',
            'activite.voir', 'activite.creer', 'activite.modifier',
            'mobilite.voir', 'mobilite.creer', 'mobilite.modifier', 'mobilite.approuver',
            'stats.voir',
        ]);

        $recteur->syncPermissions([
            'courrier.voir', 'courrier.valider', 'courrier.rejeter',
            'partenaire.voir',
            'convention.voir', 'convention.approuver', 'convention.rejeter',
            'activite.voir', 'mobilite.voir',
            'stats.voir',
        ]);

        $secretariat->syncPermissions([
            'courrier.voir', 'courrier.creer', 'courrier.modifier', 'courrier.soumettre',
            'courrier.prendre_en_charge',
            'partenaire.voir',
            'convention.voir',
            'activite.voir', 'mobilite.voir',
        ]);

        // ── 5. Créer les utilisateurs ────────────────────────────────────────
        $userAdmin = User::firstOrCreate(
            ['email' => 'admin@srec-uganc.gn'],
            [
                'name'      => 'Administrateur Système',
                'password'  => Hash::make('Admin@2026'),
                'telephone' => '+224 620 000 001',
                'fonction'  => 'Administrateur Système',
                'actif'     => true,
            ]
        );
        $userAdmin->syncRoles(['admin']);

        $userDirectrice = User::firstOrCreate(
            ['email' => 'directrice@srec-uganc.gn'],
            [
                'name'      => 'Dr. Mariama Baldé',
                'password'  => Hash::make('Srec@2026'),
                'telephone' => '+224 624 000 002',
                'fonction'  => 'Directrice du SREC',
                'actif'     => true,
            ]
        );
        $userDirectrice->syncRoles(['directrice']);

        $userRecteur = User::firstOrCreate(
            ['email' => 'recteur@srec-uganc.gn'],
            [
                'name'      => 'Pr. Ibrahima Kourouma',
                'password'  => Hash::make('Srec@2026'),
                'telephone' => '+224 622 000 003',
                'fonction'  => 'Recteur de l\'UGANC',
                'actif'     => true,
            ]
        );
        $userRecteur->syncRoles(['recteur']);

        $userSecretariat = User::firstOrCreate(
            ['email' => 'secretariat@srec-uganc.gn'],
            [
                'name'      => 'Fatoumata Diallo',
                'password'  => Hash::make('Srec@2026'),
                'telephone' => '+224 626 000 004',
                'fonction'  => 'Secrétaire SREC',
                'actif'     => true,
            ]
        );
        $userSecretariat->syncRoles(['secretariat']);

        // ── 6. Données de démonstration ──────────────────────────────────────
        $this->call(DemoDataSeeder::class);

        $this->command->info('✅ Base de données initialisée avec succès !');
        $this->command->info('');
        $this->command->info('📋 Comptes de test :');
        $this->command->info('  admin@srec-uganc.gn       → Admin@2026  (Administrateur)');
        $this->command->info('  directrice@srec-uganc.gn  → Srec@2026   (Directrice)');
        $this->command->info('  recteur@srec-uganc.gn     → Srec@2026   (Recteur)');
        $this->command->info('  secretariat@srec-uganc.gn → Srec@2026   (Secrétariat)');
    }
}
