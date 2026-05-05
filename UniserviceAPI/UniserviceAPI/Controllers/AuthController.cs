using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UniserviceAPI.DTOs;
using UniserviceAPI.Services;
using UniServiceAPI.Models;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static Dictionary<string, string> codigos = new();
    private static HashSet<string> correosVerificados = new();

    private readonly EmailService _emailService;
    private readonly IConfiguration _config;

    public AuthController(EmailService emailService, IConfiguration config)
    {
        _emailService = emailService;
        _config = config;
    }

    // =========================
    // ENVIAR CÓDIGO
    // =========================
    [HttpPost("send-code")]
    public async Task<IActionResult> EnviarCodigo([FromBody] EmailDTO data)
    {
        var codigo = new Random().Next(100000, 999999).ToString();

        codigos[data.correo] = codigo;

        // Expira en 5 min
        _ = Task.Delay(300000).ContinueWith(_ =>
        {
            if (codigos.ContainsKey(data.correo) && codigos[data.correo] == codigo)
                codigos.Remove(data.correo);
        });

        await _emailService.EnviarCodigoVerificacion(data.correo, codigo);

        return Ok(new { ok = true });
    }

    // =========================
    // VERIFICAR CÓDIGO
    // =========================
    [HttpPost("verify-code")]
    public IActionResult VerificarCodigo([FromBody] VerificarCodigoDTO data)
    {
        if (codigos.ContainsKey(data.correo) && codigos[data.correo] == data.codigo)
        {
            correosVerificados.Add(data.correo);

            return Ok(new { valido = true });
        }

        return BadRequest(new { valido = false });
    }

    // =========================
    // REGISTER (BLOQUEADO SI NO VERIFICÓ)
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        if (string.IsNullOrEmpty(dto.codigo) ||
    !codigos.ContainsKey(dto.correo) ||
    codigos[dto.correo] != dto.codigo)
            return BadRequest(new { error = "Debes verificar el correo primero" });

        codigos.Remove(dto.correo);

        try {
            using (SqlConnection conn = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
            {
                await conn.OpenAsync();

                // Verificar si ya existe
                var check = new SqlCommand("SELECT COUNT(*) FROM usuarios WHERE correo = @correo", conn);
                check.Parameters.AddWithValue("@correo", dto.correo);

                int existe = (int)await check.ExecuteScalarAsync();
                if (existe > 0)
                    return BadRequest(new { error = "Correo ya registrado" });

                // Hash password
                string hash = BCrypt.Net.BCrypt.HashPassword(dto.password);

                // Usar tu SP
                var cmd = new SqlCommand("sp_CrearUsuario", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@correo", dto.correo);
                cmd.Parameters.AddWithValue("@password_hash", hash);
                cmd.Parameters.AddWithValue("@nombre", dto.nombre);

                // 👇 ExecuteScalar en vez de ExecuteNonQuery porque el SP retorna SCOPE_IDENTITY
                var resultado = await cmd.ExecuteScalarAsync();

                if (resultado == null)
                    return StatusCode(500, new { error = "No se pudo crear el usuario" });

                correosVerificados.Remove(dto.correo);

                return Ok(new { ok = true });
            }
        }
        catch (SqlException ex)
        {
            // 👇 Ahora captura el RAISERROR del SP y lo devuelve al frontend
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }

    }

    // =========================
    // LOGIN
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        using (SqlConnection conn = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
        {
            await conn.OpenAsync();

            var cmd = new SqlCommand("SELECT * FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
                return NotFound(new { error = "Usuario no existe" });

            await reader.ReadAsync();

            string hash = reader["password_hash"].ToString();

            if (!BCrypt.Net.BCrypt.Verify(dto.password, hash))
                return Unauthorized(new { error = "Contraseña incorrecta" });

            int id = (int)reader["id_usuario"];

            // JWT
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            var token = new JwtSecurityToken(
                claims: new[] { new Claim("id", id.ToString()) },
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }
    }
}