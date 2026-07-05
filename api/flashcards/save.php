<?php
/**
 * REST Endpoint: Transactional DB Sync for Flashcards & Review Progress
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$userId = requireUserAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['flashcards'])) {
    errorResponse('Invalid json input payload or missing flashcards key.', 400);
}

$flashcards = $input['flashcards'] ?? [];

try {
    $db->beginTransaction();

    $receivedIds = [];

    // Prepared statements for upserts
    $cardUpsert = $db->prepare("
        INSERT INTO flashcards (
            id, type, front, back, cloze_data, points, subject_id, 
            chapter_id, source_note_id, source_block_id, tags, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            type = VALUES(type),
            front = VALUES(front),
            back = VALUES(back),
            cloze_data = VALUES(cloze_data),
            points = VALUES(points),
            subject_id = VALUES(subject_id),
            chapter_id = VALUES(chapter_id),
            source_note_id = VALUES(source_note_id),
            source_block_id = VALUES(source_block_id),
            tags = VALUES(tags)
    ");

    $progressUpsert = $db->prepare("
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

    foreach ($flashcards as $card) {
        $cardId = $card['id'];
        $receivedIds[] = $cardId;

        $pointsJson = json_encode($card['points'] ?? []);
        $tagsJson = json_encode($card['tags'] ?? []);

        // Upsert Core Card data
        $cardUpsert->execute([
            $cardId,
            $card['type'] ?? 'basic',
            $card['front'] ?? '',
            $card['back'] ?? '',
            $card['clozeData'] ?? null,
            $pointsJson,
            $card['subjectId'] ?: null,
            $card['chapterId'] ?? '',
            $card['sourceNoteId'] ?: null,
            $card['sourceBlockId'] ?? null,
            $tagsJson,
            $userId
        ]);

        // Format dates correctly from standards formats
        $nextReview = $card['nextReviewDate'];
        if ($nextReview) {
            // Trim any ISO Z timezone or millis to make standard MySQL datetime
            $nextReview = date('Y-m-d H:i:s', strtotime($nextReview));
        } else {
            $nextReview = date('Y-m-d H:i:s');
        }

        $lastStudied = null;
        if (!empty($card['lastStudiedAt'])) {
            $lastStudied = date('Y-m-d H:i:s', strtotime($card['lastStudiedAt']));
        }

        // Upsert Progess Scheduling data
        $progressUpsert->execute([
            $cardId,
            $userId,
            isset($card['interval']) ? (int)$card['interval'] : 0,
            isset($card['easeFactor']) ? (float)$card['easeFactor'] : 2.50,
            isset($card['reviewCount']) ? (int)$card['reviewCount'] : 0,
            isset($card['difficulty']) ? (float)$card['difficulty'] : 0.00,
            $nextReview,
            $lastStudied
        ]);
    }

    // Deletion step - Purge records removed by user
    if (!empty($receivedIds)) {
        $inClause = implode(',', array_fill(0, count($receivedIds), '?'));
        // Note: foreign keys with ON DELETE CASCADE will handle purging from flashcard_progress automatically!
        $deleteStmt = $db->prepare("DELETE FROM flashcards WHERE user_id = ? AND id NOT IN ($inClause)");
        $deleteStmt->execute(array_merge([$userId], $receivedIds));
    } else {
        $deleteAllStmt = $db->prepare("DELETE FROM flashcards WHERE user_id = ?");
        $deleteAllStmt->execute([$userId]);
    }

    $db->commit();
    successResponse([], 'Flashcards synced to cloud database successfully.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    errorResponse('Failed to sync flashcards: ' . $e->getMessage(), 500);
}
