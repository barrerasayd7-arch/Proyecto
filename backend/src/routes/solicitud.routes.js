import { Router } from "express";
import {
  crearSolicitud,
  getMisSolicitudes,
  getSolicitudesRecibidas,
  responderSolicitud,
} from "../controllers/solicitud.controller.js";

const router = Router();

router.post("/",                    crearSolicitud);
router.get("/enviadas/:id",         getMisSolicitudes);
router.get("/recibidas/:id",        getSolicitudesRecibidas);
router.post("/responder",           responderSolicitud);

export default router;