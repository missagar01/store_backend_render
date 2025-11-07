// src/config/db.js
import dotenv from "dotenv";
import oracledb from "./oracleClient.js";
import { initOracleClient } from "./oracleClient.js";

dotenv.config();

let pool = null;

export async function initPool() {
  if (pool) return pool;

  initOracleClient();

  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECTION_STRING; // e.g. 115.244.175.130:1521/ora11g

  if (!user || !password || !connectString) {
    console.error("❌ Missing Oracle env vars. Set ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING.");
    throw new Error("Missing Oracle connection config");
  }

  console.log("🔧 Oracle pool config:", { user: user ? "***" : null, connectString });

  try {
    pool = await oracledb.createPool({
      user,
      password,
      connectString,
      // increase timeouts for remote testing (milliseconds)
      connectTimeout: process.env.ORACLE_CONNECT_TIMEOUT_MS ? parseInt(process.env.ORACLE_CONNECT_TIMEOUT_MS, 10) : 30000,
      // keep rest of your configuration (adjust as needed)
      poolMin: 0,
      poolMax: 10,
      poolIncrement: 1,
      queueTimeout: 60000, // 60s for queued requests
      stmtCacheSize: 0,
    });

    console.log("✅ Oracle pool started");
    return pool;
  } catch (err) {
    console.error("❌ Failed to create Oracle pool:", err && err.message ? err.message : err);
    // rethrow so caller sees it
    throw err;
  }
}

export async function getConnection() {
  if (!pool) {
    await initPool();
  }
  return pool.getConnection();
}
