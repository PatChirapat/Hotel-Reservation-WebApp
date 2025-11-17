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

function requireUser($conn, $memberId) {
    if (!$memberId || $memberId <= 0) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized: No member id"
        ]);
        exit;
    }

    // เช็คว่า user มีจริง
    $sql = "SELECT member_id FROM member WHERE member_id=? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $memberId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized user"
        ]);
        exit;
    }
}

function requireOwner($ownerId, $loggedId) {
    if ($ownerId != $loggedId) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "You cannot modify others' booking"
        ]);
        exit;
    }
}

function requireDeveloper($conn, $member_id) {
    $stmt = $conn->prepare("SELECT role FROM member WHERE member_id=?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $role = $stmt->get_result()->fetch_assoc()['role'] ?? null;

    if ($role !== "developer") {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Developer only"]);
        exit;
    }
}

