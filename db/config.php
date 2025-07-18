<?php
$host = 'localhost';
$db = 'cdo103326_catalogo';
$user = 'cdo103326_usuario_web';
$pass = 'rywmi9-kaktun-mivwIz';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
$conn->set_charset("utf8");
?>