-- Papyrus Database Schema
-- Standard SQL for shared hosting (MySQL 5.7+ & MySQL 8.0+)

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `flashcard_progress`;
DROP TABLE IF EXISTS `flashcards`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `folders`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Folders (Subjects in UI)
CREATE TABLE `folders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_folders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes Table
CREATE TABLE `notes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `subject_id` VARCHAR(50),
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT,
  `stickies` LONGTEXT, -- JSON string
  `arrows` LONGTEXT, -- JSON string
  `dividers` LONGTEXT, -- JSON string
  `images` LONGTEXT, -- JSON string (array of image data with position, size, pinning)
  `texture` VARCHAR(50) DEFAULT 'plain',
  `theme_id` VARCHAR(50) DEFAULT 'classic',
  `is_handwriting` TINYINT(1) DEFAULT 0,
  `font_size` INT DEFAULT 16,
  `page_layout` VARCHAR(50) DEFAULT 'pageless',
  `page_margin` VARCHAR(50) DEFAULT 'normal',
  `page_layout_mode` VARCHAR(50) DEFAULT 'single',
  `notebook_style` VARCHAR(50) DEFAULT 'spiral',
  `flashcard_ids` LONGTEXT, -- JSON array of flashcard associations
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `folders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notes_user` (`user_id`),
  INDEX `idx_notes_folder` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Flashcards Table
CREATE TABLE `flashcards` (
  `id` VARCHAR(50) PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `front` TEXT NOT NULL,
  `back` TEXT NOT NULL,
  `cloze_data` TEXT,
  `points` TEXT, -- JSON string
  `subject_id` VARCHAR(50),
  `chapter_id` VARCHAR(50) DEFAULT '',
  `source_note_id` VARCHAR(50),
  `source_block_id` VARCHAR(50),
  `tags` TEXT, -- JSON array of tags
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_flashcards_user` (`user_id`),
  INDEX `idx_flashcards_note` (`source_note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Flashcard Progress Table (Spaced Repetition State)
CREATE TABLE `flashcard_progress` (
  `flashcard_id` VARCHAR(50) PRIMARY KEY,
  `user_id` INT NOT NULL,
  `interval` INT DEFAULT 0,
  `ease_factor` DECIMAL(5,2) DEFAULT 2.50,
  `review_count` INT DEFAULT 0,
  `difficulty` DECIMAL(5,2) DEFAULT 0.00,
  `next_review_date` DATETIME NOT NULL,
  `last_studied_at` DATETIME DEFAULT NULL,
  FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_progress_user` (`user_id`),
  INDEX `idx_progress_next_review` (`next_review_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `settings` (
  `user_id` INT PRIMARY KEY,
  `theme` VARCHAR(50) DEFAULT 'light',
  `font_family` VARCHAR(100) DEFAULT 'Inter',
  `other_settings` LONGTEXT, -- JSON string mapping user study statistics/preferences
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
