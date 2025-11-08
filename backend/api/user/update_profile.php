<?php
/**
 * backend/api/user/update_profile.php
 * Update editable fields for a member and return the updated profile as JSON.
 * Accepts member_id from (priority): PHP session > POST JSON.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Allow POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Optional session
if (session_status() === PHP_SESSION_NONE) { @session_start(); }
$session_member_id = isset($_SESSION['member_id']) ? (int)$_SESSION['member_id'] : null;

// Parse JSON body
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

// Resolve member_id: session > body
$member_id = $session_member_id ?: (int)($body['member_id'] ?? 0);
if ($member_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'member_id is required']);
    exit;
}

// Whitelist editable fields
$editable = ['first_name','last_name','username','email','phone','profile_image_url'];
$updates = [];
$types   = '';
$params  = [];

$trim = static function($v){ return is_string($v) ? trim($v) : $v; };
$errors = [];

foreach ($editable as $key) {
    if (array_key_exists($key, $body)) {
        $val = $trim($body[$key]);

        // Basic validations
        if (in_array($key, ['first_name','last_name'], true)) {
            if ($val === '' || $val === null) { $errors[] = $key.' is required'; }
            if (is_string($val) && mb_strlen($val) > 100) { $errors[] = $key.' too long'; }
        }
        if ($key === 'email') {
            if ($val !== '' && $val !== null && !filter_var($val, FILTER_VALIDATE_EMAIL)) { $errors[] = 'email is invalid'; }
            if (is_string($val) && mb_strlen($val) > 100) { $errors[] = 'email too long'; }
        }
        if ($key === 'phone' && is_string($val) && mb_strlen($val) > 20) { $errors[] = 'phone too long'; }
        if ($key === 'profile_image_url' && is_string($val) && mb_strlen($val) > 255) { $errors[] = 'profile_image_url too long'; }

        $updates[$key] = $val; // allow empty to clear
    }
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => 'validation_failed', 'details' => $errors]);
    exit;
}

if (!$updates) {
    http_response_code(400);
    echo json_encode(['error' => 'no_fields_to_update']);
    exit;
}

// Build dynamic UPDATE safely
$set = [];
foreach ($updates as $col => $_) { $set[] = "$col = ?"; $types .= 's'; }
$types .= 'i';

$sql = 'UPDATE member SET '.implode(', ', $set).' WHERE member_id = ?';
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'prepare_failed', 'detail' => $conn->error]);
    exit;
}

$params = array_values($updates);
$params[] = $member_id;

$bind = [];
$bind[] = &$types;
foreach ($params as $k => $v) { $bind[] = &$params[$k]; }
call_user_func_array([$stmt, 'bind_param'], $bind);

try {
    if (!$stmt->execute()) {
        if ($stmt->errno === 1062) {
            // Duplicate key (unique constraint)
            $msg = $stmt->error; $field = null;
            if (strpos($msg, 'email') !== false) $field = 'email';
            if (strpos($msg, 'phone') !== false) $field = 'phone';
            if (strpos($msg, 'username') !== false) $field = 'username';
            http_response_code(409);
            echo json_encode(['error' => 'duplicate', 'field' => $field, 'detail' => $msg]);
            $stmt->close();
            exit;
        }
        throw new Exception($stmt->error, $stmt->errno);
    }
    $stmt->close();

    // Return updated profile (single source of truth)
    $stmt2 = $conn->prepare('SELECT member_id, first_name, last_name, username, email, phone, tier, join_date, profile_image_url FROM member WHERE member_id = ? LIMIT 1');
    if ($stmt2) {
        $stmt2->bind_param('i', $member_id);
        $stmt2->execute();
        $res = $stmt2->get_result();
        $row = $res->fetch_assoc();
        $stmt2->close();

        if (!empty($row['join_date'])) {
            $ts = strtotime($row['join_date']);
            $row['join_date'] = $ts ? date('Y-m-d', $ts) : '';
        } else {
            $row['join_date'] = '';
        }

        echo json_encode(['success' => true, 'profile' => $row]);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server_error', 'detail' => $e->getMessage()]);
}