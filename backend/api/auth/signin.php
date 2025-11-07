<?php
/**
 * backend/api/auth/signin.php
 * signin endpoint — readable version (uses shared CORS + DB configs)
 * Flow: CORS → JSON → read → validate → query → verify → respond
 */

// -----------------------------------------------------------------------------
// CORS (must be first) — handled via shared config
// -----------------------------------------------------------------------------
require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Always JSON response
header('Content-Type: application/json; charset=utf-8');

// Dev only — show PHP errors (remove/disable on production as needed)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// -----------------------------------------------------------------------------
// DB connect (shared config provides $conn with utf8mb4)
// -----------------------------------------------------------------------------
require_once __DIR__ . '/../../config/db_connect.php';

// -----------------------------------------------------------------------------
// Read & validate input
// -----------------------------------------------------------------------------
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$identifier = trim($data['identifier'] ?? ''); // username OR phone OR email
$password   = (string)($data['password'] ?? '');

$errors = [];
if ($identifier === '') { $errors[] = 'identifier is required'; }
if ($password   === '') { $errors[] = 'password is required'; }

if ($errors) {
  http_response_code(400);
  echo json_encode([ 'success' => false, 'errors' => $errors ], JSON_UNESCAPED_UNICODE);
  $conn->close();
  exit;
}

// -----------------------------------------------------------------------------
// Find user by username/phone/email
// -----------------------------------------------------------------------------
$sql = "SELECT member_id, first_name, last_name, phone, email, username, password_hash, tier, join_date
        FROM member
        WHERE username = ? OR phone = ? OR email = ?
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sss', $identifier, $identifier, $identifier);
$stmt->execute();
$res  = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

if (!$user) {
  http_response_code(401);
  echo json_encode([ 'success' => false, 'error' => 'invalid credentials' ]);
  $conn->close();
  exit;
}

// -----------------------------------------------------------------------------
// Verify password
// -----------------------------------------------------------------------------
if (!password_verify($password, $user['password_hash'])) {
  http_response_code(401);
  echo json_encode([ 'success' => false, 'error' => 'invalid credentials' ]);
  $conn->close();
  exit;
}

// -----------------------------------------------------------------------------
// Respond
// -----------------------------------------------------------------------------
$out = [
  'success'    => true,
  'member_id'  => (int)$user['member_id'],
  'username'   => $user['username'],
  'first_name' => $user['first_name'],
  'last_name'  => $user['last_name'],
  'phone'      => $user['phone'],
  'email'      => $user['email'],
  'tier'       => $user['tier'],
  'join_date'  => $user['join_date'],
];

$conn->close();
echo json_encode($out, JSON_UNESCAPED_UNICODE);