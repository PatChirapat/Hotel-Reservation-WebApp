<?php
$allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin) {
    if (in_array($origin, $allowed_origins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } elseif (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i', $origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// ถ้าเป็น preflight (OPTIONS) ให้จบการทำงานทันที
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
?>