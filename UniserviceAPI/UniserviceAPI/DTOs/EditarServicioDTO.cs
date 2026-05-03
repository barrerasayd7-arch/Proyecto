namespace UniserviceAPI.DTOs
{
    public class EditarServicioDTO
    {
        public int id_proveedor { get; set; }
        public string titulo { get; set; }
        public string descripcion { get; set; }
        public decimal precio_hora { get; set; }
        public string contacto { get; set; }
        public string icono { get; set; }
    }
}
