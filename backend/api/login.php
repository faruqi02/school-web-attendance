<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Check if it's a parent login (IC number only)
if (isset($data['ic_number'])) {
    // Sanitize: strip dashes and spaces
    $ic_number = preg_replace('/[^a-zA-Z0-9]/', '', $data['ic_number']);

    if (empty($ic_number)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please provide a valid IC/MyKid Number.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM students WHERE ic_number = ?");
    $stmt->execute([$ic_number]);
    $student = $stmt->fetch();

    if ($student) {
        $payload = [
            'id' => $student['id'],
            'username' => $student['name'],
            'role' => 'Parent',
            'ic_number' => $ic_number
        ];
        $token = jwt_encode($payload);
        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'role' => 'Parent',
            'username' => $student['name'],
            'student_id' => $student['id']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Student IC/MyKid not found in the system.']);
    }
} else {
    // Admin / Teacher login
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please supply username and password.']);
        exit;
    }

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
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password.']);
    }
}
?>

