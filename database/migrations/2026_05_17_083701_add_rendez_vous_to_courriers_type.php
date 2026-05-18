<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE courriers MODIFY COLUMN type ENUM('demande_partenariat', 'demande_convention', 'invitation', 'information', 'autre', 'rendez_vous') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE courriers MODIFY COLUMN type ENUM('demande_partenariat', 'demande_convention', 'invitation', 'information', 'autre') NOT NULL");
    }
};
