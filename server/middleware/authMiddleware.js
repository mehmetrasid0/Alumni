/**
 * ============================================================================
 * Alumni Tracker — Authentication & RBAC Authorization Middleware
 * ============================================================================
 * Architectural Layer: MIDDLEWARE (Authentication, RBAC & Ownership Scoping)
 * Specification Reference: DDD.md Section 8 (Authorization, User Roles & Data Security)
 *
 * Exports:
 *   - requireAuth               : Ensures valid req.authUser (401 API / redirect /login)
 *   - requireRole(...roles)     : Restricts route to allowed users.role values (403)
 *   - requireAdmin              : Shorthand for requireRole('admin')
 *   - requireStaff              : Shorthand for requireRole('admin', 'coordinator')
 *   - requireOwnership(fn, opt) : Enforces record ownership unless bypassRoles match (403)
 *   - preventRoleEscalation     : Blocks non-admin attempts to set userRole/user_role (403)
 *   - Resolvers                 : resolveParamUserOwner, resolveAnnouncementOwner, resolveApplicationOwner
 * ============================================================================
 */

const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Application = require('../models/Application');

/**
 * Detect whether the incoming HTTP request expects a JSON/API response
 * rather than an HTML browser redirect. Matches guardian middleware conventions.
 */
function isApiRequest(req) {
  const urlPath = req.originalUrl || req.url || '';
  const acceptHeader = req.headers.accept || '';
  return (
    urlPath.startsWith('/api/') ||
    req.xhr ||
    (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html'))
  );
}

/**
 * Emit a standardized 401/403/404 response and persist diagnostic context
 * to `res.locals.errorReason` so `loggerMiddleware` appends it to `logs/error.logs`.
 */
function sendAuthError(req, res, statusCode, errorTitle, message) {
  const path = req.originalUrl || req.url || '/';
  res.locals.errorReason = message;

  if (isApiRequest(req)) {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      error: errorTitle,
      message,
      path,
      timestamp: new Date().toISOString()
    });
  }

  if (statusCode === 401) {
    return res.redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return res.redirect(
    `/?error=${statusCode}&route=${encodeURIComponent(path)}&reason=${encodeURIComponent(message)}`
  );
}

/**
 * Require a valid signed session (`alumni_session` cookie or Bearer token).
 * Rejects unauthenticated callers with 401 Unauthorized (API) or /login redirect (Browser).
 */
function requireAuth(req, res, next) {
  if (!req.authUser || !req.authUser.id || !req.authUser.userRole) {
    return sendAuthError(
      req,
      res,
      401,
      'Unauthorized',
      'Authentication required. Please sign in at /login or supply a valid session token.'
    );
  }
  return next();
}

/**
 * Require the authenticated user to hold one of the specified system roles
 * (`'alumni'`, `'coordinator'`, `'admin'`).
 */
function requireRole(...roles) {
  const allowedRoles = roles.flat().map(r => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.authUser || !req.authUser.id || !req.authUser.userRole) {
      return sendAuthError(
        req,
        res,
        401,
        'Unauthorized',
        'Authentication required before role authorization can proceed.'
      );
    }

    const actorRole = String(req.authUser.userRole).toLowerCase();
    if (!allowedRoles.includes(actorRole)) {
      return sendAuthError(
        req,
        res,
        403,
        'Forbidden',
        `Access denied for role '${actorRole}'. Required role: ${allowedRoles.join(' or ')}.`
      );
    }

    return next();
  };
}

const requireAdmin = requireRole('admin');
const requireStaff = requireRole('admin', 'coordinator');

/**
 * Verify resource ownership against an async/sync resolver function unless the
 * authenticated actor belongs to `bypassRoles` (defaults to `['admin']`).
 *
 * @param {Function} resolveOwnerId - (req) => ownerId | string[] | null
 * @param {Object} [options]
 * @param {string[]} [options.bypassRoles=['admin']]
 * @param {string} [options.resourceLabel='resource']
 */
