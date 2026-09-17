<?php
require_once '../config.php';
$user = authenticate();

// Dummy stats for now, you can improve this with real queries if needed
echo json_encode([
    'present' => 150,
    'absent' => 10,
    'late' => 5,
    'total_students' => 165
]);
?>

