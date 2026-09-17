<?php
// backend/test_login.php
require_once 'config.php';
$username = 'admin';
$password = 'password';

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $payload = [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role']
    ];
    $token = jwt_encode($payload);
    echo json_encode([
        'message' => 'Login successful',
        'token' => $token,
        'role' => $user['role'],
        'username' => $user['username']
    ]);
} else {
    echo "Fail";
}
?>

