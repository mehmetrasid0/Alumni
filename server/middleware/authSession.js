/**
 * ============================================================================
 * Alumni Tracker — Signed HttpOnly Session Middleware & Helpers
 * ============================================================================
 * Architectural Layer: MIDDLEWARE (Authentication & Session Context)
 * Specification Reference: DDD.md Section 8
 *
 * Uses Node.js built-in crypto (HMAC-SHA256) to issue and verify signed
 * session tokens stored in an HttpOnly cookie (`alumni_session`), with zero
 * external dependencies.
 * ============================================================================
 */

const crypto = require('crypto');

const COOKIE_NAME = 'alumni_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'alumni-tracker-iu-ybs-2026-session-secret';

function base64UrlEncode(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signPayload(payloadObj) {
  const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${payloadB64}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBufA = Buffer.from(providedSig);
  const sigBufB = Buffer.from(expectedSig);
  if (sigBufA.length !== sigBufB.length || !crypto.timingSafeEqual(sigBufA, sigBufB)) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payloadB64));
    if (!decoded || !decoded.id || !decoded.exp || Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;
  cookieHeader.split(';').forEach((part) => {
    const eqIndex = part.indexOf('=');
    if (eqIndex > -1) {
      const key = part.slice(0, eqIndex).trim();
      const val = part.slice(eqIndex + 1).trim();
      if (key) {
        try {
          cookies[key] = decodeURIComponent(val);
        } catch (e) {
          cookies[key] = val;
        }
      }
    }
  });
  return cookies;
}

/**
 * Middleware: Attaches `req.authUser` when a valid signed token is present
 * either via the `alumni_session` HttpOnly cookie or `Authorization: Bearer <token>`.
 */
function attachAuthSession(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies[COOKIE_NAME];

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  req.authUser = verifyToken(token);
  next();
}

/**
 * Create a signed token payload for a given user DTO.
 */
function createSessionToken(user, remember = false) {
  const ttlSeconds = remember ? SESSION_TTL_SECONDS * 7 : SESSION_TTL_SECONDS;
  const token = signPayload({
    id: user.userId || user.id,
    profileId: user.profileId || user.id || null,
    email: user.email,
    userRole: user.userRole || 'alumni',
    name: user.name || user.fullName || 'Alumnus',
    exp: Date.now() + ttlSeconds * 1000
  });
  return { token, ttlSeconds };
}

/**
 * Issue a signed HttpOnly cookie for an authenticated user.
 */
function issueSessionCookie(res, user, remember = false) {
  const { token, ttlSeconds } = createSessionToken(user, remember);

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${ttlSeconds}`
  );
  return token;
}

/**
 * Clear the `alumni_session` cookie on logout.
 */
function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}

module.exports = {
  COOKIE_NAME,
  attachAuthSession,
  createSessionToken,
  verifyToken,
  issueSessionCookie,
  clearSessionCookie
};
