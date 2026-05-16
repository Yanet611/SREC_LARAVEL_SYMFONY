<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convention_id')->constrained('conventions')->onDelete('cascade');
            $table->foreignId('creee_par')->constrained('users')->onDelete('restrict');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['formation', 'recherche', 'echange', 'conference', 'stage', 'autre']);
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->string('lieu')->nullable();
            $table->integer('participants_prevus')->nullable();
            $table->integer('participants_reels')->nullable();
            $table->enum('statut', ['planifiee', 'en_cours', 'realisee', 'annulee'])->default('planifiee');
            $table->string('rapport_pdf')->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};
