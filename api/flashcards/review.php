<?php
/**
 * REST Endpoint: Single Flashcard Review Progress Update
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$userId = requireUserAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$cardId = $input['cardId'] ?? '';
$interval = isset($input['interval']) ? (int)$input['interval'] : null;
$easeFactor = isset($input['easeFactor']) ? (float)$input['easeFactor'] : null;
$reviewCount = isset($input['reviewCount']) ? (int)$input['reviewCount'] : null;
$difficulty = isset($input['difficulty']) ? (float)$input['difficulty'] : null;
$nextReviewDate = $input['nextReviewDate'] ?? null;
$lastStudiedAt = $input['lastStudiedAt'] ?? date('c');

if (empty($cardId) || is_null($interval) || is_null($easeFactor) || is_null($reviewCount) || is_null($nextReviewDate)) {
    errorResponse('Card ID, interval, easeFactor, reviewCount, and nextReviewDate are required review metrics.', 400);
}

try {
    // Verify first that flashcard belongs to user
    $chkStmt = $db->prepare("SELECT id FROM flashcards WHERE id = ? AND user_id = ? LIMIT 1");
    $chkStmt->execute([$cardId, $userId]);
    if (!$chkStmt->fetch()) {
        errorResponse('Flashcard not found or permission denied.', 404);
    }

    $mysqlNextReviewDate = date('Y-m-d H:i:s', strtotime($nextReviewDate));
    $mysqlLastStudiedAt = date('Y-m-d H:i:s', strtotime($lastStudiedAt));
    $mysqlDifficulty = !is_null($difficulty) ? $difficulty : 0.00;

    $stmt = $db->prepare("
        INSERT INTO flashcard_progress (
            flashcard_id, user_id, `interval`, ease_factor, review_count, difficulty, next_review_date, last_studied_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `interval` = VALUES(`interval`),
            ease_factor = VALUES(ease_factor),
            review_count = VALUES(review_count),
            difficulty = VALUES(difficulty),
            next_review_date = VALUES(next_review_date),
            last_studied_at = VALUES(last_studied_at)
    ");
    $stmt->execute([
        $cardId,
        $userId,
        $interval,
        $easeFactor,
        $reviewCount,
        $mysqlDifficulty,
        $mysqlNextReviewDate,
        $mysqlLastStudiedAt
    ]);

    successResponse([], 'Flashcard review progress processed successfully.');

} catch (Exception $e) {
    errorResponse('An error occurred during card review processing: ' . $e->getMessage(), 500);
}
