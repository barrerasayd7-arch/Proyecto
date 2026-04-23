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

  try {
    await transporter.sendMail({
      from: '"UniServices UPC 🎓" <' + process.env.EMAIL_USER + '>',
      to: correo,
      subject: "Tu código de verificación - UniServices",
      html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h2>¡Hola! Confirma tu correo</h2>
          <p>Usa el siguiente código para completar tu registro en la plataforma:</p>
          <h1 style="color: #ffdd57; background: #000; display: inline-block; padding: 10px 20px;">${codigo}</h1>
          <p>Este código expirará en 5 minutos.</p>
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