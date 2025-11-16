<?php

function getUserRoleFromDB($conn, $memberId) {
    $sql = "SELECT role FROM member WHERE member_id=? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $memberId);
    $stmt->execute();
    $role = $stmt->get_result()->fetch_assoc()['role'] ?? null;
    $stmt->close();
    return strtolower($role);
}

function requireAdmin($conn, $memberId) {
    $role = getUserRoleFromDB($conn, $memberId);
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access denied: Admins only."
        ]);
        exit;
    }
}

function requireAdminOrDev($conn, $memberId) {
    $role = getUserRoleFromDB($conn, $memberId);
    if (!in_array($role, ['admin', 'developer'])) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access denied: Admin or Developer only."
        ]);
        exit;
    }
}
