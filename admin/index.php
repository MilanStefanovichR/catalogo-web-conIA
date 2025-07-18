<?php
header('Content-Type: text/html; charset=utf-8');
include '../db/config.php';

// Actualizar estado si se envía por POST
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'], $_POST['estado'])) {
    $id = (int)$_POST['id'];
    $estado = $_POST['estado'];
    $stmt = $conn->prepare("UPDATE pedidos SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $estado, $id);
    $stmt->execute();
    $stmt->close();
}

// Obtener pedidos
$result = $conn->query("SELECT * FROM pedidos ORDER BY fecha DESC");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pedidos Recibidos</title>
    <style>
        table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
        th, td { border: 1px solid #aaa; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        td.productos { white-space: pre-wrap; max-width: 400px; }
        .estado span { font-weight: bold; }
        .estado-pendiente { color: orange; }
        .estado-vendido { color: green; }
        .estado-descartado { color: red; }
        form.estado-form { display: inline; margin-right: 5px; }
        .boton-estado { padding: 4px 8px; font-size: 12px; }
        a.exportar { display: inline-block; margin: 15px 0; padding: 8px 12px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
        a.exportar:hover { background-color: #218838; }
    </style>
</head>
<body>
    <h1>Pedidos Recibidos</h1>
    <a class="exportar" href="exportar_csv.php">Exportar CSV</a>
    <table>
        <tr>
            <th>ID</th>
            <th>Productos</th>
            <th>Cantidad</th>
            <th>Región</th>
            <th>Comuna</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
        <?php while($row = $result->fetch_assoc()): ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td class="productos"><?= htmlspecialchars($row['productos']) ?></td>
            <td><?= $row['cantidad'] ?></td>
            <td><?= $row['region'] ?></td>
            <td><?= $row['comuna'] ?></td>
            <td><?= $row['fecha'] ?></td>
            <td class="estado">
                <span class="estado-<?= $row['estado'] ?>"><?= ucfirst($row['estado']) ?></span>
            </td>
            <td>
                <form class="estado-form" method="POST">
                    <input type="hidden" name="id" value="<?= $row['id'] ?>">
                    <input type="hidden" name="estado" value="vendido">
                    <button class="boton-estado" type="submit">Vendido</button>
                </form>
                <form class="estado-form" method="POST">
                    <input type="hidden" name="id" value="<?= $row['id'] ?>">
                    <input type="hidden" name="estado" value="descartado">
                    <button class="boton-estado" type="submit">Descartar</button>
                </form>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>
</body>
</html>
