<?php
/**
 * backend/api/auth/signup.php
 * Signup endpoint — readable version (CORS → DB → read → validate → unique → insert → respond)
 */

// -----------------------------------------------------------------------------
// CORS (must be first) — handled via shared config
// -----------------------------------------------------------------------------
require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Always JSON responses
header('Content-Type: application/json; charset=utf-8');

// Dev only — show PHP errors (remove/disable on production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// -----------------------------------------------------------------------------
// DB connect (shared config provides $conn with utf8mb4)
// -----------------------------------------------------------------------------
require_once __DIR__ . '/../../config/db_connect.php';

// -----------------------------------------------------------------------------
// Read input (JSON or x-www-form-urlencoded)
// -----------------------------------------------------------------------------
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$first = trim($data['first_name'] ?? '');
$last  = trim($data['last_name']  ?? '');
$phone = trim($data['phone']      ?? '');
$user  = trim($data['username']   ?? '');
$pass  = (string)($data['password'] ?? '');
$email = trim($data['email']      ?? '');

// -----------------------------------------------------------------------------
// Validate input
// -----------------------------------------------------------------------------
$errors = [];
if ($first === '') { $errors[] = 'first_name is required'; }
if ($last  === '') { $errors[] = 'last_name is required'; }
if ($phone === '') { $errors[] = 'phone is required'; }
if ($user  === '') { $errors[] = 'username is required'; }
if (strlen($pass) < 6) { $errors[] = 'password must be at least 6 characters'; }
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'email format is invalid'; }

if ($errors) {
  http_response_code(400);
  echo json_encode([ 'success' => false, 'errors' => $errors ], JSON_UNESCAPED_UNICODE);
  $conn->close();
  exit;
}

// -----------------------------------------------------------------------------
// Uniqueness checks
// -----------------------------------------------------------------------------
$exists = function(string $col, string $val) use ($conn): bool {
  $sql = "SELECT 1 FROM member WHERE $col = ? LIMIT 1";
  $s = $conn->prepare($sql);
  $s->bind_param('s', $val);
  $s->execute();
  $s->store_result();
  $found = $s->num_rows > 0;
  $s->close();
  return $found;
};

if ($exists('username', $user)) { http_response_code(409); echo json_encode([ 'success'=>false, 'error'=>'username already exists' ]); $conn->close(); exit; }
if ($exists('phone',    $phone)) { http_response_code(409); echo json_encode([ 'success'=>false, 'error'=>'phone already exists' ]);   $conn->close(); exit; }
if ($email !== '' && $exists('email', $email)) { http_response_code(409); echo json_encode([ 'success'=>false, 'error'=>'email already exists' ]); $conn->close(); exit; }

// -----------------------------------------------------------------------------
// Insert new member
// -----------------------------------------------------------------------------
$hash = password_hash($pass, PASSWORD_DEFAULT);
$emailOrNull = ($email === '') ? null : $email;

$ins = $conn->prepare('INSERT INTO member (first_name, last_name, phone, username, password_hash, email) VALUES (?,?,?,?,?,?)');
$ins->bind_param('ssssss', $first, $last, $phone, $user, $hash, $emailOrNull);
$ok = $ins->execute();
if (!$ok) {
  http_response_code(500);
  echo json_encode([ 'success'=>false, 'error' => 'insert failed: '.$conn->error ]);
  $ins->close();
  $conn->close();
  exit;
}

$newId = $ins->insert_id;
$ins->close();
$conn->close();

// -----------------------------------------------------------------------------
// Respond success
// -----------------------------------------------------------------------------
echo json_encode([ 'success'=>true, 'member_id'=>$newId, 'username'=>$user ], JSON_UNESCAPED_UNICODE);