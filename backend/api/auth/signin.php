<?php
require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../config/db_connect.php';

// Read input
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$identifier = trim($data['identifier'] ?? '');
$password   = (string)($data['password'] ?? '');

if ($identifier === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing identifier or password']);
  exit;
}

// Query user
$sql = "SELECT member_id, first_name, last_name, phone, email, username, password_hash, tier, join_date, role
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
  echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
  exit;
}

if (!password_verify($password, $user['password_hash'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
  exit;
}

// ⭐ Use role from DB directly
$role = strtoupper($user['role'] ?? 'USER');

// Response
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
  'role'       => $role,
];

echo json_encode($out, JSON_UNESCAPED_UNICODE);
$conn->close();
