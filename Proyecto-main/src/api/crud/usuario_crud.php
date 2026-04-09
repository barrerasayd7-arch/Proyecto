<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include "../config/conexion.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "POST") {
    $datos = json_decode(file_get_contents("php://input"), true);

    $telefono      = $datos["telefono"];
    $nombre        = $datos["nombre"];
    $password_hash = password_hash($datos["password"], PASSWORD_BCRYPT);
    $correo        = isset($datos["correo"]) ? $datos["correo"] : null;
    $universidad   = isset($datos["universidad"]) ? $datos["universidad"] : 1;

    $query = "EXEC sp_CrearUsuario @telefono=?, @password_hash=?, @nombre=?, @correo=?, @universidad=?";
    $params = [$telefono, $password_hash, $nombre, $correo, $universidad];

    $resultado = sqlsrv_query($conexion, $query, $params);

    if ($resultado === false) {
        $errores = sqlsrv_errors();
        // Capturar mensaje del RAISERROR del procedure
        $mensaje = $errores[0]["message"] ?? "Error al crear el usuario";
        echo json_encode(["error" => $mensaje]);
    } else {
        echo json_encode(["mensaje" => "Cuenta creada exitosamente"]);
    }

    sqlsrv_close($conexion);
}
?>