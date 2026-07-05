<?php
/**
 * User login handler
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

// Rate limit login attempts: max 6 attempts per minute
rateLimitCheck(6, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

// Read body input
$input = json_decode(file_get_contents('php://input'), true);
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $input['password'] ?? '';

if (!$email || empty($password)) {
    errorResponse('Valid email and password are required credentials.', 400);
}

try {
    $stmt = $db->prepare("SELECT id, email, username, password_hash, role FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Start secure cookie session
        startSecureSession();
        
        // Regenerate to prevent session fixation attacks
        session_regenerate_id(true);
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        // Return authenticated info (omit password_hash)
        successResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ], 'Authenticated successfully.');
    } else {
        errorResponse('Invalid email or password combination.', 401, 'INVALID_CREDENTIALS');
    }
} catch (Exception $e) {
    errorResponse('Login helper encountered an issue: ' . $e->getMessage(), 500);
}
