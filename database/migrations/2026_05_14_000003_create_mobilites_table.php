<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mobilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convention_id')->nullable()->constrained('conventions')->onDelete('set null');
            $table->foreignId('creee_par')->constrained('users')->onDelete('restrict');
            $table->string('reference')->unique(); // MOB-2026-001
            $table->string('nom_beneficiaire');
            $table->string('email_beneficiaire')->nullable();
            $table->string('telephone_beneficiaire')->nullable();
            $table->enum('type_beneficiaire', ['enseignant', 'chercheur', 'etudiant', 'personnel_administratif']);
            $table->enum('type_mobilite', ['sortante', 'entrante']);
            $table->string('institution_accueil');
            $table->string('pays_destination');
            $table->string('ville_destination')->nullable();
            $table->string('objet_sejour');
            $table->date('date_depart');
            $table->date('date_retour');
            $table->string('financement')->nullable(); // bourse, propre financement, etc.
            $table->decimal('montant_financement', 10, 2)->nullable();
            $table->enum('statut', ['en_attente', 'approuvee', 'en_cours', 'realisee', 'annulee'])->default('en_attente');
            $table->string('rapport_pdf')->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mobilites');
    }
};
