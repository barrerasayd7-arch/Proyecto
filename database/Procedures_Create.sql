--------------------SCRIPT PROCEDURES CREAR------------------------------

CREATE OR ALTER PROCEDURE sp_CrearUsuario
    @telefono NVARCHAR(20),
    @password_hash NVARCHAR(255),
    @nombre NVARCHAR(50),
    @correo NVARCHAR(100) = NULL, -- El correo es opcional según tu tabla
    @universidad BIT = 1           -- Por defecto asumimos que es upecista
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validar si el teléfono ya está registrado
    IF EXISTS (SELECT 1 FROM usuarios WHERE telefono = @telefono)
    BEGIN
        RAISERROR ('Este número de teléfono ya se encuentra registrado.', 16, 1);
        RETURN;
    END

    -- 2. Validar si el correo ya está registrado (solo si se proporciona)
    IF @correo IS NOT NULL AND EXISTS (SELECT 1 FROM usuarios WHERE correo = @correo)
    BEGIN
        RAISERROR ('Este correo electrónico ya está en uso.', 16, 1);
        RETURN;
    END

    -- 3. Inserción de datos
    BEGIN TRY
        INSERT INTO usuarios (
            telefono, 
            password_hash, 
            nombre, 
            correo, 
            universidad
        )
        VALUES (
            @telefono, 
            @password_hash, 
            @nombre, 
            @correo, 
            @universidad
        );

        -- Retornamos el ID generado por si lo necesitas en VS para iniciar sesión de una vez
        SELECT SCOPE_IDENTITY() AS NewUserID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;


CREATE OR ALTER PROCEDURE sp_ToggleSeguimiento
    @id_seguidor INT,
    @id_seguido INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar que no se siga a sí mismo (Integridad de flujo)
    IF @id_seguidor = @id_seguido
    BEGIN
        RAISERROR ('Un usuario no puede seguirse a sí mismo.', 16, 1);
        RETURN;
    END

    -- Si ya existe la relación, lo dejamos de seguir (DELETE)
    IF EXISTS (SELECT 1 FROM seguidores WHERE id_seguidor = @id_seguidor AND id_seguido = @id_seguido)
    BEGIN
        DELETE FROM seguidores 
        WHERE id_seguidor = @id_seguidor AND id_seguido = @id_seguido;
        
        SELECT 'Dejado de seguir' AS Resultado;
    END
    -- Si no existe, lo empezamos a seguir (INSERT)
    ELSE
    BEGIN
        INSERT INTO seguidores (id_seguidor, id_seguido)
        VALUES (@id_seguidor, @id_seguido);
        
        SELECT 'Siguiendo' AS Resultado;
    END
END;


CREATE OR ALTER PROCEDURE sp_CrearServicio
    @id_proveedor INT,
    @titulo NVARCHAR(100),
    @descripcion NVARCHAR(MAX),
    @id_categoria INT,
    @precio_hora DECIMAL(10, 2),
    @contacto NVARCHAR(150),
    @modalidad INT,      -- 0: Presencial, 1: Virtual, 2: Mixta
    @disponibilidad INT, -- 0: Entre semana, 1: Fines de semana, 2: Siempre disponible
    @icono NVARCHAR(1)   -- El emoji resultante del switch en JS
AS
BEGIN
    SET NOCOUNT ON;

    -- Validamos que el proveedor exista antes de intentar crear el servicio
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = @id_proveedor)
    BEGIN
        RAISERROR ('El proveedor especificado no existe.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        INSERT INTO servicios (
            id_proveedor, 
            titulo, 
            descripcion, 
            id_categoria, 
            precio_hora, 
            contacto, 
            modalidad, 
            disponibilidad,
            icono
        )
        VALUES (
            @id_proveedor, 
            @titulo, 
            @descripcion, 
            @id_categoria, 
            @precio_hora, 
            @contacto, 
            @modalidad, 
            @disponibilidad,
            @icono
        );

        -- Retornamos el ID del servicio creado para confirmación en el Frontend
        SELECT SCOPE_IDENTITY() AS NuevoServicioID;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;


