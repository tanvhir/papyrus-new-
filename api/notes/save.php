<?php
/**
 * REST Endpoint: Transactional DB Sync for Subjects, Notes, & Stats
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$userId = requireUserAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    errorResponse('Invalid json input payload.', 400);
}

$subjects = $input['subjects'] ?? [];
$activeNoteId = $input['activeNoteId'] ?? '';
$studyStats = $input['studyStats'] ?? [];

try {
    $db->beginTransaction();

    $receivedFolderIds = [];
    $receivedNoteIds = [];

    // Prepared statements for upserts
    $folderUpsert = $db->prepare("
        INSERT INTO folders (id, name, user_id) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE name = VALUES(name)
    ");

    $noteUpsert = $db->prepare("
        INSERT INTO notes (
            id, subject_id, title, content, stickies, arrows, dividers, 
            texture, theme_id, is_handwriting, font_size, page_layout, 
            page_margin, page_layout_mode, flashcard_ids, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            subject_id = VALUES(subject_id),
            title = VALUES(title),
            content = VALUES(content),
            stickies = VALUES(stickies),
            arrows = VALUES(arrows),
            dividers = VALUES(dividers),
            texture = VALUES(texture),
            theme_id = VALUES(theme_id),
            is_handwriting = VALUES(is_handwriting),
            font_size = VALUES(font_size),
            page_layout = VALUES(page_layout),
            page_margin = VALUES(page_margin),
            page_layout_mode = VALUES(page_layout_mode),
            flashcard_ids = VALUES(flashcard_ids)
    ");

    // 1. Process Subjects and Notes
    foreach ($subjects as $subject) {
        $folderId = $subject['id'];
        $folderName = $subject['name'];
        $receivedFolderIds[] = $folderId;

        // Upsert Folder
        $folderUpsert->execute([$folderId, $folderName, $userId]);

        // Upsert Notes inside Subject
        $notesList = $subject['notes'] ?? [];
        foreach ($notesList as $note) {
            $noteId = $note['id'];
            $receivedNoteIds[] = $noteId;

            // Prepare JSON parameters
            $stickiesJson = json_encode($note['stickies'] ?? []);
            $arrowsJson = json_encode($note['arrows'] ?? []);
            $dividersJson = json_encode($note['dividers'] ?? []);
            $flashcardIdsJson = json_encode($note['flashcardIds'] ?? []);
            
            $isHandwritingInt = !empty($note['isHandwriting']) ? 1 : 0;
            $fontSizeInt = isset($note['fontSize']) ? (int)$note['fontSize'] : 16;

            $noteUpsert->execute([
                $noteId,
                $folderId,
                $note['title'] ?? 'Untitled Note',
                $note['content'] ?? '',
                $stickiesJson,
                $arrowsJson,
                $dividersJson,
                $note['texture'] ?? 'plain',
                $note['themeId'] ?? 'classic',
                $isHandwritingInt,
                $fontSizeInt,
                $note['pageLayout'] ?? 'pageless',
                $note['pageMargin'] ?? 'normal',
                $note['pageLayoutMode'] ?? 'single',
                $flashcardIdsJson,
                $userId
            ]);
        }
    }

    // 2. Clear deleted notes for this user
    if (!empty($receivedNoteIds)) {
        $inClause = implode(',', array_fill(0, count($receivedNoteIds), '?'));
        $stmtDeleteNotes = $db->prepare("DELETE FROM notes WHERE user_id = ? AND id NOT IN ($inClause)");
        $stmtDeleteNotes->execute(array_merge([$userId], $receivedNoteIds));
    } else {
        $stmtDeleteAllNotes = $db->prepare("DELETE FROM notes WHERE user_id = ?");
        $stmtDeleteAllNotes->execute([$userId]);
    }

    // 3. Clear deleted folders/subjects for this user
    if (!empty($receivedFolderIds)) {
        $inClause = implode(',', array_fill(0, count($receivedFolderIds), '?'));
        $stmtDeleteFolders = $db->prepare("DELETE FROM folders WHERE user_id = ? AND id NOT IN ($inClause)");
        $stmtDeleteFolders->execute(array_merge([$userId], $receivedFolderIds));
    } else {
        $stmtDeleteAllFolders = $db->prepare("DELETE FROM folders WHERE user_id = ?");
        $stmtDeleteAllFolders->execute([$userId]);
    }

    // 4. Update core settings / preferences (activeNoteId, studyStats)
    $otherSettings = [
        'activeNoteId' => $activeNoteId,
        'studyStats' => $studyStats
    ];
    $otherSettingsJson = json_encode($otherSettings);

    $settingsStmt = $db->prepare("
        INSERT INTO settings (user_id, theme, font_family, other_settings)
        VALUES (?, 'classic', 'Inter', ?)
        ON DUPLICATE KEY UPDATE other_settings = VALUES(other_settings)
    ");
    $settingsStmt->execute([$userId, $otherSettingsJson]);

    $db->commit();
    successResponse([], 'Workspace synced to cloud database successfully.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    errorResponse('Failed to sync study workspace: ' . $e->getMessage(), 500);
}
