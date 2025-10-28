import oracledb from "oracledb";

// No need for initOracleClient() on Render or Linux.
// node-oracledb will automatically use "thin mode" if no native client exists.

export function initOracleClient() {
  try {
    // Force thin mode (optional — safe to include)
    oracledb.initOracleClient({ libDir: undefined });
    console.log("✅ Oracle client initialized in Thin mode");
  } catch (err) {
    console.warn("⚠️ Oracle client init skipped (Thin mode will be used):", err.message);
  }
}

export default oracledb;
