using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IConfiguration _config;

    public UsersController(IConfiguration config)
    {
        _config = config;
    }

    // 🔹 GET TODOS (protegido)
    [HttpGet]
    public async Task<IActionResult> GetUsuarios()
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var lista = new List<object>();

            using var cmd = new SqlCommand(@"
                SELECT id_usuario, telefono, nombre, descripcion, correo, estado, fecha_registro, universidad, avatar
                FROM usuarios
            ", conn);

            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lista.Add(new
                {
                    id = reader["id_usuario"],
                    nombre = reader["nombre"],
                    correo = reader["correo"],
                    telefono = reader["telefono"]
                });
            }

            return Ok(lista);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // 🔹 REGISTER (usa tu SP)
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            // 🔐 Hash password
            string hash = BCrypt.Net.BCrypt.HashPassword(dto.password);

            using var cmd = new SqlCommand("sp_CrearUsuario", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@correo", dto.correo);
            cmd.Parameters.AddWithValue("@password_hash", hash);
            cmd.Parameters.AddWithValue("@nombre", dto.nombre);
            cmd.Parameters.AddWithValue("@telefono", dto.telefono ?? "");

            await cmd.ExecuteNonQueryAsync();

            return Ok(new { message = "Usuario creado" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // 🔹 LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand("SELECT * FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return NotFound(new { message = "Usuario no existe" });

            string hash = reader["password_hash"].ToString().Trim();

            bool valid = BCrypt.Net.BCrypt.Verify(dto.password, hash);

            if (!valid)
                return Unauthorized(new { message = "Contraseña incorrecta" });

            int id = (int)reader["id_usuario"];

            // 🔐 GENERAR TOKEN
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id", id.ToString())
            };
            Console.WriteLine("PASS INPUT: " + dto.password);
            Console.WriteLine("HASH DB: " + hash);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                user = new
                {
                    id = id,
                    nombre = reader["nombre"],
                    correo = reader["correo"]
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            // Esta consulta solo pide lo básico de la tabla usuarios para asegurar que cargue
            // Si tienes las otras columnas en tu tabla, agrégalas aquí
            string sql = @"
            SELECT 
                id_usuario, nombre, correo, estado, 
                ISNULL(avatar, '../src/img/default-avatar.png') as avatar, 
                ISNULL(descripcion, 'Sin descripción') as descripcion, 
                ISNULL(telefono, 'No disponible') as telefono, 
                ISNULL(fecha_registro, GETDATE()) as fecha_registro, 
                ISNULL(universidad, 'Sin universidad') as universidad
            FROM usuarios 
            WHERE id_usuario = @id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                // Devolvemos los datos. Si las tablas de seguidores/servicios no existen,
                // ponemos 0 manualmente para que no salga el error 500.
                return Ok(new
                {
                    id = (int)reader["id_usuario"],
                    nombre = reader["nombre"].ToString(),
                    correo = reader["correo"].ToString(),
                    estado = reader["estado"],
                    avatar = reader["avatar"].ToString(),
                    descripcion = reader["descripcion"].ToString(),
                    telefono = reader["telefono"].ToString(),
                    fecha_registro = (DateTime)reader["fecha_registro"],
                    universidad = reader["universidad"].ToString(),

                    // Valores quemados temporalmente para evitar el error 500 
                    // si no tienes las tablas de seguidores o servicios aún:
                    total_publicaciones = 0,
                    total_seguidores = 0,
                    total_siguiendo = 0,
                    reputacion = 0,
                });
            }

            return NotFound(new { message = "Usuario no encontrado" });
        }
        catch (Exception ex)
        {
            // Esto te enviará el error real al frontend para que sepas qué columna falta
            return StatusCode(500, new { error = "Error en SQL: " + ex.Message });
        }
    }
}