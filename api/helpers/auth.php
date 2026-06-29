<?php
/**
 * Authentication and security helper middlewares
 */

require_once __DIR__ . '/response.php';

// Safe session startup
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        $lifetime = 86400 * 7; // 7 days recall
        
        // Setup secure cookie parameters
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        session_start();
    }
}

// Ensure the user is authenticated, returns user ID
function requireUserAuth() {
    startSecureSession();
    if (!isset($_SESSION['user_id'])) {
        errorResponse('Unauthorized access. Please log in first.', 401, 'UNAUTHORIZED');
        exit;
    }
    return $_SESSION['user_id'];
}

// Sanitize string input (for XSS safety)
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Local rate limiting file-based (Ideal for Shared Hosting / No Redis required)
function rateLimitCheck($limit = 15, $timeframe = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $hash = md5($ip);
    $dir = __DIR__ . '/../../storage';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $file = "$dir/ratelimit_$hash.json";
    
    $now = time();
    $requests = [];
    
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            // Keep requests that are within the timeframe window
            foreach ($data as $timestamp) {
                if ($now - $timestamp < $timeframe) {
                    $requests[] = $timestamp;
                }
            }
        }
    }
    
    if (count($requests) >= $limit) {
        errorResponse('Too many requests. Please wait before submitting again.', 429, 'RATE_LIMIT_EXCEEDED');
        exit;
    }
    
    $requests[] = $now;
    file_put_contents($file, json_encode($requests));
}
