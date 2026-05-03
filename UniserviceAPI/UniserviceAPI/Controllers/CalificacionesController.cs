using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using UniserviceAPI.DTOs;

[ApiController]
[Route("api/calificaciones")]
public class CalificacionesController : ControllerBase
{
    private readonly IConfiguration _config;

    public CalificacionesController(IConfiguration config)
    {
        _config = config;
    }

    // GET /api/calificaciones/{id_servicio}
    // Devuelve todas las reseñas de un servicio
    [HttpGet("{id_servicio}")]
    public async Task<IActionResult> GetByServicio(int id_servicio)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT 
                    c.id_calificacion,
                    c.puntuacion,
                    c.comentario,
                    c.fecha_calificacion,
                    u.nombre AS autor
                FROM calificaciones c
                INNER JOIN usuarios u ON c.id_cliente = u.id_usuario
                WHERE c.id_servicio = @id_servicio
                ORDER BY c.fecha_calificacion DESC
            ", conn);

            cmd.Parameters.AddWithValue("@id_servicio", id_servicio);

            var resenas = new List<object>();
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                resenas.Add(new
                {
                    id_calificacion = (int)reader["id_calificacion"],
                    estrellas = (byte)reader["puntuacion"],
                    comentario = reader["comentario"]?.ToString(),
                    fecha = ((DateTime)reader["fecha_calificacion"]).ToString("dd MMM yyyy"),
                    autor = reader["autor"]?.ToString()
                });
            }

            return Ok(resenas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST /api/calificaciones
    // Crea una nueva reseña (solo si la solicitud fue completada)
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CalificacionDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            // Verificar que la solicitud existe y fue aceptada
            using var checkCmd = new SqlCommand(@"
                SELECT COUNT(*) FROM solicitudes
                WHERE id_solicitud = @id_solicitud
                  AND id_cliente   = @id_cliente
                  AND id_servicio  = @id_servicio
                  AND estado       = 'Aceptada'
            ", conn);

            checkCmd.Parameters.AddWithValue("@id_solicitud", dto.id_solicitud);
            checkCmd.Parameters.AddWithValue("@id_cliente", dto.id_cliente);
            checkCmd.Parameters.AddWithValue("@id_servicio", dto.id_servicio);

            int valida = (int)await checkCmd.ExecuteScalarAsync();
            if (valida == 0)
                return BadRequest(new { error = "Solo puedes calificar servicios con solicitud aceptada" });

            // Insertar calificación
            using var cmd = new SqlCommand(@"
                INSERT INTO calificaciones
                    (id_solicitud, id_cliente, id_servicio, puntuacion, comentario)
                VALUES
                    (@id_solicitud, @id_cliente, @id_servicio, @puntuacion, @comentario)
            ", conn);

            cmd.Parameters.AddWithValue("@id_solicitud", dto.id_solicitud);
            cmd.Parameters.AddWithValue("@id_cliente", dto.id_cliente);
            cmd.Parameters.AddWithValue("@id_servicio", dto.id_servicio);
            cmd.Parameters.AddWithValue("@puntuacion", dto.puntuacion);
            cmd.Parameters.AddWithValue("@comentario", dto.comentario ?? (object)DBNull.Value);

            await cmd.ExecuteNonQueryAsync();
            return Ok(new { ok = true });
        }
        catch (SqlException ex) when (ex.Number == 2627) // violación UNIQUE
        {
            return BadRequest(new { error = "Ya calificaste este servicio" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/calificaciones/puede-calificar?id_cliente=X&id_servicio=Y
    // El frontend lo usa para saber si mostrar el formulario
    [HttpGet("puede-calificar")]
    public async Task<IActionResult> PuedeCalificar([FromQuery] int id_cliente, [FromQuery] int id_servicio)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            // ¿Tiene solicitud aceptada?
            using var cmdSol = new SqlCommand(@"
                SELECT COUNT(*) FROM solicitudes
                WHERE id_cliente  = @id_cliente
                  AND id_servicio = @id_servicio
                  AND estado      = 'Aceptada'
            ", conn);
            cmdSol.Parameters.AddWithValue("@id_cliente", id_cliente);
            cmdSol.Parameters.AddWithValue("@id_servicio", id_servicio);
            int tieneSolicitud = (int)await cmdSol.ExecuteScalarAsync();

            // ¿Ya calificó?
            using var cmdCalif = new SqlCommand(@"
                SELECT COUNT(*) FROM calificaciones
                WHERE id_cliente  = @id_cliente
                  AND id_servicio = @id_servicio
            ", conn);
            cmdCalif.Parameters.AddWithValue("@id_cliente", id_cliente);
            cmdCalif.Parameters.AddWithValue("@id_servicio", id_servicio);
            int yaCalifico = (int)await cmdCalif.ExecuteScalarAsync();

            // También devolvemos el id_solicitud para usarlo al crear la calificación
            int idSolicitud = 0;
            if (tieneSolicitud > 0)
            {
                using var cmdId = new SqlCommand(@"
                    SELECT TOP 1 id_solicitud FROM solicitudes
                    WHERE id_cliente  = @id_cliente
                      AND id_servicio = @id_servicio
                      AND estado      = 'Aceptada'
                ", conn);
                cmdId.Parameters.AddWithValue("@id_cliente", id_cliente);
                cmdId.Parameters.AddWithValue("@id_servicio", id_servicio);
                var result = await cmdId.ExecuteScalarAsync();
                if (result != null) idSolicitud = (int)result;
            }

            return Ok(new
            {
                puede = tieneSolicitud > 0 && yaCalifico == 0,
                yaCalifico = yaCalifico > 0,
                id_solicitud = idSolicitud
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}