import oracledb from "oracledb";

export function initOracleClient() {
  try {
    oracledb.initOracleClient({
      libDir: "C:\\oracle\\instantclient_23_9",
    });
    console.log("✅ Oracle client initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Oracle client:", err);
    process.exit(1);
  }
}
