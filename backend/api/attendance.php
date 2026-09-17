<?php
require_once '../config.php';
$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $academic_year_id = $_GET['academic_year_id'] ?? null;
    $student_id = $_GET['student_id'] ?? null;
    $class_id = $_GET['class_id'] ?? null;
    $date = $_GET['date'] ?? null;

    $sql = "SELECT a.*, s.name as student_name, s.ic_number 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            WHERE 1=1";
    $params = [];

    if ($academic_year_id) {
        $sql .= " AND a.academic_year_id = ?";
        $params[] = $academic_year_id;
    }
    if ($student_id) {
        $sql .= " AND a.student_id = ?";
        $params[] = $student_id;
    }
    if ($class_id) {
        $sql .= " AND a.class_id = ?";
        $params[] = $class_id;
    }
    if ($date) {
        $sql .= " AND a.date = ?";
        $params[] = $date;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $attendance = $stmt->fetchAll();
    echo json_encode($attendance);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($user['role'] !== 'Teacher' && $user['role'] !== 'Administrator') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    // Support batch update
    if (isset($data['records']) && is_array($data['records'])) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO attendance (student_id, class_id, academic_year_id, date, status) 
                                   VALUES (?, ?, ?, ?, ?) 
                                   ON DUPLICATE KEY UPDATE status=?");
            
            foreach ($data['records'] as $record) {
                $stmt->execute([
                    $record['student_id'], 
                    $record['class_id'], 
                    $record['academic_year_id'], 
                    $record['date'], 
                    $record['status'],
                    $record['status']
                ]);
            }
            $pdo->commit();
            echo json_encode(['message' => 'Attendance saved successfully']);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save attendance: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data format. Expected records array.']);
    }
} else {
    http_response_code(405);
}
?>

