import { Router } from "express";
import { login, loginSupabase } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/login/supabase", loginSupabase);

export default router;


