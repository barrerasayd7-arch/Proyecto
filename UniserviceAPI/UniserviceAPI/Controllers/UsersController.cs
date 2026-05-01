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
}