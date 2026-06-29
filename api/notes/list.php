<?php
/**
 * REST Endpoint: Retrieve all user subjects, notes, global settings, & profiles
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

$userId = requireUserAuth();

try {
    // 1. Fetch all Folders/Subjects
    $foldersStmt = $db->prepare("SELECT id, name FROM folders WHERE user_id = ? ORDER BY name ASC");
    $foldersStmt->execute([$userId]);
    $folders = $foldersStmt->fetchAll();

    // 2. Fetch all Notes
    $notesStmt = $db->prepare("SELECT id, subject_id, title, content, stickies, arrows, dividers, texture, theme_id, is_handwriting, font_size, page_layout, page_margin, page_layout_mode, flashcard_ids FROM notes WHERE user_id = ?");
    $notesStmt->execute([$userId]);
    $notes = $notesStmt->fetchAll();

    // Organize notes by folder/subject
    $notesBySubject = [];
    foreach ($notes as $note) {
        $subId = $note['subject_id'];
        
        // Format to client representation (matching types)
        $clientNote = [
            'id' => $note['id'],
            'title' => $note['title'],
            'content' => $note['content'] ?? '',
            'stickies' => json_decode($note['stickies'] ?? '[]', true),
            'arrows' => json_decode($note['arrows'] ?? '[]', true),
            'dividers' => json_decode($note['dividers'] ?? '[]', true),
            'texture' => $note['texture'],
            'themeId' => $note['theme_id'],
            'isHandwriting' => (bool)$note['is_handwriting'],
            'fontSize' => (int)$note['font_size'],
            'pageLayout' => $note['page_layout'] ?? 'a4-portrait',
            'pageMargin' => $note['page_margin'] ?? 'normal',
            'pageLayoutMode' => $note['page_layout_mode'] ?? 'single',
            'flashcardIds' => json_decode($note['flashcard_ids'] ?? '[]', true),
        ];

        if (!isset($notesBySubject[$subId])) {
            $notesBySubject[$subId] = [];
        }
        $notesBySubject[$subId][] = $clientNote;
    }

    // Map folders to Subjects structure
    $subjectsList = [];
    foreach ($folders as $folder) {
        $id = $folder['id'];
        $subjectsList[] = [
            'id' => $id,
            'name' => $folder['name'],
            'notes' => $notesBySubject[$id] ?? []
        ];
    }

    // 3. Fetch Settings / other preferences
    $settingsStmt = $db->prepare("SELECT theme, font_family, other_settings FROM settings WHERE user_id = ? LIMIT 1");
    $settingsStmt->execute([$userId]);
    $settings = $settingsStmt->fetch();

    $activeNoteId = '';
    $studyStats = [
        'totalStudied' => 0,
        'streak' => 0,
        'lastStudyDate' => date('Y-m-d'),
        'weakConceptIds' => []
    ];

    if ($settings) {
        $other = json_decode($settings['other_settings'] ?? '{}', true);
        if (isset($other['activeNoteId'])) {
            $activeNoteId = $other['activeNoteId'];
        }
        if (isset($other['studyStats'])) {
            $studyStats = array_merge($studyStats, $other['studyStats']);
        }
    } else {
        // Build settings table entry if not present
        $insSettings = $db->prepare("INSERT INTO settings (user_id, theme, font_family, other_settings) VALUES (?, 'classic', 'Inter', ?)");
        $insSettings->execute([$userId, json_encode(['activeNoteId' => $activeNoteId, 'studyStats' => $studyStats])]);
    }

    successResponse([
        'subjects' => $subjectsList,
        'activeNoteId' => $activeNoteId,
        'studyStats' => $studyStats
    ]);

} catch (Exception $e) {
    errorResponse('Retrieving study workspace failed: ' . $e->getMessage(), 500);
}
