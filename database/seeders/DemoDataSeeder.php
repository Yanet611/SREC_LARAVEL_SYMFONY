<?php

namespace Database\Seeders;

use App\Models\Activite;
use App\Models\Convention;
use App\Models\Courrier;
use App\Models\Mobilite;
use App\Models\Partenaire;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Nettoyage des anciennes données (sauf utilisateurs/rôles) ──────
        Schema::disableForeignKeyConstraints();
        DB::table('historiques')->truncate();
        DB::table('notifications_srec')->truncate();
        DB::table('rendez_vous')->truncate();
        DB::table('activites')->truncate();
        DB::table('mobilites')->truncate();
        DB::table('conventions')->truncate();
        DB::table('partenaires')->truncate();
        DB::table('courriers')->truncate();
        Schema::enableForeignKeyConstraints();

        $secretariat = User::where('email', 'secretariat@srec-uganc.gn')->first();
        $directrice  = User::where('email', 'directrice@srec-uganc.gn')->first();
        $recteur     = User::where('email', 'recteur@srec-uganc.gn')->first();

        // ── Courriers ────────────────────────────────────────────────────────
        $courriers = [
            [
                'numero'       => 'SREC-2026-001',
                'objet'        => 'Nouvelle proposition de partenariat avec UADB',
                'sens'         => 'entrant',
                'type'         => 'demande_partenariat',
                'date_courrier' => '2026-05-10',
                'expediteur'   => 'Université Alioune Diop de Bambey',
                'destinataire' => 'SREC - UGANC',
                'soumis_par'   => $secretariat->id,
                'statut'       => 'soumis_directrice',
            ],
            [
                'numero'       => 'SREC-2026-002',
                'objet'        => 'Invitation au colloque international sur l\'IA',
                'sens'         => 'entrant',
                'type'         => 'invitation',
                'date_courrier' => '2026-05-12',
                'expediteur'   => 'Ministère de l\'Enseignement Supérieur',
                'destinataire' => 'Recteur UGANC',
                'soumis_par'   => $secretariat->id,
                'statut'       => 'soumis_directrice',
            ],
            [
                'numero'       => 'SREC-2026-003',
                'objet'        => 'Projet d\'accord cadre - Université de Montréal',
                'sens'         => 'entrant',
                'type'         => 'demande_convention',
                'date_courrier' => '2026-05-14',
                'expediteur'   => 'Université de Montréal',
                'destinataire' => 'SREC - UGANC',
                'soumis_par'   => $secretariat->id,
                'statut'       => 'soumis_directrice',
            ],
            [
                'numero'       => 'SREC-2026-004',
                'objet'        => 'Demande d\'informations sur les mobilités ERASMUS',
                'sens'         => 'entrant',
                'type'         => 'information',
                'date_courrier' => '2026-05-15',
                'expediteur'   => 'Campus France',
                'destinataire' => 'SREC - UGANC',
                'soumis_par'   => $secretariat->id,
                'statut'       => 'soumis_directrice',
            ],
            [
                'numero'       => 'SREC-2026-005',
                'objet'        => 'Renouvellement de convention AUF',
                'sens'         => 'entrant',
                'type'         => 'demande_convention',
                'date_courrier' => '2026-05-16',
                'expediteur'   => 'Agence Universitaire de la Francophonie',
                'destinataire' => 'SREC - UGANC',
                'soumis_par'   => $secretariat->id,
                'statut'       => 'soumis_directrice',
            ],
        ];

        foreach ($courriers as $data) {
            Courrier::create($data);
        }

        // ── Partenaires ──────────────────────────────────────────────────────
        $partenairesData = [
            [
                'nom'             => 'Université Sorbonne Paris Nord',
                'sigle'           => 'USPN',
                'type'            => 'universite',
                'nature'          => 'international',
                'pays'            => 'France',
                'ville'           => 'Paris',
                'site_web'        => 'https://www.univ-paris13.fr',
                'email'           => 'international@univ-paris13.fr',
                'contact_nom'     => 'Dr. Sophie Martin',
                'contact_fonction' => 'Directrice RI',
                'contact_email'   => 'smartin@univ-paris13.fr',
                'statut'          => 'actif',
            ],
            [
                'nom'             => 'Institut Supérieur de Gestion de Dakar',
                'sigle'           => 'ISG Dakar',
                'type'            => 'universite',
                'nature'          => 'international',
                'pays'            => 'Sénégal',
                'ville'           => 'Dakar',
                'email'           => 'contact@isg-dakar.sn',
                'contact_nom'     => 'Pr. Oumar Diop',
                'contact_fonction' => 'Directeur Général',
                'statut'          => 'actif',
            ],
            [
                'nom'             => 'Organisation Internationale de la Francophonie',
                'sigle'           => 'OIF',
                'type'            => 'organisation_internationale',
                'nature'          => 'international',
                'pays'            => 'France',
                'ville'           => 'Paris',
                'site_web'        => 'https://www.francophonie.org',
                'contact_nom'     => 'Bureau Afrique de l\'Ouest',
                'statut'          => 'actif',
            ],
            [
                'nom'             => 'Ambassade des États-Unis en Guinée',
                'sigle'           => null,
                'type'            => 'ambassade',
                'nature'          => 'international',
                'pays'            => 'Guinée',
                'ville'           => 'Conakry',
                'statut'          => 'actif',
            ],
            [
                'nom'             => 'Université de Kinshasa',
                'sigle'           => 'UNIKIN',
                'type'            => 'universite',
                'nature'          => 'international',
                'pays'            => 'Congo RDC',
                'ville'           => 'Kinshasa',
                'statut'          => 'actif',
            ],
        ];

        $partenaires = [];
        foreach ($partenairesData as $data) {
            $partenaires[] = Partenaire::firstOrCreate(['nom' => $data['nom']], $data);
        }

        // ── Conventions ──────────────────────────────────────────────────────
        $conventionsData = [
            [
                'partenaire_id'  => $partenaires[0]->id,
                'reference'      => 'CONV-2024-001',
                'intitule'       => 'Accord de coopération scientifique et pédagogique',
                'type'           => 'accord_cadre',
                'date_signature' => '2024-09-01',
                'date_debut'     => '2024-09-01',
                'date_fin'       => '2027-08-31',
                'reconductible'  => true,
                'creee_par'      => $directrice->id,
                'decidee_par'    => $recteur->id,
                'statut'         => 'signee',
                'description'    => 'Accord cadre portant sur les échanges d\'enseignants-chercheurs, les programmes conjoints de master, et les mobilités étudiantes.',
            ],
            [
                'partenaire_id'  => $partenaires[1]->id,
                'reference'      => 'CONV-2025-001',
                'intitule'       => 'Convention de co-diplomation en gestion',
                'type'           => 'accord_specifique',
                'date_signature' => '2025-01-15',
                'date_debut'     => '2025-02-01',
                'date_fin'       => '2028-01-31',
                'creee_par'      => $directrice->id,
                'decidee_par'    => $recteur->id,
                'statut'         => 'signee',
                'description'    => 'Co-diplomation pour le Master en Management des Organisations.',
            ],
            [
                'partenaire_id'  => $partenaires[2]->id,
                'reference'      => 'CONV-2026-001',
                'intitule'       => 'Protocole d\'accord pour le programme BOURSE OIF',
                'type'           => 'protocole',
                'creee_par'      => $directrice->id,
                'statut'         => 'soumise_recteur',
                'description'    => 'Protocole pour l\'attribution de bourses aux étudiants guinéens dans l\'espace francophone.',
            ],
        ];

        $conventions = [];
        foreach ($conventionsData as $data) {
            $conventions[] = Convention::firstOrCreate(['reference' => $data['reference']], $data);
        }

        // ── Activités ────────────────────────────────────────────────────────
        $activitesData = [
            [
                'convention_id'       => $conventions[0]->id,
                'creee_par'           => $directrice->id,
                'titre'               => 'Séminaire franco-guinéen sur l\'innovation pédagogique',
                'type'                => 'conference',
                'date_debut'          => '2025-11-10',
                'date_fin'            => '2025-11-12',
                'lieu'                => 'Conakry - Campus UGANC',
                'participants_prevus' => 80,
                'participants_reels'  => 73,
                'statut'              => 'realisee',
            ],
            [
                'convention_id'       => $conventions[0]->id,
                'creee_par'           => $directrice->id,
                'titre'               => 'Atelier de renforcement de capacités - LMD',
                'type'                => 'formation',
                'date_debut'          => '2026-06-15',
                'date_fin'            => '2026-06-20',
                'lieu'                => 'Paris - Université Sorbonne',
                'participants_prevus' => 10,
                'statut'              => 'planifiee',
            ],
            [
                'convention_id'       => $conventions[1]->id,
                'creee_par'           => $directrice->id,
                'titre'               => 'Jury commun de soutenance Master Management',
                'type'                => 'echange',
                'date_debut'          => '2026-07-01',
                'date_fin'            => '2026-07-03',
                'lieu'                => 'Conakry - UGANC',
                'participants_prevus' => 30,
                'statut'              => 'planifiee',
            ],
        ];

        foreach ($activitesData as $data) {
            Activite::create($data);
        }

        // ── Mobilités ────────────────────────────────────────────────────────
        $mobilitesData = [
            [
                'convention_id'       => $conventions[0]->id,
                'creee_par'           => $directrice->id,
                'reference'           => 'MOB-2025-001',
                'nom_beneficiaire'    => 'Dr. Mamadou Barry',
                'email_beneficiaire'  => 'm.barry@uganc.edu.gn',
                'type_beneficiaire'   => 'enseignant',
                'type_mobilite'       => 'sortante',
                'institution_accueil' => 'Université Sorbonne Paris Nord',
                'pays_destination'    => 'France',
                'ville_destination'   => 'Paris',
                'objet_sejour'        => 'Stage de recherche en Sciences de l\'Éducation',
                'date_depart'         => '2025-10-01',
                'date_retour'         => '2025-12-31',
                'financement'         => 'Bourse Campus France',
                'statut'              => 'realisee',
            ],
            [
                'convention_id'       => $conventions[0]->id,
                'creee_par'           => $directrice->id,
                'reference'           => 'MOB-2026-001',
                'nom_beneficiaire'    => 'Aissatou Camara',
                'email_beneficiaire'  => 'a.camara@etu.uganc.edu.gn',
                'type_beneficiaire'   => 'etudiant',
                'type_mobilite'       => 'sortante',
                'institution_accueil' => 'Université Sorbonne Paris Nord',
                'pays_destination'    => 'France',
                'ville_destination'   => 'Paris',
                'objet_sejour'        => 'Semestre d\'études en L3 Sciences Économiques',
                'date_depart'         => '2026-09-01',
                'date_retour'         => '2027-01-31',
                'financement'         => 'Bourse UGANC',
                'statut'              => 'approuvee',
            ],
            [
                'creee_par'           => $directrice->id,
                'reference'           => 'MOB-2026-002',
                'nom_beneficiaire'    => 'Prof. Jean-Pierre Moreau',
                'type_beneficiaire'   => 'enseignant',
                'type_mobilite'       => 'entrante',
                'institution_accueil' => 'UGANC',
                'pays_destination'    => 'Guinée',
                'ville_destination'   => 'Conakry',
                'objet_sejour'        => 'Cours intensif en Droit International - Master UGANC',
                'date_depart'         => '2026-10-15',
                'date_retour'         => '2026-11-15',
                'financement'         => 'Accord cadre Sorbonne-UGANC',
                'statut'              => 'en_attente',
            ],
        ];

        foreach ($mobilitesData as $data) {
            Mobilite::firstOrCreate(['reference' => $data['reference']], $data);
        }

        $this->command->info('📊 Données de démonstration insérées.');
    }
}
