import jwt from 'jsonwebtoken';

// Extract token from common locations (headers, cookies, query)
export function getTokenFromReq(req) {
  // Express lower-cases headers; use both just in case
  const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
  let token = null;

  if (authHeader && typeof authHeader === 'string') {
    // Support `Bearer <token>` (case-insensitive) or raw token
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1].trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token && req.headers && req.headers['x-access-token']) {
    token = String(req.headers['x-access-token']).trim();
  }

  if (!token && req.cookies && req.cookies.token) {
    token = String(req.cookies.token).trim();
  }

  if (!token && req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  return token || null;
}

function resolveJwtVerifyConfig() {
  const algo = process.env.JWT_ALGO || (process.env.JWT_PUBLIC_KEY ? 'RS256' : 'HS256');
  if (algo === 'RS256') {
    // Accept multiline public keys provided via env (\n -> newline)
    const publicKey = (process.env.JWT_PUBLIC_KEY || '').replace(/\\n/g, '\n');
    if (!publicKey) {
      throw new Error('JWT_PUBLIC_KEY missing for RS256 verification');
    }
    return { key: publicKey, options: { algorithms: ['RS256'] } };
  }
  // HS256 secret; prefer explicit JWT_SECRET, else fall back to Supabase secret if present
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not configured. Set JWT_SECRET or SUPABASE_JWT_SECRET');
  }
  return { key: secret, options: { algorithms: ['HS256'] } };
}

export function verifyJwt(token) {
  const { key, options } = resolveJwtVerifyConfig();
  return jwt.verify(token, key, options);
}

export function authenticate(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: missing token' });
    }

    let payload;
    try {
      payload = verifyJwt(token);
    } catch (err) {
      const code = err && err.name;
      const msg =
        code === 'TokenExpiredError'
          ? 'Unauthorized: token expired'
          : 'Unauthorized: invalid token';
      return res.status(401).json({ success: false, error: msg, code });
    }

    // Attach decoded payload; avoid DB lookups in middleware
    req.user = payload;
    return next();
  } catch (e) {
    // Configuration or unexpected errors
    return res.status(500).json({ success: false, error: 'Auth configuration error' });
  }
}

// ESM named export aliases for compatibility
export { authenticate as auth, authenticate as requireAuth };
