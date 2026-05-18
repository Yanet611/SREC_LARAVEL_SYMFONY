<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->enum('type_rdv', [
                'en_presentiel',
                'en_video',
                'en_ligne',
                'par_telephone',
                'autre',
            ])->default('en_presentiel')->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->dropColumn('type_rdv');
        });
    }
};
