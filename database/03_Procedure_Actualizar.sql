--------------------SCRIPT PROCEDURES ACTUALIZAR------------------------------
USE UniService;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Eliminar si existe
IF OBJECT_ID('sp_ActualizarUsuario', 'P') IS NOT NULL
    DROP PROCEDURE sp_ActualizarUsuario;
GO

-- Crear procedimiento
CREATE PROCEDURE sp_ActualizarUsuario
    @id_usuario INT,
    @telefono NVARCHAR(13) = NULL,
    @password_hash NVARCHAR(255) = NULL,
    @nombre NVARCHAR(50) = NULL,
    @descripcion NVARCHAR(MAX) = NULL,
    @correo NVARCHAR(100) = NULL,
    @estado BIT = NULL,
    @bloqueado BIT = NULL,
    @universidad NVARCHAR(50) = NULL,
    @avatar NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET QUOTED_IDENTIFIER ON;
    SET ANSI_NULLS ON;
    SET ANSI_PADDING ON;
    SET ANSI_WARNINGS ON;
    SET ARITHABORT ON;
    SET CONCAT_NULL_YIELDS_NULL ON;
    SET NUMERIC_ROUNDABORT OFF;
    -- Validar si el usuario existe antes de intentar actualizar
    IF NOT EXISTS (SELECT 1
    FROM usuarios
    WHERE id_usuario = @id_usuario)
    BEGIN
        RAISERROR ('El usuario con el ID proporcionado no existe.', 16, 1);
        RETURN;
    END

    -- Validar duplicidad de correo solo si se está intentando cambiar
    IF @correo IS NOT NULL AND EXISTS (SELECT 1
        FROM usuarios
        WHERE correo = @correo AND id_usuario <> @id_usuario)
    BEGIN
        RAISERROR ('El nuevo correo electrónico ya está registrado por otro usuario.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        UPDATE usuarios
        SET 
            telefono      = COALESCE(@telefono, telefono),
            password_hash = COALESCE(@password_hash, password_hash),
            nombre        = COALESCE(@nombre, nombre),
            descripcion   = COALESCE(@descripcion, descripcion),
            correo        = COALESCE(@correo, correo),
            estado        = COALESCE(@estado, estado),
            bloqueado     = COALESCE(@bloqueado, bloqueado),
            universidad   = COALESCE(@universidad, universidad),
            avatar        = COALESCE(@avatar, avatar)
        WHERE id_usuario = @id_usuario;

        IF @@ROWCOUNT = 0
        BEGIN
        RAISERROR ('No se pudo actualizar el usuario. Verifique los datos proporcionados.', 16, 1);
    END
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;
GO