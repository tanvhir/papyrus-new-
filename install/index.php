<?php
/**
 * Papyrus Setup Wizard - Prerequisite Checker & Config Collector
 */

// Define helper to check if installed
$configFile = __DIR__ . '/../config/app.php';
$lockFile = __DIR__ . '/install.lock';

if (file_exists($configFile) || file_exists($lockFile)) {
    header('Location: /');
    exit;
}

// Environmental checks
$phpVersion = phpversion();
$phpOk = version_compare($phpVersion, '8.0.0', '>=');
$pdoOk = extension_loaded('pdo');
$pdoMysqlOk = extension_loaded('pdo_mysql');
$configDirWritable = is_writable(__DIR__ . '/../config') || is_writable(__DIR__ . '/..');

$allPassed = $phpOk && $pdoOk && $pdoMysqlOk && $configDirWritable;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup Wizard - Papyrus Study Platform</title>
  <link rel="stylesheet" href="installer.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>PAPYRUS</h1>
        <p>Database &amp; Server Installation Wizard</p>
      </div>

      <div class="step-indicator">
        <div class="step-node active">1</div>
        <div class="step-node">2</div>
        <div class="step-node">3</div>
      </div>

      <?php if (!$allPassed): ?>
        <div class="alert alert-danger">
          <strong>System Prerequisite Failure!</strong><br>
          Please fix the listed server configuration errors before continuing.
        </div>
      <?php endif; ?>

      <form action="setup.php" method="POST">
        <!-- Prerequisites Summary Section -->
        <div style="margin-bottom: 2rem;">
          <h2 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 1rem; color: var(--accent-color);">Prerequisites Check</h2>
          
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>PHP Version 8.0+</span>
            <span class="test-badge <?php echo $phpOk ? 'alert-success' : 'alert-danger'; ?>">
              PHP <?php echo htmlspecialchars($phpVersion); ?> (<?php echo $phpOk ? 'OK' : 'Requires v8.0+'; ?>)
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>PDO Extension</span>
            <span class="test-badge <?php echo $pdoOk ? 'alert-success' : 'alert-danger'; ?>">
              <?php echo $pdoOk ? 'Installed' : 'Missing'; ?>
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>PDO MySQL Driver</span>
            <span class="test-badge <?php echo $pdoMysqlOk ? 'alert-success' : 'alert-danger'; ?>">
              <?php echo $pdoMysqlOk ? 'Installed' : 'Missing'; ?>
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>Config Directory Writable</span>
            <span class="test-badge <?php echo $configDirWritable ? 'alert-success' : 'alert-danger'; ?>">
              <?php echo $configDirWritable ? 'Writable' : 'Unwritable (please chmod)'; ?>
            </span>
          </div>
        </div>

        <?php if ($allPassed): ?>
          <div style="margin-bottom: 2rem;">
            <h2 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 1rem; color: var(--accent-color);">MySQL Database Configuration</h2>
            
            <div class="form-group">
              <label for="db_host">Database Host</label>
              <input type="text" id="db_host" name="db_host" class="form-control" value="localhost" required>
              <div class="input-feedback">Usually "localhost" or an IP address</div>
            </div>

            <div class="form-group">
              <label for="db_name">Database Name</label>
              <input type="text" id="db_name" name="db_name" class="form-control" placeholder="papyrus_db" required>
              <div class="input-feedback">Target SQL DB Name</div>
            </div>

            <div class="form-group">
              <label for="db_user">Database Username</label>
              <input type="text" id="db_user" name="db_user" class="form-control" placeholder="mysql_user" required>
              <div class="input-feedback">Database Access User</div>
            </div>

            <div class="form-group">
              <label for="db_pass">Database Password</label>
              <input type="password" id="db_pass" name="db_pass" class="form-control" placeholder="••••••••••••">
              <div class="input-feedback">User password</div>
            </div>
          </div>

          <div style="margin-bottom: 2rem;">
            <h2 style="font-family: var(--font-display); font-size: 1.15rem; margin-bottom: 1rem; color: var(--accent-color);">Primary Administrative User</h2>
            
            <div class="form-group">
              <label for="admin_email">Admin Email (Sign In Username)</label>
              <input type="email" id="admin_email" name="admin_email" class="form-control" placeholder="admin@domain.com" required>
            </div>

            <div class="form-group">
              <label for="admin_username">Admin Display Name</label>
              <input type="text" id="admin_username" name="admin_username" class="form-control" value="Administrator" required>
            </div>

            <div class="form-group">
              <label for="admin_pass">Admin Password</label>
              <input type="password" id="admin_pass" name="admin_pass" class="form-control" placeholder="••••••••••••" minlength="8" required>
              <div class="input-feedback">Minimum 8 characters</div>
            </div>
          </div>

          <button type="submit" class="btn">Test Connection &amp; Install Platform →</button>
        <?php else: ?>
          <button type="button" class="btn" style="opacity: 0.6; cursor: not-allowed;" disabled>Requirements Unmet</button>
        <?php endif; ?>
      </form>

      <div class="footer-text">
        Papyrus Shared Hosting Auto-Installer &bull; <a href="https://ai.studio/build" target="_blank">Built with AI Studio</a>
      </div>
    </div>
  </div>
</body>
</html>
