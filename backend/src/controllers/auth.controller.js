import { transporter } from "../config/mailer.js";

// Diccionario temporal para guardar códigos (en memoria)
// NOTA: Para producción usarías Redis, pero para la UPC esto es perfecto.
const codigosTemporales = {}; 

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

      //===================================================================================================
      // Aquí va el contenido HTML del correo, con estilos mejorados y el código de verificación destacado.
      //===================================================================================================

    from: '"UniService Plattform 🎓" <' + process.env.EMAIL_USER + '>',
      to: correo,
      subject: "Tu código de Autentificación Único - UniService",
      html: `
        <div style="background-color: #031424; padding: 50px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #051a2d; border-radius: 16px; overflow: hidden; border: 1px solid #10304a; box-shadow: 0 10px 40px rgba(0,0,0,0.25);">
            <br><br>

            <div style="padding: 10px 0 25px 0;">
              <img 
                src="https://i.ibb.co/ZRRsjxKV/Logo-name-color-gno-BG-email.png" 
                alt="UniService Logo" 
                style="width: 400px; height: auto; display: block; margin: 0 auto;"
              >
            </div>

            <div style="padding: 0 40px 20px 40px;">
              <h2 style="color: #4ac7b6; font-size: 26px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px;">
                Verifica tu cuenta
              </h2>

              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 35px; opacity: 0.9;">
                ¡Gracias por unirte a <strong style="color: #4ac7b6;">Uni</strong><strong style="color: #ffdd57;">Service</strong>! Para completar tu proceso deregistro de forma segura, por favor introduce el siguiente código en la página web:
              </p>

              <div style="background-color: #031424; border-radius: 12px; padding: 30px; margin-bottom: 35px; border: 2px solid #10304a; display: inline-block;">
                <span style="font-family: 'Monaco', 'Consolas', monospace; font-size: 40px; font-weight: bold; color: #4ac7b6; letter-spacing: 8px;">
                  ${codigo}
                </span>
              </div>

              <br>
              <div style="background-color: #10304a; border-radius: 8px; padding: 12px; margin-bottom: 0;">
                <p style="color: #ffffff; font-size: 13px; margin: 0; opacity: 0.8;">
                  Este código es privado y expirará automáticamente en
                  <strong style="color: #ffc125;">5 minutos</strong>.
                </p>
              </div>
              <br>
            </div>

            <div style="padding: 20px; background-color: #031424; text-align: center; border-top: 1px solid #10304a;">
              <p style="color: #4ac7b6; font-size: 12px; margin: 0; font-weight: 600;">
                © 2026 UniService. Tu socio de confianza.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    res.json({ message: "Código enviado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
};

export const verificarCodigo = (req, res) => {
  const { correo, codigo } = req.body;
  
  if (codigosTemporales[correo] === codigo) {
    delete codigosTemporales[correo]; // Limpiamos el código una vez usado
    return res.json({ valido: true });
  }
  
  res.status(400).json({ valido: false, message: "Código incorrecto" });
};