<?php
/**
 * Database connection setup
 */

$appConfigFile = __DIR__ . '/../../config/app.php';

// If config doesn't exist, we must signal user to run the installer
if (!file_exists($appConfigFile)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'installed' => false,
        'message' => 'Installer needed. Please visit /install to complete database configuration.',
        'code' => 'INSTALLER_NEEDED'
    ]);
    exit;
}

$config = require $appConfigFile;

try {
    $dsn = "mysql:host=" . $config['db']['host'] . ";dbname=" . $config['db']['name'] . ";charset=utf8mb4";
    $db = new PDO($dsn, $config['db']['user'], $config['db']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}
