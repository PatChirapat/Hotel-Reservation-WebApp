<?php

function logActivity($conn, $actorId, $action, $details) {
    $sql = "INSERT INTO activity_log (actor_id, action_type, details)
            VALUES (?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iss", $actorId, $action, $details);
    $stmt->execute();
    $stmt->close();
}

function getUserRole($conn, $memberId) {
    $sql = "SELECT role FROM member WHERE member_id=? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $memberId);
    $stmt->execute();
    $role = $stmt->get_result()->fetch_assoc()['role'] ?? null;
    $stmt->close();
    return strtolower($role);
}
