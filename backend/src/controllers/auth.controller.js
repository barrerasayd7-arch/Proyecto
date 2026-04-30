import { transporter } from "../config/mailer.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diccionario temporal para guardar códigos (en memoria)
// NOTA: Para producción usarías Redis, pero para la UPC esto es perfecto.
export const codigosTemporales = {};

export const enviarCodigo = async (req, res) => {
  const { correo } = req.body;

  // Generar código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  // Guardar código en memoria por 5 minutos
  codigosTemporales[correo] = codigo;

  setTimeout(() => {
    if (codigosTemporales[correo] === codigo) {
      delete codigosTemporales[correo];
      console.log(`Código para ${correo} expirado y eliminado.`);
    }
  }, 300000); // 300,000 ms = 5 minutos

  try {
    await transporter.sendMail({
      from: '"UniService Plattform 🎓" <' + process.env.EMAIL_USER + '>',
      to: correo,
      subject: "Tu código de Autentificación Único - UniService",

      // El logo viaja dentro del correo, sin depender de URLs externas
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../../../frontend/src/img/Logo+name_color_gnoBG_email.png"),
          cid: "uniservice-logo", // Debe coincidir con src="cid:..." en el HTML
        },
      ],

      html: `<div style="background-color:#031424;padding:10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center"><div style="max-width:500px;margin:0 auto;background-color:#051a2d;border-radius:16px;overflow:hidden;border:1px solid #10304a"><div style="padding:36px 40px 20px 40px"><img src="cid:uniservice-logo" alt="UniService Logo" style="width:340px;height:auto;display:block;margin:0 auto"></div><div style="height:1px;background:#10304a;margin:0 40px"></div><div style="padding:28px 40px 20px 40px"><h2 style="color:#4ac7b6;font-size:24px;font-weight:700;margin:0 0 12px 0;letter-spacing:-0.5px">Verifica tu cuenta</h2><p style="color:#ffffff;font-size:15px;line-height:1.7;margin-bottom:30px;opacity:0.85">¡Gracias por unirte a <strong style="color:#4ac7b6">Uni</strong><strong style="color:#ffdd57">Service</strong>! Para completar tu registro de forma segura, introduce el siguiente código en la plataforma:</p><div style="background-color:#031424;border-radius:14px;padding:28px 20px;margin-bottom:28px;border:2px solid #10304a"><p style="color:#4ac7b6;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px 0;opacity:0.7">Tu código de verificación</p><span style="font-family:'Monaco','Consolas',monospace;font-size:44px;font-weight:bold;color:#4ac7b6;letter-spacing:12px">${codigo}</span></div><div style="background-color:#10304a;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#ffffff;font-size:13px;margin:0;opacity:0.8">🔒 Este código es privado y expirará en <strong style="color:#ffc125">5 minutos</strong>. No lo compartas con nadie.</p></div></div><div style="padding:16px 20px;background-color:#031424;border-top:1px solid #10304a"><p style="color:#4ac7b6;font-size:12px;margin:0;font-weight:600;opacity:0.8">© 2026 UniService. Tu socio de confianza.</p></div></div></div>`,
    });

    res.json({ message: "Código enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
};

export const verificarCodigo = (req, res) => {
  const { correo, codigo } = req.body;

  if (codigosTemporales[correo] === codigo) {
    return res.json({ valido: true });
  }

  res.status(400).json({ valido: false, message: "Código incorrecto" });
};