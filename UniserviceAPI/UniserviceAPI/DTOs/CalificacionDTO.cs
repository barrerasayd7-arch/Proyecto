namespace UniserviceAPI.DTOs
{
    public class CalificacionDTO
    {
        public int id_solicitud { get; set; }
        public int id_cliente { get; set; }
        public int id_servicio { get; set; }
        public byte puntuacion { get; set; }  // 1 a 5
        public string? comentario { get; set; }
    }
}
