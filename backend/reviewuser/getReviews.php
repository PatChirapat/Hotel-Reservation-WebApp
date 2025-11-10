<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db_connect.php';

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$limit = max(1, min($limit, 50));
$offset = max(0, $offset);

try {
    $meta = ['total' => 0, 'avg_rating' => 0];
    $metaSql = "SELECT COUNT(*) AS total, IFNULL(AVG(rating), 0) AS avg_rating FROM review";
    if ($result = $conn->query($metaSql)) {
        $metaRow = $result->fetch_assoc();
        if ($metaRow) {
            $meta['total'] = (int)$metaRow['total'];
            $meta['avg_rating'] = (float)$metaRow['avg_rating'];
        }
        $result->close();
    }

    $sql = "SELECT
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
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('ii', $limit, $offset);
    $stmt->execute();
    $res = $stmt->get_result();

    $rows = [];
    while ($row = $res->fetch_assoc()) {
        $memberName = trim(($row['member_first_name'] ?? '') . ' ' . ($row['member_last_name'] ?? ''));
        $rows[] = [
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

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'rows' => $rows,
        'total' => $meta['total'],
        'avg' => $meta['avg_rating'],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to fetch reviews',
        'detail' => $e->getMessage(),
    ]);
}