CREATE OR ALTER PROCEDURE sp_GestionarSolicitud
    @id_cliente INT,
    @id_proveedor INT,
    @id_servicio INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Regla de negocio: No auto-solicitarse
    IF @id_cliente = @id_proveedor
    BEGIN
        RAISERROR ('No puedes solicitar tu propio servicio.', 16, 1);
        RETURN;
    END

    -- 2. Lógica de Intercambio (Toggle)
    -- Si ya existe una solicitud PENDIENTE, la eliminamos (Acción: Cancelar)
    IF EXISTS (SELECT 1 FROM solicitudes 
               WHERE id_cliente = @id_cliente 
               AND id_servicio = @id_servicio 
               AND fue_aceptada = 0)
    BEGIN
        DELETE FROM solicitudes 
        WHERE id_cliente = @id_cliente 
        AND id_servicio = @id_servicio 
        AND fue_aceptada = 0;

        SELECT 'Solicitud cancelada con éxito' AS Resultado, 0 AS Estado;
    END
    -- 3. Si ya fue ACEPTADA, no permitimos borrarla desde aquí para no romper el flujo de calificación
    ELSE IF EXISTS (SELECT 1 FROM solicitudes 
                    WHERE id_cliente = @id_cliente 
                    AND id_servicio = @id_servicio 
                    AND fue_aceptada = 1)
    BEGIN
        RAISERROR ('Esta solicitud ya fue aceptada y no se puede cancelar.', 16, 1);
    END
    -- 4. Si no existe, la creamos (Acción: Solicitar)
    ELSE
    BEGIN
        INSERT INTO solicitudes (id_cliente, id_proveedor, id_servicio, fue_aceptada)
        VALUES (@id_cliente, @id_proveedor, @id_servicio, 0);

        SELECT 'Solicitud enviada correctamente' AS Resultado, 1 AS Estado;
    END
END;


CREATE OR ALTER PROCEDURE sp_GuardarCalificacionConAspectos
    @id_solicitud INT,
    @id_cliente INT,
    @id_servicio INT,
    @puntuacion TINYINT,
    @comentario NVARCHAR(MAX),
    @aspectos_nombres NVARCHAR(MAX) -- Recibiremos algo como: 'Puntualidad,Calidad,Comunicacion'
AS
BEGIN
    SET NOCOUNT ON;

    -- Usamos una transacción para asegurar que se guarde todo o nada
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @id_calificacion_generado INT;

        -- 1. Lógica UPSERT (Insertar o Actualizar)
        -- Buscamos si ya existe una calificación de este cliente para este servicio
        IF EXISTS (SELECT 1 FROM calificaciones WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio)
        BEGIN
            UPDATE calificaciones 
            SET puntuacion = @puntuacion,
                comentario = @comentario,
                fecha_modificacion = GETDATE()
            WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio;

            -- Obtenemos el ID existente
            SELECT @id_calificacion_generado = id_calificacion 
            FROM calificaciones 
            WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio;

            -- Borramos aspectos anteriores para reemplazarlos por los nuevos
            DELETE FROM aspectos_destacados WHERE id_calificacion = @id_calificacion_generado;
        END
        ELSE
        BEGIN
            -- Si no existe, creamos la nueva calificación
            INSERT INTO calificaciones (id_solicitud, id_cliente, id_servicio, puntuacion, comentario)
            VALUES (@id_solicitud, @id_cliente, @id_servicio, @puntuacion, @comentario);

            SET @id_calificacion_generado = SCOPE_IDENTITY();
        END

        -- 2. Insertar los Aspectos Destacados
        -- Dividimos la cadena recibida por comas e insertamos cada uno
        -- STRING_SPLIT es una función de SQL Server para convertir 'A,B,C' en filas
        INSERT INTO aspectos_destacados (id_calificacion, tipo_aspecto)
        SELECT @id_calificacion_generado, TRIM(value)
        FROM STRING_SPLIT(@aspectos_nombres, ',');

        COMMIT TRANSACTION;
        SELECT 'Calificación procesada correctamente' AS Resultado;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @Msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH
END;

