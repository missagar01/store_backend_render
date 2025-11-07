// src/routes/uom.routes.js
import { Router } from "express";
import { getUomItems } from "../controllers/uom.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /uom (requires JWT; now also accepts x-access-token or ?token=)
router.get("/", getUomItems);

export default router;
