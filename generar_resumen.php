<?php
include 'db/config.php';

$periodo = $_GET['periodo'] ?? 'semanal';
$interval = $periodo === 'mensual' ? '1 MONTH' : '1 WEEK';

$query = "SELECT COUNT(*) as total_pedidos, SUM(cantidad) as total_cantidad FROM pedidos WHERE fecha >= NOW() - INTERVAL 1 $interval";
$result = $conn->query($query);
$data = $result->fetch_assoc();

echo json_encode([
    'periodo' => $periodo,
    'total_pedidos' => $data['total_pedidos'],
    'total_cantidad' => $data['total_cantidad']
]);
?>