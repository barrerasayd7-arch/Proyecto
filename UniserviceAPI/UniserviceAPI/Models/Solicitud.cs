using System;

namespace UniServiceAPI.Models
{
    public class Solicitud
    {
        public int id_cliente { get; set; }
        public int id_proveedor { get; set; }
        public int id_servicio { get; set; }

        public string tipo_servicio { get; set; }
        public string tema { get; set; }
        public string descripcion { get; set; }

        public DateTime fecha_deseada { get; set; }
        public TimeSpan hora_deseada { get; set; }
        public string duracion { get; set; }
        public string modalidad { get; set; }

        public string metodo_pago { get; set; }
        public decimal presupuesto { get; set; }
        public bool pago_anticipado { get; set; }

        public string urgencia { get; set; }
        public string archivo { get; set; }
    }
}