<?php
include '../db/config.php';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=pedidos.csv');

// BOM para UTF-8 (compatible con Excel)
echo "\xEF\xBB\xBF";

$output = fopen('php://output', 'w');

// Encabezados (usamos ; como separador para compatibilidad con Excel local)
fputcsv($output, ['ID', 'Productos', 'Cantidad', 'Región', 'Comuna', 'Fecha', 'Estado'], ';');

// Solo exportar pedidos vendidos
$result = $conn->query("SELECT * FROM pedidos WHERE estado = 'vendido' ORDER BY fecha DESC");

while ($row = $result->fetch_assoc()) {
    fputcsv($output, [
        $row['id'],
        $row['productos'],
        $row['cantidad'],
        $row['region'],
        $row['comuna'],
        $row['fecha'],
        ucfirst($row['estado'])
    ], ';'); // usamos ; como separador
}

fclose($output);
exit;
?>