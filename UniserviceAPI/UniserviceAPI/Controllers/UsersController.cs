using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IConfiguration _config;

    public UsersController(IConfiguration config)
    {
        _config = config;
    }

    // 🔹 LOGIN ACTUALIZADO PARA ID_ROL (1=Admin, 2=User)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            // Buscamos al usuario incluyendo la columna id_rol que vimos en tu DB
            using var cmd = new SqlCommand("SELECT * FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return NotFound(new { message = "Usuario no existe" });

            string hash = reader["password_hash"]?.ToString()?.Trim() ?? "";
            bool valid = BCrypt.Net.BCrypt.Verify(dto.password, hash);

            if (!valid)
                return Unauthorized(new { message = "Contraseña incorrecta" });

            int id = (int)reader["id_usuario"];
            // Capturamos el id_rol (1 o 2)
            int idRol = reader["id_rol"] != DBNull.Value ? (int)reader["id_rol"] : 2;

            // 🔐 GENERAR TOKEN
            var jwtKey = _config["Jwt:Key"] ?? "ClaveSuperSecretaDeRespaldo_UniServices_2026";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id", id.ToString()),
                new Claim("id_rol", idRol.ToString()) // Guardamos el rol en el token
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 3. Respuesta para React con id_rol
            return Ok(new
            {
                token = tokenString,
                user = new
                {
                    id = id,
                    nombre = reader["nombre"]?.ToString(),
                    correo = reader["correo"]?.ToString(),
                    id_rol = idRol // 👈 React usará esto para redirigir al admin
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // 🔹 GET USER BY ID (Para el Perfil)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            string sql = @"
            SELECT 
                id_usuario, nombre, correo, estado, id_rol,
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
                return Ok(new
                {
                    id = (int)reader["id_usuario"],
                    nombre = reader["nombre"]?.ToString(),
                    correo = reader["correo"]?.ToString(),
                    estado = reader["estado"],
                    id_rol = (int)reader["id_rol"],
                    avatar = reader["avatar"]?.ToString(),
                    descripcion = reader["descripcion"]?.ToString(),
                    telefono = reader["telefono"]?.ToString(),
                    fecha_registro = (DateTime)reader["fecha_registro"],
                    universidad = reader["universidad"]?.ToString(),
                    // Contadores temporales para evitar error 500
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
            return StatusCode(500, new { error = "Error en SQL: " + ex.Message });
        }
    }
}