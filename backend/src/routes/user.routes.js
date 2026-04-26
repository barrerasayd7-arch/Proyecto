import { Router } from "express";
import { register, login, getUsuarios, getUsuarioById, updateUsuario, verifyToken,solicitarResetPassword, resetPassword } from "../controllers/user.controller.js";
import { seguirUsuario, dejarDeSeguir, estadoSeguimiento } from "../controllers/seguidor.controller.js";
import { enviarCodigo, verificarCodigo } from "../controllers/auth.controller.js";
const router = Router();

router.get("/", verifyToken, getUsuarios);
router.get("/seguimiento",     estadoSeguimiento);
router.get("/:id", verifyToken, getUsuarioById);
router.post("/register", register);
router.post("/login", login);
router.put("/:id", verifyToken, updateUsuario);


// ── Seguimientos ──
router.post("/seguir",         seguirUsuario);
router.delete("/dejar-seguir", dejarDeSeguir);


//Verificación de correo
router.post("/send-code", enviarCodigo);
router.post("/verify-code", verificarCodigo);

router.post("/forgot-password", solicitarResetPassword);
router.post("/reset-password",  resetPassword);

export default router;