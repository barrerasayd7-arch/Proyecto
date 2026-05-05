using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace UniserviceAPI.Services
{
    public class EmailService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public EmailService(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        public async Task EnviarCodigoVerificacion(string emailDestino, string codigo)
        {
            var mensaje = new MimeMessage();

            // Configuración del Remitente usando EmailSettings del JSON
            mensaje.From.Add(new MailboxAddress("UniService", _config["EmailSettings:Email"]));
            mensaje.To.Add(new MailboxAddress("", emailDestino));
            mensaje.Subject = "Verifica tu cuenta - UniService";

            var builder = new BodyBuilder();

            // 1. Cargar la plantilla HTML desde wwwroot/templates
            string pathHtml = Path.Combine(_env.WebRootPath, "templates", "email_verificacion.html");

            if (!File.Exists(pathHtml))
            {
                throw new FileNotFoundException("No se encontró la plantilla HTML en la ruta: " + pathHtml);
            }

            string htmlBody = await File.ReadAllTextAsync(pathHtml);

            // 2. Inyectar el código dinámico
            htmlBody = htmlBody.Replace("{{codigo}}", codigo);

            // 3. Embeber el logo local mediante Content-ID (CID)
            string pathLogo = Path.Combine(_env.WebRootPath, "img", "logo_uniservice.png");

            if (File.Exists(pathLogo))
            {
                var image = builder.LinkedResources.Add(pathLogo);
                image.ContentId = "logo_uniservice";
            }

            builder.HtmlBody = htmlBody;
            mensaje.Body = builder.ToMessageBody();

            // 4. Configuración y envío mediante SMTP
            using var client = new MailKit.Net.Smtp.SmtpClient();

            try
            {
                // Conexión usando las llaves exactas de tu appsettings.json
                await client.ConnectAsync(
                    _config["EmailSettings:Host"],
                    int.Parse(_config["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.StartTls
                );

                await client.AuthenticateAsync(
                    _config["EmailSettings:Email"],
                    _config["EmailSettings:Password"]
                );

                await client.SendAsync(mensaje);
            }
            finally
            {
                await client.DisconnectAsync(true);
                client.Dispose();
            }
        }
    }
}