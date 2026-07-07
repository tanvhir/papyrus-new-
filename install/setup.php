<?php
/**
 * Papyrus Setup Logic - Table Provisioning, User Seeding, & Lock Generation
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$db_host = filter_input(INPUT_POST, 'db_host', FILTER_DEFAULT);
$db_name = filter_input(INPUT_POST, 'db_name', FILTER_DEFAULT);
$db_user = filter_input(INPUT_POST, 'db_user', FILTER_DEFAULT);
$db_pass = isset($_POST['db_pass']) ? $_POST['db_pass'] : '';
$admin_email = filter_input(INPUT_POST, 'admin_email', FILTER_VALIDATE_EMAIL);
$admin_username = filter_input(INPUT_POST, 'admin_username', FILTER_DEFAULT);
$admin_pass = isset($_POST['admin_pass']) ? $_POST['admin_pass'] : '';

$errors = [];

if (!$db_host || !$db_name || !$db_user) {
    $errors[] = 'Please fill out all database credentials fields.';
}
if (!$admin_email || !$admin_username || empty($admin_pass)) {
    $errors[] = 'Please enter a valid administrator email, username, and password.';
}
if (strlen($admin_pass) < 8) {
    $errors[] = 'Administrator password must be at least 8 characters long.';
}

if (!empty($errors)) {
    renderError($errors);
    exit;
}

try {
    // 1. Validate connection first
    $dsn = "mysql:host=$db_host;charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    // 2. Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$db_name`;");

    // 3. Read and execute schema definition
    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file index not found at $schemaFile.");
    }
    
    $schemaSql = file_get_contents($schemaFile);
    
    // Split SQL into separate statements to run securely
    // A simple regex approach or explode on semicolon in simple scripts
    $queries = explode(';', $schemaSql);
    foreach ($queries as $query) {
        $trimmed = trim($query);
        if (!empty($trimmed)) {
            $pdo->exec($trimmed);
        }
    }

    // 4. Create primary Administrator Account
    $passwordHash = password_hash($admin_pass, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("INSERT INTO `users` (email, username, password_hash, role) VALUES (?, ?, ?, 'admin')");
    $stmt->execute([$admin_email, $admin_username, $passwordHash]);
    $userId = $pdo->lastInsertId();

    // 5. Initialize settings row for admin
    $settingsStmt = $pdo->prepare("INSERT INTO `settings` (user_id, theme, font_family, other_settings) VALUES (?, 'classic', 'Inter', ?)");
    $settingsStmt->execute([$userId, json_encode([
        'totalStudied' => 0,
        'streak' => 0,
        'lastStudyDate' => date('Y-m-d'),
        'weakConceptIds' => []
    ])]);

    // 6. Write Configuration File /config/app.php
    $configContent = "<?php\n" .
        "// Papyrus Cloud Production Configuration\n" .
        "// Auto-generated on " . date('Y-m-d H:i:s') . "\n\n" .
        "return [\n" .
        "    'db' => [\n" .
        "        'host' => " . var_export($db_host, true) . ",\n" .
        "        'name' => " . var_export($db_name, true) . ",\n" .
        "        'user' => " . var_export($db_user, true) . ",\n" .
        "        'pass' => " . var_export($db_pass, true) . ",\n" .
        "    ],\n" .
        "    'auth' => [\n" .
        "        'cookie_secure' => isset(\$_SERVER['HTTPS']),\n" .
        "        'cookie_httponly' => true,\n" .
        "        'session_lifetime' => 86400 * 7,\n" .
        "    ]\n" .
        "];\n";

    $configDir = __DIR__ . '/../config';
    if (!is_dir($configDir)) {
        mkdir($configDir, 0755, true);
    }
    
    file_put_contents($configDir . '/app.php', $configContent);

    // 7. Generate Lock File
    file_put_contents(__DIR__ . '/install.lock', 'Installed on ' . date('c'));

    // Success redirect
    header('Location: complete.php');
    exit;

} catch (PDOException $pdoEx) {
    renderError(['Database connection or execution failed: ' . $pdoEx->getMessage()]);
} catch (Exception $e) {
    renderError(['An error occurred during platform deployment: ' . $e->getMessage()]);
}

function renderError(array $errors) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Installation Error</title>
      <link rel="stylesheet" href="installer.css">
    </head>
    <body>
      <div class="container">
        <div class="card" style="border-top: 4px solid #ef4444;">
          <div class="header">
            <h1 style="color: #ef4444;">Installation Failed</h1>
            <p>Errors were encountered during setup</p>
          </div>

          <div class="alert alert-danger">
            <ul style="padding-left: 1.25rem;">
              <?php foreach ($errors as $error): ?>
                <li><?php echo htmlspecialchars($error); ?></li>
              <?php endforeach; ?>
            </ul>
          </div>

          <button onclick="window.history.back();" class="btn" style="background-color: var(--text-dark);">
            &larr; Try Again
          </button>
        </div>
      </div>
    </body>
    </html>
    <?php
}
