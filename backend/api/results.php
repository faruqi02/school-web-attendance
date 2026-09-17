<?php
require_once '../config.php';
$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $academic_year_id = $_GET['academic_year_id'] ?? null;
    $student_id = $_GET['student_id'] ?? null;

    $sql = "SELECT r.*, s.name as student_name, s.ic_number 
            FROM results r 
            JOIN students s ON r.student_id = s.id 
            WHERE 1=1";
    $params = [];

    if ($academic_year_id) {
        $sql .= " AND r.academic_year_id = ?";
        $params[] = $academic_year_id;
    }
    if ($student_id) {
        $sql .= " AND r.student_id = ?";
        $params[] = $student_id;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    echo json_encode($results);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($user['role'] !== 'Teacher' && $user['role'] !== 'Administrator') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $student_id = $data['student_id'] ?? null;
    $academic_year_id = $data['academic_year_id'] ?? null;
    $subject_name = $data['subject_name'] ?? '';
    $marks = $data['marks'] ?? null;
    $grade = $data['grade'] ?? '';
    $exam_period = $data['exam_period'] ?? '';

    if (!$student_id || !$academic_year_id || !$subject_name || $marks === null || !$grade || !$exam_period) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO results (student_id, academic_year_id, subject_name, marks, grade, exam_period) 
                               VALUES (?, ?, ?, ?, ?, ?) 
                               ON DUPLICATE KEY UPDATE marks=?, grade=?");
        $stmt->execute([
            $student_id, $academic_year_id, $subject_name, $marks, $grade, $exam_period,
            $marks, $grade
        ]);
        echo json_encode(['message' => 'Result saved successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save result: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
}
?>

