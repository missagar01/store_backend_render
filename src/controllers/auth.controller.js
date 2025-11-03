import {  verifyUserInOracleIfConfigured, issueJwt, authenticateWithSupabaseTable } from "../services/auth.service.js";

export async function login(req, res) {
  let { user_code, user_name, password } = req.body || {};

  if (typeof user_code === "string") user_code = user_code.trim();
  if (typeof user_name === "string") user_name = user_name.trim();
  if (typeof password === "string") password = password.trim();

  const identity = user_code || user_name;

  if (process.env.DEBUG_AUTH === "true") {
    try {
      const masked = password ? "*".repeat(Math.min(password.length, 10)) : "";
      // console.log("[AUTH] Login attempt", { user_code, user_name, identity, passwordMasked: masked, length: password ? password.length : 0 });
    } catch (_) {}
  }

  if (!identity || !password) {
    return res.status(400).json({ error: "user_code or user_name and password are required" });
  }

  try {
    // 1) Oracle (only when user_code provided)
    let oracleRes = { ok: true };
    if (user_code) {
      oracleRes = await verifyUserInOracleIfConfigured(identity, password);
    }
    if (!oracleRes.ok) {
      const body = { error: "Invalid credentials" };
      if (process.env.DEBUG_AUTH === "true") body.reason = oracleRes.reason || "oracle_check_failed";
      return res.status(401).json(body);
    }

    // 2) Supabase (only when user_name provided). Not required to pass unless AUTH_ENFORCE_SUPABASE=true
    let supaUser = null;
    let supaSession = null;
    if (user_name) {
      const supaRes = await authenticateWithSupabaseTable(identity, password);
      if (!supaRes || !supaRes.ok) {
        const enforce = String(process.env.AUTH_ENFORCE_SUPABASE || "false").toLowerCase() === "true";
        if (enforce) return res.status(401).json({ error: "Invalid credentials" });
      } else {
        supaUser = supaRes.user;
        supaSession = supaRes.session;
      }
    }

    // 3) Issue backend JWT token
    const token = issueJwt({ id: supaUser?.id || null, email: supaUser?.email || null, username: identity });

    // Success: return session, user and backend token
    return res.json({
      success: true,
      user: {
        id: supaUser?.id || null,
        email: supaUser?.email || null,
        username: identity,
      },
      session: {
        access_token: supaSession?.access_token || null,
        expires_at: supaSession?.expires_at || null,
        refresh_token: supaSession?.refresh_token || null,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function loginSupabase(req, res) {
  let { user_name, password } = req.body || {};
  if (typeof user_name === "string") user_name = user_name.trim();
  if (typeof password === "string") password = password.trim();

  if (!user_name || !password) {
    return res.status(400).json({ error: "user_name and password are required" });
  }

  try {
    const supaRes = await authenticateWithSupabaseTable(user_name, password);
    if (!supaRes || !supaRes.ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = issueJwt({ id: supaRes.user?.id || null, email: null, username: user_name });

    return res.json({
      success: true,
      user: {
        id: supaRes.user?.id || null,
        email: null,
        username: user_name,
      },
      session: null,
      token,
    });
  } catch (err) {
    console.error("Login Supabase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

