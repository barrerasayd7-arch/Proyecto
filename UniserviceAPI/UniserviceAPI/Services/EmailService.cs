using System.Net;
using System.Net.Mail;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task EnviarCodigo(string correo, string codigo)
    {
        var smtp = new SmtpClient("smtp.gmail.com")
        {
            Port = 587,
            Credentials = new NetworkCredential(
                _config["EmailSettings:Email"],
                _config["EmailSettings:Password"]
            ),
            EnableSsl = true
        };

        var mensaje = new MailMessage
        {
            From = new MailAddress(_config["EmailSettings:Email"], "UniService"),
            Subject = "Código de verificación",
            Body = $@"
                    <div style='background-color:#031424;padding:10px 0;font-family:Helvetica,Arial,sans-serif;text-align:center'>
                      <div style='max-width:500px;margin:0 auto;background-color:#051a2d;border-radius:16px;overflow:hidden;border:1px solid #10304a'>

                        <div style='padding:36px 40px 20px 40px'>
                          <img src='https://i.postimg.cc/5NDfZyCv/Logo-name-color-gno-BG-email.png'
                               style='width:340px;height:auto;display:block;margin:0 auto'>
                        </div>

                        <div style='height:1px;background:#10304a;margin:0 40px'></div>

                        <div style='padding:28px 40px 20px 40px'>
                          <h2 style='color:#4ac7b6;font-size:24px;font-weight:700;margin:0 0 12px 0'>
                            Verifica tu cuenta
                          </h2>

                          <p style='color:#ffffff;font-size:15px;line-height:1.7;margin-bottom:30px;opacity:0.85'>
                            ¡Gracias por unirte a <strong style='color:#4ac7b6'>Uni</strong>
                            <strong style='color:#ffdd57'>Service</strong>!
                            Para completar tu registro, usa este código:
                          </p>

                          <div style='background-color:#031424;border-radius:14px;padding:28px 20px;margin-bottom:28px;border:2px solid #10304a'>
                            <p style='color:#4ac7b6;font-size:11px;margin-bottom:12px'>
                              Tu código de verificación
                            </p>

                            <span style='font-family:monospace;font-size:44px;font-weight:bold;color:#4ac7b6;letter-spacing:12px'>
                              {codigo}
                            </span>
                          </div>

                          <div style='background-color:#10304a;border-radius:8px;padding:12px'>
                            <p style='color:#ffffff;font-size:13px;margin:0'>
                              ?? Este código expira en 5 minutos
                            </p>
                          </div>

                        </div>

                        <div style='padding:16px;background-color:#031424;border-top:1px solid #10304a'>
                          <p style='color:#4ac7b6;font-size:12px;margin:0'>
                            © 2026 UniService · Tu socio universitario
                          </p>
                        </div>

                      </div>
                    </div>",
            IsBodyHtml = true
        };

        mensaje.To.Add(correo);

        await smtp.SendMailAsync(mensaje);
    }
}