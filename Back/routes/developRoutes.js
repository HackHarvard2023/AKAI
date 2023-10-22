import { Router } from "express";
import {
    vectorize_input
} from "../controllers/developController.js";

const router = Router();

router.post("/vectorize-input", vectorize_input);

export default router;

