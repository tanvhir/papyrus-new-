# Papyrus Study Platform - Deployment Guide & cPanel Operations

Papyrus is a premium, cloud-synchronized paper-like writing and study platform. This project has been compiled with a native **PHP 8+ Backend** and **MySQL Spaced-Repetition Sync Engine**, eliminating any requirement for Node.js servers, CLI access, VPS, Docker, or Terminal setups on your production shared hosting.

It is 100% compatible with shared hosting architectures, including:
- **GoDaddy Shared Hosting**
- **Hostinger Shared Hosting / hPanel**
- **cPanel Hosting** (Namecheap, Bluehost, etc.)
- **InfinityFree / Free Hosted Servers**

---

## 🚀 Step-by-Step Shared Hosting Upload & Deployment

### 1. Build the Frontend Assets
Before uploading, build the static optimized Javascript and Stylesheets on your computer or build environment:
```bash
npm run build
```
This compile step bundles all React, Vite, and tailwind assets and drops them inside the `/dist` directory.

### 2. Prepare Your Target Folder Layout
On your shared hosting account, locate your web root directory (usually `public_html`, `htdocs`, or a subdomain folder like `sub.domain.com`). 

Arrange your files inside that web root directory exactly as follows:

```
public_html/ (web root)
│
├── assets/                  <-- Copy contents of "/dist/assets" folder
├── index.html               <-- Copy "/dist/index.html" file
├── .htaccess                <-- Copy and paste the standard ".htaccess" file from the root
│
├── api/                     <-- Upload "/api" directory with all its sub-folders
│   ├── auth/
│   ├── notes/
│   ├── flashcards/
│   ├── config/
│   └── helpers/
│
├── install/                 <-- Upload "/install" directory with all its PHP files
│   ├── index.php
│   ├── setup.php
│   ├── complete.php
│   ├── schema.sql
│   └── installer.css
│
├── storage/                 <-- Upload empty "/storage" directory with its ".htaccess"
│
└── uploads/                 <-- Upload empty "/uploads" directory
```

### 3. Open the Domain and Trigger the Installer Wizard
Once all files are uploaded:
1. Open your web browser and visit your domain (e.g. `https://yourdomain.com`).
2. Because `/config/app.php` is not yet present, Papyrus will safely detect this and present a direct link to launch the auto-installer wizard (`https://yourdomain.com/install/index.php`).
3. The wizard will automatically audit your server to ensure standard requirements are met:
   - PHP Version 8.0+ Check
   - PDO database extension check
   - PDO MySQL database driver check
   - Config directory write-permission check
4. Enter your MySQL database credentials (Host, Database Name, Username, and Password). If you are using cPanel or phpMyAdmin, configure these in the MySQL Databases wizard first.
5. Create your Primary Administrator Sign-in Email and Account Password.
6. Click **Test Connection & Install Platform**.
7. The system will:
   - Verify connection properties.
   - Run the standard table schemas (`schema.sql`).
   - Securely hash your Administrator Password with salt.
   - Generate `/config/app.php` automatically containing your encrypted connection credentials.
   - Lock the setup wizard (`install.lock`) preventing any attempt to rerun setup in the future.
8. Click **Launch Papyrus Portal** and sign in using your admin credentials.

---

## 🔒 Security Hardening Checklists

- **Folder Write-Permissions**: Once setup is successful, adjust directory permissions on `config/app.php` to `0644` or `0600` via your file manager inside cPanel to prevent unauthorized server script reading.
- **Auto-Installer Lock**: The installer automatically blocks execution once `/config/app.php` exists or a lockfile `/install/install.lock` is present. Never delete the `install.lock` file or the `config/app.php` file on production unless you wish to reset your schema.
- **Storage Protection**: The `/storage` folder holds IP rate limiting tables. We've placed an explicit rewrite `.htaccess` blocking direct HTTP/HTTPS browser downloads inside this directory.

---

## 🔄 Spaced-Repetition Spaced Math Flashcards Sync
Papyrus uses a normalized db architecture to replicate flashcards instantly across multiple devices. The client logs study sessions, weak concept counts, difficult selections, and automatically computes next review schedules using an advanced spaced repetition interval algorithm.

All data points are synchronized on back-to-back 1.5-second debounce intervals, allowing offline drafts to save in your local IndexedDB first, then batch synchronizing to Hostinger or GoDaddy in the background!
