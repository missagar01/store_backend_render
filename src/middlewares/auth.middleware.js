import jwt from "jsonwebtoken";

// Extract bearer token from multiple sources for ease of use on Render and browsers
function extractToken(req) {
  // 1) Standard Authorization header
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header === "string") {
    const parts = header.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1 && parts[0].length > 0) return parts[0];
  }

  // 2) x-access-token header (often used by clients)
  const xAccess = req.headers?.["x-access-token"];
  if (typeof xAccess === "string" && xAccess.length > 0) return xAccess;

  // 3) Query params (?token= or ?access_token=) – handy for quick browser tests
  const qpToken = req.query?.token || req.query?.access_token;
  if (typeof qpToken === "string" && qpToken.length > 0) return qpToken;

  // 4) Cookie fallback if cookie-parser is used
  const cookieToken = req.cookies?.token || req.cookies?.access_token || null;
  return cookieToken || null;
}

export function authenticate(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ ok: false, message: "JWT secret not configured" });
    }

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, message: "Missing authorization token" });
    }

    const verifyOptions = { clockTolerance: 5 };
    if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;

    const decoded = jwt.verify(token, secret, verifyOptions);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
}

// Role-based guard: authorize("admin") or authorize("manager", "cashier")
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Unauthenticated" });
    }
    if (!allowedRoles || allowedRoles.length === 0) return next();

    const userRole = req.user?.role || req.user?.Role || null;
    if (!userRole) {
      return res.status(403).json({ ok: false, message: "Forbidden: missing role" });
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ ok: false, message: "Forbidden: insufficient role" });
    }
    return next();
  };
}

// Optional auth: attaches user if token valid, otherwise continues without error
export function optionalAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const token = extractToken(req);
  if (!secret || !token) return next();
  try {
    const verifyOptions = { clockTolerance: 5 };
    if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;
    req.user = jwt.verify(token, secret, verifyOptions);
  } catch (_) {
    // ignore errors and proceed as unauthenticated
  }
  return next();
}
