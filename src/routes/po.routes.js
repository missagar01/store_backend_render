import { Router } from "express";
import { getPoPending, getPoHistory } from "../controllers/po.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/pending", getPoPending);
router.get("/history", getPoHistory);

export default router;



