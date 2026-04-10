CREATE OR ALTER PROCEDURE sp_ObtenerUsuarioPorId
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificamos si el usuario existe para dar una respuesta clara
    IF EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = @id_usuario)
    BEGIN
        SELECT 
            id_usuario,
            telefono,
            password_hash,
            nombre,
            descripcion,
            correo,
            estado,
            fecha_registro,
            universidad,
            avatar
        FROM usuarios
        WHERE id_usuario = @id_usuario;
    END
    ELSE
    BEGIN
        RAISERROR ('Usuario no encontrado.', 16, 1);
    END
END;