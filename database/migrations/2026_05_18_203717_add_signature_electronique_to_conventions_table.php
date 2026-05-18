<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conventions', function (Blueprint $table) {
            $table->unsignedBigInteger('signe_par')->nullable()->after('decidee_par');
            $table->timestamp('date_signature_electronique')->nullable()->after('signe_par');
            $table->string('signature_token', 64)->nullable()->unique()->after('date_signature_electronique');
            $table->foreign('signe_par')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conventions', function (Blueprint $table) {
            $table->dropForeign(['signe_par']);
            $table->dropColumn(['signe_par', 'date_signature_electronique', 'signature_token']);
        });
    }
};
