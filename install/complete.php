<?php
/**
 * Papyrus Setup Wizard - Complete Success Notification
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup Complete - Papyrus</title>
  <link rel="stylesheet" href="installer.css">
  <style>
    .success-icon {
      width: 72px;
      height: 72px;
      background: rgba(34, 197, 94, 0.1);
      border: 2px solid #22c55e;
      border-radius: 50%;
      color: #22c55e;
      font-size: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card" style="text-align: center; border-top: 4px solid #22c55e;">
      <div class="success-icon">&checkmark;</div>
      
      <div class="header" style="margin-bottom: 1.5rem;">
        <h1>Setup Succeeded!</h1>
        <p>Papyrus has been successfully installed and configured.</p>
      </div>

      <div class="alert alert-success" style="text-align: left; font-size: 0.85rem; margin-bottom: 2rem;">
        <strong>Configuration Saved:</strong>
        <p style="margin-top: 0.25rem;">&bull; Database tables generated successfully</p>
        <p>&bull; Primary administrator owner account created</p>
        <p>&bull; Config credentials safely stored in <code>config/app.php</code></p>
        <p>&bull; Installation wizard locked and secured against reuse</p>
      </div>

      <a href="/" class="btn" style="text-decoration: none;">Launch Papyrus Portal &rarr;</a>

      <div class="footer-text">
        Please write-protect <code>config/app.php</code> on your hosting control panel for security.
      </div>
    </div>
  </div>
</body>
</html>
