<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('partenaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->nullable()->constrained('courriers')->onDelete('set null');
            $table->string('nom');
            $table->string('sigle')->nullable();
            $table->enum('type', ['universite', 'ong', 'ambassade', 'organisation_internationale', 'entreprise', 'autre']);
            $table->enum('nature', ['national', 'international']);
            $table->string('pays');
            $table->string('ville')->nullable();
            $table->string('adresse')->nullable();
            $table->string('site_web')->nullable();
            $table->string('email')->nullable();
            $table->string('telephone')->nullable();
            // Contact principal
            $table->string('contact_nom')->nullable();
            $table->string('contact_fonction')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_telephone')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'suspendu'])->default('actif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partenaires');
    }
};
