export async function retry(fn, {
  retries = 3,
  factor = 2,
  minTimeout = 200,
} = {}) {
  let attempt = 0;
  let delay = minTimeout;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= factor;
    }
  }
}

export function isOracleConnError(err) {
  const msg = (err && (err.message || err.toString())) || '';
  return (
    msg.includes('NJS-510') || // connect timeout
    msg.includes('NJS-003') || // connection missing
    msg.includes('DPI-1067') || // closed connection
    msg.includes('DPI-1010') // not connected
  );
}

