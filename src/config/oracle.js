import oracledb from 'oracledb';

let pool;

export async function initPool() {
  if (pool) return pool;
  const queueTimeout = Number(process.env.ORACLE_QUEUE_TIMEOUT_MS || 60000);
  const connectTimeout = Number(process.env.ORACLE_CONNECT_TIMEOUT_MS || 60000);
  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    poolMin: 0,
    poolMax: 4,
    poolIncrement: 1,
    queueRequests: true,
    queueTimeout,
    connectTimeout,
    poolPingInterval: 60,
  });
  return pool;
}

export function getPool() {
  if (!pool) throw new Error('Oracle pool not initialized');
  return pool;
}

export async function withConn(fn) {
  const conn = await getPool().getConnection();
  try {
    return await fn(conn);
  } finally {
    await conn.close();
  }
}

export async function ping() {
  return withConn((c) => c.execute('select 1 as x from dual'));
}

