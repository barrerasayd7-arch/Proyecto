using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public UsuariosController(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _env = env;
    }

    [HttpPost("upload-avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file, [FromForm] int id_usuario)
    {
        try
        {
            // 1. Validar que llegó un archivo
            if (file == null || file.Length == 0)
                return BadRequest(new { ok = false, error = "No se recibió ningún archivo" });

            // 2. Crear la carpeta wwwroot/avatars si no existe
            var avatarsFolder = Path.Combine(_env.WebRootPath, "avatars");
            if (!Directory.Exists(avatarsFolder))
                Directory.CreateDirectory(avatarsFolder);

            // 3. Generar nombre único para evitar colisiones
            var extension = Path.GetExtension(file.FileName); // .jpg .png etc
            var nombreArchivo = $"avatar_{id_usuario}_{Guid.NewGuid()}{extension}";
            var rutaCompleta = Path.Combine(avatarsFolder, nombreArchivo);

            // 4. Guardar el archivo en disco
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 5. URL pública que React usará para mostrar la imagen
            var avatarUrl = $"http://localhost:5165/avatars/{nombreArchivo}";

            // 6. Actualizar la URL en la base de datos
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "UPDATE usuarios SET avatar = @avatar WHERE id_usuario = @id", conn);
            cmd.Parameters.AddWithValue("@avatar", avatarUrl);
            cmd.Parameters.AddWithValue("@id", id_usuario);
            await cmd.ExecuteNonQueryAsync();

            return Ok(new { ok = true, avatarUrl = avatarUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { ok = false, error = ex.Message });
        }
    }
}