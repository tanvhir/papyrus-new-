<?php
/**
 * Current user session status API
 */

// If database isn't configured,db.php automatically triggers installer warning.
// Let's load the configuration path check safely.
$appConfigFile = __DIR__ . '/../../config/app.php';
if (!file_exists($appConfigFile)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'installed' => false,
        'message' => 'Installer needed.',
        'code' => 'INSTALLER_NEEDED'
    ]);
    exit;
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

startSecureSession();

if (isset($_SESSION['user_id'])) {
    successResponse([
        'loggedIn' => true,
        'installed' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]
    ]);
} else {
    // Elegant, non-blocking response when user is guest
    jsonResponse([
        'success' => true,
        'loggedIn' => false,
        'installed' => true,
        'message' => 'No active user session.'
    ]);
}
