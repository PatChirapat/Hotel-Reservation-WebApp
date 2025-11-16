<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
error_reporting(0);

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../api/utils/authorize.php';
require_once __DIR__ . '/../api/utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);
$request_user_id = intval($data['request_user_id'] ?? 0);

requireAdmin($conn, $request_user_id);

$first    = trim($data['first_name'] ?? '');
$last     = trim($data['last_name'] ?? '');
$phone    = trim($data['phone'] ?? '');
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');
$email    = trim($data['email'] ?? null);
$role     = strtolower(trim($data['role'] ?? 'user'));

if (!$first || !$last || !$phone || !$username || !$password) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

# ---------------------------
# CHECK duplicate username
# ---------------------------
$stmt = $conn->prepare("SELECT member_id FROM member WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username already exists"]);
    exit;
}
$stmt->close();

# ---------------------------
# CHECK duplicate email (ถ้าไม่ว่าง)
# ---------------------------
if ($email !== null && $email !== "") {
    $stmt = $conn->prepare("SELECT member_id FROM member WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already exists"]);
        exit;
    }
    $stmt->close();
} else {
    $email = NULL;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO member (first_name,last_name,phone,username,password_hash,email,role)
        VALUES (?,?,?,?,?,?,?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $first, $last, $phone, $username, $hash, $email, $role);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => $stmt->error]);
    exit;
}

$newId = $stmt->insert_id;
$stmt->close();

logActivity(
    $conn, 
    $request_user_id, 
    "ADMIN_ADD_USER", 
    "Admin{$request_user_id}: Added user $newId");

echo json_encode([
    "success" => true,
    "message" => "User added",
    "member_id" => $newId
]);
