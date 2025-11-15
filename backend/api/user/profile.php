<?php
/**
 * backend/api/user/profile.php
 * Return a single member profile as JSON.
 * Accepts member_id from (priority): PHP session > POST JSON > GET query.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

// Handle CORS preflight quickly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Allow only GET or POST for this endpoint
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Optional session usage (future-ready)
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
$session_member_id = isset($_SESSION['member_id']) ? (int)$_SESSION['member_id'] : null;

// Parse JSON body if POST
$body = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if (is_string($raw) && $raw !== '') {
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            $body = $json;
        }
    }
}

// Resolve member_id: session > POST JSON > GET
$member_id =
    ($session_member_id ?: null) ??
    (isset($body['member_id']) ? (int)$body['member_id'] : null);

if (!$member_id && isset($_GET['member_id'])) {
    $member_id = (int)$_GET['member_id'];
}

if (!$member_id) {
    http_response_code(400);
    echo json_encode(['error' => 'member_id is required']);
    exit;
}

try {
    $sql = "
        SELECT
            member_id,
            first_name,
            last_name,
            username,
            email,
            phone,
            tier,
            join_date
        FROM member
        WHERE member_id = ?
        LIMIT 1
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('i', $member_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Member not found']);
        $stmt->close();
        exit;
    }

    $row = $res->fetch_assoc();
    $stmt->close();

    // Normalize output
    $out = [
        'member_id'         => (int)($row['member_id'] ?? 0),
        'first_name'        => $row['first_name']        ?? '',
        'last_name'         => $row['last_name']         ?? '',
        'username'          => $row['username']          ?? '',
        'email'             => $row['email']             ?? '',
        'phone'             => $row['phone']             ?? '',
        'tier'              => $row['tier']              ?? 'SILVER',
        'join_date'         => ''
    ];

    if (!empty($row['join_date'])) {
        $ts = strtotime($row['join_date']);
        if ($ts !== false) {
            $out['join_date'] = date('Y-m-d', $ts);
        }
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
}