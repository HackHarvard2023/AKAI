import { Router } from "express";
import {
    chat,
    //procesar_transaccion,
    //manejo_de_finanzas,
} from "../controllers/chatController.js";

const router = Router();

router.post("/chat", chat);

export default router;