<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications_srec', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('emetteur_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('entite_type')->nullable();
            $table->unsignedBigInteger('entite_id')->nullable();
            $table->string('titre');
            $table->text('message');
            $table->enum('type', ['info', 'action_requise', 'alerte', 'succes'])->default('info');
            $table->enum('priorite', ['normale', 'haute', 'urgente'])->default('normale');
            $table->boolean('lue')->default(false);
            $table->timestamp('lue_le')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_srec');
    }
};
