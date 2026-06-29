<?php
/**
 * API Response Helpers
 */

function jsonResponse($data, $statusCode = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function errorResponse($message, $statusCode = 400, $code = 'ERROR') {
    jsonResponse([
        'success' => false,
        'message' => $message,
        'code' => $code
    ], $statusCode);
}

function successResponse($data = [], $message = 'Success') {
    $response = ['success' => true];
    if (!empty($message)) {
        $response['message'] = $message;
    }
    if (!empty($data) || is_array($data)) {
        $response = array_merge($response, $data);
    }
    jsonResponse($response);
}
