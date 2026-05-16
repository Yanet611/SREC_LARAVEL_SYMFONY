<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $pdo->exec('CREATE DATABASE IF NOT EXISTS srec_uganc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo "✅ Base de données srec_uganc créée avec succès!\n";
} catch (PDOException $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
