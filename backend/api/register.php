<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

if (empty($username) || empty($password) || empty($role)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please supply username, password and role.']);
    exit;
}

if ($role === 'Parent') {
    http_response_code(400);
    echo json_encode(['error' => 'Parents do not register accounts. They log in with IC Number.']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hash, $role]);
    echo json_encode(['message' => 'User registered successfully!', 'userId' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate username)
        http_response_code(400);
        echo json_encode(['error' => 'Username already exists.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}
?>

