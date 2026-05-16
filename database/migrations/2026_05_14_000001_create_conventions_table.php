<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conventions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partenaire_id')->constrained('partenaires')->onDelete('cascade');
            $table->foreignId('courrier_id')->nullable()->constrained('courriers')->onDelete('set null');
            $table->string('reference')->unique(); // CONV-2026-001
            $table->string('intitule');
            $table->enum('type', ['accord_cadre', 'memorandum', 'accord_specifique', 'protocole', 'autre']);
            $table->date('date_signature')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->boolean('reconductible')->default(false);
            $table->foreignId('creee_par')->constrained('users')->onDelete('restrict');
            $table->foreignId('soumise_par')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('decidee_par')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('statut', [
                'brouillon',
                'soumise_directrice',
                'soumise_recteur',
                'approuvee',
                'rejetee',
                'revision',
                'signee',
                'expiree',
                'archive',
            ])->default('brouillon');
            $table->string('document_pdf')->nullable();
            $table->text('description')->nullable();
            $table->text('motif_rejet')->nullable();
            $table->text('observations')->nullable();
            $table->boolean('archive')->default(false);
            $table->timestamp('date_archivage')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conventions');
    }
};
