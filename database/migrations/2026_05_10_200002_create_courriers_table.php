<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('courriers', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique(); // SREC-2026-001
            $table->string('objet');
            $table->enum('sens', ['entrant', 'sortant']);
            $table->enum('type', ['demande_partenariat', 'demande_convention', 'invitation', 'information', 'autre']);
            $table->date('date_courrier');
            $table->string('expediteur');
            $table->string('destinataire');
            $table->foreignId('soumis_par')->constrained('users')->onDelete('restrict');
            $table->foreignId('pris_en_charge_par')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('statut', [
                'soumis',
                'recu',
                'pris_en_charge',
                'rdv_planifie',
                'entretien_realise',
                'soumis_directrice',
                'examine_directrice',
                'soumis_recteur',
                'valide',
                'rejete',
                'archive',
            ])->default('soumis');
            $table->string('piece_jointe')->nullable();
            $table->text('observations')->nullable();
            $table->boolean('archive')->default(false);
            $table->timestamp('date_archivage')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courriers');
    }
};
