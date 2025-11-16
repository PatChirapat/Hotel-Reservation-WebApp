<?php
/**
 * backend/api/logs/getLogs.php
 * Admin + Developer only
 */

require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../config/db_connect.php';
require_once __DIR__ . '/../../utils/auth.php';

// -------------------------------------------------------
// GET member_id from query (frontend will pass it)
// -------------------------------------------------------
$memberId = isset($_GET['member_id']) ? intval($_GET['member_id']) : 0;

if (!$memberId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "member_id is required"]);
    exit;
}

// -------------------------------------------------------
// Only admin + developer allowed
// -------------------------------------------------------
requireRole($conn, $memberId, ['admin', 'developer']);

// -------------------------------------------------------
// Query logs (latest 200)
// -------------------------------------------------------
$sql = "SELECT 
            l.id,
            l.user_id,
            m.username,
            l.action,
            l.detail,
            l.created_at
        FROM log_activity l
        LEFT JOIN member m ON m.member_id = l.user_id
        ORDER BY l.created_at DESC
        LIMIT 200";

$res = $conn->query($sql);

$logs = [];
while ($row = $res->fetch_assoc()) {
    $logs[] = $row;
}

// -------------------------------------------------------
// Response
// -------------------------------------------------------
echo json_encode([
    "success" => true,
    "logs"    => $logs
], JSON_UNESCAPED_UNICODE);

