<?php
// backend/config.php

// CORS headers for local development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'school_attendance';
$username = 'root';
$password = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

define('JWT_SECRET', 'attendance_result_super_secret_token_key_123');

// Simple JWT encode function
function jwt_encode($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Simple JWT decode function
function jwt_decode($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    
    list($header64, $payload64, $signature64) = $parts;
    
    $signature = str_replace(['-', '_'], ['+', '/'], $signature64);
    // Pad to multiple of 4
    if(strlen($signature) % 4) {
        $signature .= str_repeat('=', 4 - strlen($signature) % 4);
    }
    $signature = base64_decode($signature);
    
    $validSignature = hash_hmac('sha256', $header64 . "." . $payload64, JWT_SECRET, true);
    
    if (hash_equals($validSignature, $signature)) {
        $payload = str_replace(['-', '_'], ['+', '/'], $payload64);
        if(strlen($payload) % 4) {
            $payload .= str_repeat('=', 4 - strlen($payload) % 4);
        }
        return json_decode(base64_decode($payload), true);
    }
    return false;
}

// Helper to authenticate request
function authenticate() {
    $headers = null;
    if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if ($headers === null && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif ($headers === null && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }

    if (!$headers) {
        http_response_code(401);
        echo json_encode(['error' => 'Access token required']);
        exit;
    }
    
    $parts = explode(' ', $headers);
    if (count($parts) < 2) {
        http_response_code(401);
        echo json_encode(['error' => 'Access token format invalid']);
        exit;
    }
    $token = $parts[1];
    $decoded = jwt_decode($token);
    if (!$decoded) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $decoded;
}
?>

