using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IConfiguration _config;

    public ServicesController(IConfiguration config)
    {
        _config = config;
    }

    // =========================
    // GET TODOS LOS SERVICIOS
    // =========================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var servicios = new List<object>();

            using var cmd = new SqlCommand(@"
                SELECT 
                    s.id_servicio,
                    s.titulo,
                    s.descripcion,
                    s.precio_hora,
                    s.icono,
                    s.fecha_publicacion,
                    s.modalidad,
                    s.disponibilidad,
                    c.nombre_categoria,
                    u.nombre AS proveedor
                FROM servicios s
                LEFT JOIN usuarios u ON s.id_proveedor = u.id_usuario
                LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
                ORDER BY s.fecha_publicacion DESC
            ", conn);

            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                servicios.Add(new
                {
                    id_servicio = reader["id_servicio"],
                    titulo = reader["titulo"]?.ToString(),
                    descripcion = reader["descripcion"]?.ToString(),
                    precio_hora = reader["precio_hora"],
                    icono = reader["icono"]?.ToString() ?? "📌",
                    fecha_publicacion = reader["fecha_publicacion"],
                    modalidad = MapModalidad(reader["modalidad"]),
                    disponibilidad = MapDisponibilidad(reader["disponibilidad"]),
                    nombre_categoria = reader["nombre_categoria"]?.ToString(),
                    proveedor = reader["proveedor"]?.ToString()
                });
            }

            return Ok(servicios);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // GET POR ID
    // =========================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT 
                    s.id_servicio,
                    s.titulo,
                    s.descripcion,
                    s.precio_hora,
                    s.icono,
                    s.fecha_publicacion,
                    s.modalidad,
                    s.disponibilidad,
                    c.nombre_categoria,
                    u.nombre AS proveedor
                FROM servicios s
                LEFT JOIN usuarios u ON s.id_proveedor = u.id_usuario
                LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
                WHERE s.id_servicio = @id
            ", conn);

            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return NotFound(new { error = "Servicio no encontrado" });

            var servicio = new
            {
                id_servicio = reader["id_servicio"],
                titulo = reader["titulo"]?.ToString(),
                descripcion = reader["descripcion"]?.ToString(),
                precio_hora = reader["precio_hora"],
                icono = reader["icono"]?.ToString() ?? "📌",
                fecha_publicacion = reader["fecha_publicacion"],
                modalidad = MapModalidad(reader["modalidad"]),
                disponibilidad = MapDisponibilidad(reader["disponibilidad"]),
                nombre_categoria = reader["nombre_categoria"]?.ToString(),
                proveedor = reader["proveedor"]?.ToString()
            };

            return Ok(servicio);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // CREATE SERVICIO
    // =========================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ServicioDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                INSERT INTO servicios
                (id_proveedor, titulo, descripcion, id_categoria, precio_hora, contacto, modalidad, icono, disponibilidad, fecha_publicacion)
                VALUES
                (@id_proveedor, @titulo, @descripcion, @id_categoria, @precio_hora, @contacto, @modalidad, @icono, @disponibilidad, GETDATE())
            ", conn);

            cmd.Parameters.AddWithValue("@id_proveedor", dto.id_proveedor);
            cmd.Parameters.AddWithValue("@titulo", dto.titulo);
            cmd.Parameters.AddWithValue("@descripcion", dto.descripcion);
            cmd.Parameters.AddWithValue("@id_categoria", dto.id_categoria);
            cmd.Parameters.AddWithValue("@precio_hora", dto.precio_hora);
            cmd.Parameters.AddWithValue("@contacto", dto.contacto ?? "");
            cmd.Parameters.AddWithValue("@modalidad", dto.modalidad);
            cmd.Parameters.AddWithValue("@icono", dto.icono ?? "📌");
            cmd.Parameters.AddWithValue("@disponibilidad", dto.disponibilidad);

            await cmd.ExecuteNonQueryAsync();

            return Ok(new { ok = true, message = "Servicio creado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private string MapModalidad(object value)
    {
        return value?.ToString() switch
        {
            "0" => "🏫 Presencial",
            "1" => "💻 Virtual",
            "2" => "🔄 Mixta",
            _ => "No definido"
        };
    }

    private string MapDisponibilidad(object value)
    {
        return value?.ToString() switch
        {
            "0" => "📆 Entre semana",
            "1" => "🎉 Fines de semana",
            "2" => "⏰ Siempre disponible",
            _ => "No definido"
        };
    }
}