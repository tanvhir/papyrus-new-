<?php
/**
 * REST Endpoint: Retrieve all user flashcards with full spaced-repetition schedules
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$userId = requireUserAuth();

try {
    $stmt = $db->prepare("
        SELECT 
            f.id, f.type, f.front, f.back, f.cloze_data AS clozeData, f.points, 
            f.subject_id AS subjectId, f.chapter_id AS chapterId, f.source_note_id AS sourceNoteId, 
            f.source_block_id AS sourceBlockId, f.tags, f.created_at AS createdAt,
            COALESCE(p.interval, 0) AS `interval`,
            COALESCE(p.ease_factor, 2.50) AS easeFactor,
            COALESCE(p.review_count, 0) AS reviewCount,
            COALESCE(p.difficulty, 0.00) AS difficulty,
            p.next_review_date AS nextReviewDate,
            p.last_studied_at AS lastStudiedAt
        FROM flashcards f
        LEFT JOIN flashcard_progress p ON f.id = p.flashcard_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ");
    $stmt->execute([$userId]);
    $flashcards = $stmt->fetchAll();

    $clientCardsList = [];
    foreach ($flashcards as $card) {
        $clientCardsList[] = [
            'id' => $card['id'],
            'type' => $card['type'],
            'front' => $card['front'],
            'back' => $card['back'],
            'clozeData' => $card['clozeData'] ?? '',
            'points' => json_decode($card['points'] ?? '[]', true),
            'subjectId' => $card['subjectId'] ?? '',
            'chapterId' => $card['chapterId'] ?? '',
            'sourceNoteId' => $card['sourceNoteId'] ?? '',
            'sourceBlockId' => $card['sourceBlockId'] ?? '',
            'tags' => json_decode($card['tags'] ?? '[]', true),
            'createdAt' => $card['createdAt'],
            'interval' => (int)$card['interval'],
            'easeFactor' => (float)$card['easeFactor'],
            'reviewCount' => (int)$card['reviewCount'],
            'difficulty' => (float)$card['difficulty'],
            'nextReviewDate' => $card['nextReviewDate'] ?: $card['createdAt'],
            'lastStudiedAt' => $card['lastStudiedAt'] ?: null
        ];
    }

    successResponse([
        'flashcards' => $clientCardsList
    ]);

} catch (Exception $e) {
    errorResponse('Failed to retrieve server flashcard schedules: ' . $e->getMessage(), 500);
}
