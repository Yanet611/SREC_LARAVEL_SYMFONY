<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->constrained('courriers')->onDelete('cascade');
            $table->foreignId('organise_par')->constrained('users')->onDelete('restrict');
            $table->dateTime('date_heure');
            $table->string('lieu')->nullable();
            $table->text('ordre_du_jour')->nullable();
            $table->enum('statut', ['planifie', 'realise', 'annule'])->default('planifie');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rapports_entretien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendez_vous_id')->constrained('rendez_vous')->onDelete('cascade');
            $table->foreignId('redacteur_id')->constrained('users')->onDelete('restrict');
            $table->text('compte_rendu');
            $table->enum('decision_recommandee', ['favorable', 'defavorable', 'en_attente'])->default('en_attente');
            $table->text('observations')->nullable();
            $table->string('fichier')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports_entretien');
        Schema::dropIfExists('rendez_vous');
    }
};
