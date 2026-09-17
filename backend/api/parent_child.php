<?php
require_once '../config.php';
$user = authenticate();

if ($user['role'] !== 'Parent') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $student_id = $user['id']; // From JWT payload for parent
    $academic_year_id = $_GET['academic_year_id'] ?? null;

    // Get student details
    $sql = "SELECT s.*, c.class_name 
            FROM students s 
            LEFT JOIN class_enrollments ce ON s.id = ce.student_id ";
    if ($academic_year_id) {
        $sql .= " AND ce.academic_year_id = ? ";
    }
    $sql .= " LEFT JOIN classes c ON ce.class_id = c.id WHERE s.id = ?";
    
    $params = [];
    if ($academic_year_id) {
        $params[] = $academic_year_id;
    }
    $params[] = $student_id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $student = $stmt->fetch();

    if (!$student) {
        // If not enrolled in this specific year, just get base details
        $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch();
    }

    // Get attendance
    $attSql = "SELECT * FROM attendance WHERE student_id = ?";
    $attParams = [$student_id];
    if ($academic_year_id) {
        $attSql .= " AND academic_year_id = ?";
        $attParams[] = $academic_year_id;
    }
    $attSql .= " ORDER BY date DESC";
    $stmt = $pdo->prepare($attSql);
    $stmt->execute($attParams);
    $attendance = $stmt->fetchAll();

    // Get results
    $resSql = "SELECT * FROM results WHERE student_id = ?";
    $resParams = [$student_id];
    if ($academic_year_id) {
        $resSql .= " AND academic_year_id = ?";
        $resParams[] = $academic_year_id;
    }
    $stmt = $pdo->prepare($resSql);
    $stmt->execute($resParams);
    $results = $stmt->fetchAll();

    echo json_encode([
        'student' => $student,
        'attendance' => $attendance,
        'results' => $results
    ]);

} else {
    http_response_code(405);
}
?>

