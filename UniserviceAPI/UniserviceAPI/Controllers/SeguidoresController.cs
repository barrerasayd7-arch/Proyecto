using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class SeguidoresController : ControllerBase
{
    private readonly IConfiguration _config;

    public SeguidoresController(IConfiguration config)
    {
        _config = config;
    }

    // ?? TOGGLE (seguir / dejar de seguir)
    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleSeguimiento([FromBody] SeguimientoDTO dto)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand("sp_ToggleSeguimiento", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@id_seguidor", dto.id_seguidor);
            cmd.Parameters.AddWithValue("@id_seguido", dto.id_seguido);

            var result = await cmd.ExecuteScalarAsync();

            return Ok(new { resultado = result?.ToString() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // ?? ESTADO (si sigue o no)
    [HttpGet("estado")]
    public async Task<IActionResult> EstadoSeguimiento(int seguidor, int seguido)
    {
        try
        {
            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT COUNT(*) 
                FROM seguidores 
                WHERE id_seguidor = @seguidor AND id_seguido = @seguido
            ", conn);

            cmd.Parameters.AddWithValue("@seguidor", seguidor);
            cmd.Parameters.AddWithValue("@seguido", seguido);

            int total = (int)await cmd.ExecuteScalarAsync();

            return Ok(new { sigues = total > 0 });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}