<?php
$servidor = "sqlserver,1433";
$baseDatos = "UniService";
$usuario = "sa";
$password = "Uniservicio58414555";

$conexion = sqlsrv_connect($servidor, [
    "Database" => $baseDatos,
    "UID"      => $usuario,
    "PWD"      => $password,
    "CharacterSet" => "UTF-8",
    "TrustServerCertificate" => true,
    "QuotedId" => true
]);

if (!$conexion) {
    http_response_code(500); // Dile a React que algo salió mal en el server
    echo json_encode([
        "error" => "Error de conexión a la base de datos",
        "detalles" => sqlsrv_errors()
    ]);
    exit; // Usa exit en lugar de die
}
?>