<?php
// ping CORS-safe
$allowed = ['http://localhost:5173','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) header("Access-Control-Allow-Origin: $origin");
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header("Content-Type: application/json; charset=utf-8");
echo json_encode(["ok"=>true,"time"=>date('c')]);