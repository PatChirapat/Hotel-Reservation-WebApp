<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$member_id = isset($input['member_id']) ? (int)$input['member_id'] : 0;
$booking_id = isset($input['booking_id']) && $input['booking_id'] !== '' ? (int)$input['booking_id'] : null;
$room_type_id = isset($input['room_type_id']) && $input['room_type_id'] !== '' ? (int)$input['room_type_id'] : null;
$rating = isset($input['rating']) ? (int)$input['rating'] : 0;
$text = trim((string)($input['text'] ?? ''));

if ($member_id <= 0 || $rating < 1 || $rating > 5 || mb_strlen($text) < 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

require_once __DIR__ . '/../config/db_connect.php';

try {
    if ($booking_id !== null) {
        $checkSql = "SELECT room_type_id FROM booking WHERE booking_id = ? AND member_id = ? LIMIT 1";
        $checkStmt = $conn->prepare($checkSql);
        if (!$checkStmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $checkStmt->bind_param('ii', $booking_id, $member_id);
        $checkStmt->execute();
        $checkRes = $checkStmt->get_result();
        $bookingRow = $checkRes->fetch_assoc();
        $checkStmt->close();

        if (!$bookingRow) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Booking not found for this user']);
            $conn->close();
            exit;
        }

        if ($room_type_id === null && isset($bookingRow['room_type_id'])) {
            $room_type_id = (int)$bookingRow['room_type_id'];
        }

        $dupSql = "SELECT review_id FROM review WHERE booking_id = ? AND member_id = ? LIMIT 1";
        $dupStmt = $conn->prepare($dupSql);
        if ($dupStmt) {
            $dupStmt->bind_param('ii', $booking_id, $member_id);
            $dupStmt->execute();
            $dupRes = $dupStmt->get_result();
            if ($dupRes && $dupRes->fetch_assoc()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'You already reviewed this booking']);
                $dupStmt->close();
                $conn->close();
                exit;
            }
            $dupStmt->close();
        }
    }

    $insertSql = "INSERT INTO review (member_id, booking_id, room_type_id, rating, `text`) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertSql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('iiiis', $member_id, $booking_id, $room_type_id, $rating, $text);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    $outRow = null;
    $fetchSql = "SELECT
                    r.review_id,
                    r.member_id,
                    r.booking_id,
                    r.room_type_id,
                    r.rating,
                    r.text,
                    r.created_at,
                    m.first_name AS member_first_name,
                    m.last_name AS member_last_name,
                    m.tier AS member_tier,
                    m.username AS member_username,
                    rt.name AS room_type_name
                FROM review r
                LEFT JOIN member m ON r.member_id = m.member_id
                LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
                WHERE r.review_id = ?
                LIMIT 1";
    $fetchStmt = $conn->prepare($fetchSql);
    if ($fetchStmt) {
        $fetchStmt->bind_param('i', $newId);
        $fetchStmt->execute();
        $fetchRes = $fetchStmt->get_result();
        if ($row = $fetchRes->fetch_assoc()) {
            $memberName = trim(($row['member_first_name'] ?? '') . ' ' . ($row['member_last_name'] ?? ''));
            $outRow = [
                'review_id' => (int)$row['review_id'],
                'member_id' => $row['member_id'] !== null ? (int)$row['member_id'] : null,
                'booking_id' => $row['booking_id'] !== null ? (int)$row['booking_id'] : null,
                'room_type_id' => $row['room_type_id'] !== null ? (int)$row['room_type_id'] : null,
                'rating' => (int)$row['rating'],
                'text' => $row['text'],
                'created_at' => $row['created_at'],
                'member_name' => $memberName !== '' ? $memberName : null,
                'member' => [
                    'first_name' => $row['member_first_name'],
                    'last_name' => $row['member_last_name'],
                    'tier' => $row['member_tier'],
                    'username' => $row['member_username'],
                ],
                'tier' => $row['member_tier'],
                'room_type_name' => $row['room_type_name'],
            ];
        }
        $fetchStmt->close();
    }

    $conn->close();

    echo json_encode([
        'success' => true,
        'review_id' => $newId,
        'review' => $outRow,
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to save review',
        'detail' => $e->getMessage(),
    ]);
}
