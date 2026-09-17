<?php
require_once '../config.php';
$user = authenticate(); // Validates JWT

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Determine if requesting a single student's details (Parent view) or all students (Admin/Teacher view)
    $academic_year_id = $_GET['academic_year_id'] ?? null;
    $student_id = $_GET['student_id'] ?? null;

    if ($student_id) {
        $sql = "SELECT s.*, c.class_name, ce.academic_year_id 
                FROM students s 
                LEFT JOIN class_enrollments ce ON s.id = ce.student_id 
                LEFT JOIN classes c ON ce.class_id = c.id
                WHERE s.id = ?";
        $params = [$student_id];
        if ($academic_year_id) {
            $sql .= " AND ce.academic_year_id = ?";
            $params[] = $academic_year_id;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $student = $stmt->fetch();
        echo json_encode($student);
    } else {
        // List all students
        $sql = "SELECT s.*, c.class_name, ce.academic_year_id 
                FROM students s 
                LEFT JOIN class_enrollments ce ON s.id = ce.student_id 
                LEFT JOIN classes c ON ce.class_id = c.id";
        $params = [];
        if ($academic_year_id) {
            $sql .= " WHERE ce.academic_year_id = ?";
            $params[] = $academic_year_id;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $students = $stmt->fetchAll();
        echo json_encode($students);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($user['role'] !== 'Administrator') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"), true);
    $ic_number = preg_replace('/[^a-zA-Z0-9]/', '', $data['ic_number'] ?? '');
    $name = $data['name'] ?? '';
    $class_id = $data['class_id'] ?? null;
    $academic_year_id = $data['academic_year_id'] ?? null;
    
    if (!$ic_number || !$name || !$class_id || !$academic_year_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        
        // Insert or update student
        $stmt = $pdo->prepare("INSERT INTO students (ic_number, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=?");
        $stmt->execute([$ic_number, $name, $name]);
        
        $stmt = $pdo->prepare("SELECT id FROM students WHERE ic_number = ?");
        $stmt->execute([$ic_number]);
        $student = $stmt->fetch();
        $student_id = $student['id'];
        
        // Insert class enrollment
        $stmt = $pdo->prepare("INSERT INTO class_enrollments (student_id, class_id, academic_year_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE class_id=?");
        $stmt->execute([$student_id, $class_id, $academic_year_id, $class_id]);
        
        $pdo->commit();
        echo json_encode(['message' => 'Student added/updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
}
?>

