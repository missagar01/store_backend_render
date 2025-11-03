import { supabase } from "../config/supabaseClient.js";
import { getConnection } from "../config/db.js";
import oracledb from "oracledb";
import jwt from "jsonwebtoken";

export async function authenticateWithSupabaseTable(userName, password) {
  const usersTable = process.env.SUPABASE_USERS_TABLE || "users";

  const usernameCol = process.env.SUPABASE_USERS_USERNAME_COLUMN || "user_name";
  const passwordCol = process.env.SUPABASE_USERS_PASSWORD_COLUMN || "password";

  const { data: rows, error } = await supabase
    .from(usersTable)
    .select(`id, ${usernameCol}, ${passwordCol}, status, user_access, employee_id`)
    .eq(usernameCol, userName)
    .eq(passwordCol, password)
    .limit(1);

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return { ok: false, reason: "supabase_not_found_or_password_mismatch" };

  const row = rows[0];

  return {
    ok: true,
    user: { id: row.id, email: null, username: row[usernameCol] },
    session: null,
  };
}

// export async function authenticateWithSupabaseAuth(email, password) {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) return { ok: false, reason: "supabase_auth_failed" };
//   return {
//     ok: true,
//     user: { id: data.user?.id, email: data.user?.email, username: email },
//     session: data.session,
//   };
// }

export async function verifyUserInOracleIfConfigured(userName, password) {
  const oracleSchema = process.env.ORACLE_USERS_SCHEMA || "SRMPLERP";
  const oracleTable = process.env.ORACLE_USERS_TABLE || "USER_MAST";
  const oracleUsernameCol = process.env.ORACLE_USERS_USERNAME_COLUMN || "user_code";
  const oraclePasswordCol = process.env.ORACLE_USERS_PASSWORD_COLUMN || "PASSWORD";
  const oracleActiveCol = process.env.ORACLE_USERS_ACTIVE_COLUMN; // optional

  let conn;
  try {
    conn = await getConnection();
    const passwordCaseInsensitive = String(process.env.ORACLE_PASSWORD_CASE_INSENSITIVE || "false").toLowerCase() === "true";
    const query = `SELECT ${oracleUsernameCol}${oracleActiveCol ? ", " + oracleActiveCol : ""}
                   FROM ${oracleSchema}.${oracleTable}
                   WHERE TRIM(UPPER(${oracleUsernameCol})) = TRIM(UPPER(:username))
                     AND ${passwordCaseInsensitive ? `TRIM(UPPER(${oraclePasswordCol})) = TRIM(UPPER(:password))` : `TRIM(${oraclePasswordCol}) = TRIM(:password)`}`;

    const result = await conn.execute(
      query,
      { username: userName, password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (process.env.DEBUG_AUTH === "true") {
      try {
        console.log("[AUTH][ORACLE] query user", { user: userName, rows: result.rows ? result.rows.length : 0, caseInsensitivePwd: passwordCaseInsensitive });
      } catch (_) {}
    }

    if (!result.rows || result.rows.length === 0) return { ok: false, reason: "User not found in Oracle" };
    if (oracleActiveCol) {
      const row = result.rows[0];
      const isActive = row[oracleActiveCol] === 1 || row[oracleActiveCol] === true || row[oracleActiveCol] === "Y";
      if (!isActive) return { ok: false, reason: "User is inactive" };
    }
    return { ok: true };
  } finally {
    if (conn) await conn.close();
  }
}

export function issueJwt(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const payload = {
    sub: user?.id,
    email: user?.email || null,
    username: user?.username || null,
  };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: process.env.JWT_ISSUER || "store-backend",
  });
}