function requireOwnership(resolveOwnerId, options = {}) {
  const bypassRoles = (options.bypassRoles || ['admin']).map(r => String(r).toLowerCase());
  const resourceLabel = options.resourceLabel || 'resource';

  return async (req, res, next) => {
    if (!req.authUser || !req.authUser.id || !req.authUser.userRole) {
      return sendAuthError(
        req,
        res,
        401,
        'Unauthorized',
        'Authentication required to access this protected resource.'
      );
    }

    const actorRole = String(req.authUser.userRole).toLowerCase();
    if (bypassRoles.includes(actorRole)) {
      return next();
    }

    try {
      const resolved = await resolveOwnerId(req);
      if (resolved === null || resolved === undefined) {
        return sendAuthError(
          req,
          res,
          404,
          'Not Found',
          `Target ${resourceLabel} could not be found.`
        );
      }

      const ownerIds = (Array.isArray(resolved) ? resolved : [resolved])
        .filter(Boolean)
        .map(v => String(v));

      const actorIds = [req.authUser.id, req.authUser.profileId]
        .filter(Boolean)
        .map(v => String(v));

      const isOwner = ownerIds.some(ownerId => actorIds.includes(ownerId));
      if (!isOwner) {
        return sendAuthError(
          req,
          res,
          403,
          'Forbidden',
          `You do not have permission to access or modify another user's ${resourceLabel}.`
        );
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Reject non-admin attempts to escalate system authorization role (`userRole` / `user_role`)
 * during profile update requests. Leaves professional `jobTitle` (`role`) untouched.
 */
function preventRoleEscalation(req, res, next) {
  if (!req.authUser) return next();

  const actorRole = String(req.authUser.userRole || '').toLowerCase();
  const body = req.body || {};
  const requestedSystemRole = body.userRole || body.user_role;

  if (requestedSystemRole !== undefined && actorRole !== 'admin') {
    const normalizedRequested = String(requestedSystemRole).trim().toLowerCase();
    if (normalizedRequested && normalizedRequested !== actorRole) {
      return sendAuthError(
        req,
        res,
        403,
        'Forbidden',
        'Modifying system authorization role (userRole) requires administrator privileges.'
      );
    }
  }

  return next();
}

// ============================================================================
// Domain Ownership Resolvers
// ============================================================================

async function resolveParamUserOwner(req) {
  const targetId = req.params.userId || req.params.id;
  if (!targetId) return null;
  const user = await User.findById(targetId);
  if (!user) return null;
  return [user.userId, user.id].filter(Boolean);
}

async function resolveAnnouncementOwner(req) {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return null;
  return announcement.authorId;
}

async function resolveApplicationOwner(req) {
  const application = await Application.findById(req.params.id);
  if (!application) return null;
  return application.applicantId;
}

/**
 * Build role-aware dynamic navigation items for the active user session.
 * Mirrors DDD.md Section 8.2 RBAC permissions (`guest`, `alumni`, `coordinator`, `admin`).
 */
function getNavigationByRole(user) {
  const role = user && user.userRole ? String(user.userRole).trim().toLowerCase() : 'guest';
  const selfId = user ? (user.userId || user.profileId || user.id) : null;

  if (role === 'admin') {
    return [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Mezunlar', href: '/users' },
      { label: 'Kariyer', href: '/jobs' },
      { label: 'Başvurular', href: '/applications' },
      { label: 'Duyurular', href: '/announcements' },
      { label: 'Profilim', href: '/profile' },
      { label: 'Swagger API', href: '/api/swagger', target: '_blank' },
      { label: 'Yönetim Paneli', href: '/admin', isCta: true }
    ];
  }

  if (role === 'coordinator') {
    return [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Mezunlar', href: '/users' },
      { label: 'Kariyer', href: '/jobs' },
      { label: 'İlan Ekle', href: '/jobs/create' },
      { label: 'Başvurular', href: '/applications' },
      { label: 'Duyurular', href: '/announcements' },
      { label: 'Profilim', href: '/profile' },
      { label: 'Duyuru Yaz', href: '/announcements/create', isCta: true }
    ];
  }

  if (role === 'alumni') {
    return [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Mezunlar', href: '/users' },
      { label: 'Kariyer', href: '/jobs' },
      { label: 'Başvurularım', href: '/applications' },
      { label: 'Duyurular', href: '/announcements' },
      { label: 'Hakkında', href: '/about' },
      { label: 'Profilim', href: '/profile', isCta: true }
    ];
  }

  // Anonymous / Guest navigation
  return [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Mezunlar', href: '/users' },
    { label: 'Kariyer', href: '/jobs' },
    { label: 'Duyurular', href: '/announcements' },
    { label: 'Hakkında', href: '/about' },
    { label: 'Kayıt Ol', href: '/register', isCta: true }
  ];
}

module.exports = {
  isApiRequest,
  sendAuthError,
  requireAuth,
  requireRole,
  requireAdmin,
  requireStaff,
  requireOwnership,
  preventRoleEscalation,
  resolveParamUserOwner,
  resolveAnnouncementOwner,
  resolveApplicationOwner,
  getNavigationByRole
};
