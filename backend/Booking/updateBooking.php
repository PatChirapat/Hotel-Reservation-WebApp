<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db_connect.php';

// Get JSON body
$data = json_decode(file_get_contents("php://input"), true);

// --- Action: confirmPayment (upsert Success, set booking Confirmed) ---
if (isset($data['action']) && $data['action'] === 'confirmPayment') {
    $booking_ids = [];
    if (isset($data['booking_id'])) { $booking_ids[] = (int)$data['booking_id']; }
    if (isset($data['booking_ids']) && is_array($data['booking_ids'])) {
        foreach ($data['booking_ids'] as $bid) { $booking_ids[] = (int)$bid; }
    }
    $booking_ids = array_values(array_unique(array_filter($booking_ids)));
    $method = (isset($data['method']) && in_array($data['method'], ['Credit','Debit','Cash','QR'], true)) ? $data['method'] : 'QR';

    if (!$booking_ids) { echo json_encode(["success"=>false,"message"=>"Missing booking_id(s)"]); $conn->close(); exit; }

    try {
        $conn->begin_transaction();

        $sel = $conn->prepare("SELECT booking_id, total_amount FROM booking WHERE booking_id=?");
        $ins = $conn->prepare("INSERT INTO payment (booking_id, amount, method, provider_txn_ref, payment_status, paid_at) VALUES (?, ?, ?, CONCAT('SIM-', UUID()), 'Success', NOW())");

        foreach ($booking_ids as $bid) {
            $sel->bind_param('i', $bid);
            if (!$sel->execute()) { throw new Exception($sel->error); }
            $res = $sel->get_result();
            $b = $res->fetch_assoc();
            if (!$b) { throw new Exception("Booking not found: ".$bid); }

            $amount = (float)$b['total_amount'];

            // Update pending → success first
            $upd = $conn->prepare("UPDATE payment SET amount=?, method=?, provider_txn_ref=CONCAT('SIM-', UUID()), payment_status='Success', paid_at=NOW() WHERE booking_id=? AND payment_status='Pending'");
            if (!$upd) { throw new Exception($conn->error); }
            $upd->bind_param('dsi', $amount, $method, $bid);
            if (!$upd->execute()) { throw new Exception($upd->error); }
            if ($upd->affected_rows === 0) {
                // No pending row existed -> insert
                $ins->bind_param('ids', $bid, $amount, $method);
                if (!$ins->execute()) { throw new Exception($ins->error); }
            }
            $upd->close();
        }

        // Set bookings to Confirmed
        $ph = implode(',', array_fill(0, count($booking_ids), '?'));
        $types = str_repeat('i', count($booking_ids));
        $up = $conn->prepare("UPDATE booking SET booking_status='Confirmed' WHERE booking_id IN ($ph)");
        $up->bind_param($types, ...$booking_ids);
        if (!$up->execute()) { throw new Exception($up->error); }
        $up->close();

        $conn->commit();
        echo json_encode(["success"=>true, "message"=>"Payment confirmed", "booking_ids"=>$booking_ids]);
    } catch (Throwable $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success"=>false,"message"=>"Payment failed","detail"=>$e->getMessage()]);
    }
    $conn->close();
    exit;
}
// --- End confirmPayment ---

// --- Action: cancelAndMarkSuccess (set booking Cancelled, mark Payment Success if Pending) ---
if (isset($data['action']) && $data['action'] === 'cancelAndMarkSuccess') {
    $booking_id = isset($data['booking_id']) ? intval($data['booking_id']) : 0;
    if ($booking_id <= 0) {
        echo json_encode(["success" => false, "message" => "Missing or invalid booking_id"]);
        $conn->close();
        exit;
    }

    try {
        $conn->begin_transaction();

        // 1) Update booking status to Cancelled
        $up1 = $conn->prepare("UPDATE booking SET booking_status='Cancelled' WHERE booking_id=?");
        if (!$up1) { throw new Exception($conn->error); }
        $up1->bind_param('i', $booking_id);
        if (!$up1->execute()) { throw new Exception($up1->error); }
        $up1->close();

        // 2) If there's a pending payment, mark it Success (do not create duplicates)
        $up2 = $conn->prepare("
            UPDATE payment
               SET payment_status='Success',
                   paid_at = IFNULL(paid_at, NOW()),
                   method = COALESCE(method, 'Cash'),
                   provider_txn_ref = COALESCE(provider_txn_ref, CONCAT('SIM-', UUID()))
             WHERE booking_id=? AND payment_status='Pending'
        ");
        if (!$up2) { throw new Exception($conn->error); }
        $up2->bind_param('i', $booking_id);
        if (!$up2->execute()) { throw new Exception($up2->error); }
        $up2->close();

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Booking cancelled and payment marked as Success if pending", "booking_id" => $booking_id]);
    } catch (Throwable $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Cancel failed", "detail" => $e->getMessage()]);
    }
    $conn->close();
    exit;
}
// --- End cancelAndMarkSuccess ---

// --- Default: dynamic update fields (legacy path) ---
if (!isset($data["booking_id"])) {
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    $conn->close();
    exit;
}

$booking_id = (int)$data["booking_id"];
$fields = [];

if (isset($data["checkin_date"])) $fields[] = "checkin_date = '" . $conn->real_escape_string($data["checkin_date"]) . "'";
if (isset($data["checkout_date"])) $fields[] = "checkout_date = '" . $conn->real_escape_string($data["checkout_date"]) . "'";
if (isset($data["guest_count"])) $fields[] = "guest_count = " . intval($data["guest_count"]);
if (isset($data["booking_status"])) $fields[] = "booking_status = '" . $conn->real_escape_string($data["booking_status"]) . "'";
if (isset($data["subtotal_amount"])) $fields[] = "subtotal_amount = " . floatval($data["subtotal_amount"]);
if (isset($data["discount_amount"])) $fields[] = "discount_amount = " . floatval($data["discount_amount"]);
if (isset($data["total_amount"])) $fields[] = "total_amount = " . floatval($data["total_amount"]);

if (empty($fields)) {
    echo json_encode(["success" => false, "message" => "No fields to update"]);
    $conn->close();
    exit;
}

$sql = "UPDATE booking SET " . implode(", ", $fields) . " WHERE booking_id = " . intval($booking_id);
if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Booking updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating booking: " . $conn->error]);
}

$conn->close();
?>
