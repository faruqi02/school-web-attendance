<?php
require_once '../config.php';
$user = authenticate();

// Fetch schedules
$stmt = $pdo->query("SELECT * FROM academic_schedules");
$schedules = $stmt->fetchAll();

echo json_encode($schedules);
?>

