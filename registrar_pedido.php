<?php
include 'db/config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $productos = $_POST['productos'] ?? '';
    $cantidad = $_POST['cantidad'] ?? 0;
    $region = $_POST['region'] ?? '';
    $comuna = $_POST['comuna'] ?? '';

    if (!empty($productos) && !empty($cantidad) && !empty($region) && !empty($comuna)) {
        $stmt = $conn->prepare("INSERT INTO pedidos (productos, cantidad, region, comuna) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("siss", $productos, $cantidad, $region, $comuna);
        $stmt->execute();
        $stmt->close();
        echo "Pedido registrado correctamente.";
    } else {
        echo "Faltan datos del pedido.";
    }
}
?>