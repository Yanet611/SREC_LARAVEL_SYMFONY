<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('historiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('entite_type'); // App\Models\Courrier
            $table->unsignedBigInteger('entite_id');
            $table->string('action'); // created, updated, statut_change, archived...
            $table->string('ancien_statut')->nullable();
            $table->string('nouveau_statut')->nullable();
            $table->text('commentaire')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
