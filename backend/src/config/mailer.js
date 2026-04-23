import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificamos que la conexión sea correcta
transporter.verify().then(() => {
  console.log("✅ Servidor de correos listo para enviar");
});