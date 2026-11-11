/**
 * ============================================================================
 * Alumni Tracker — 404 Guardian Middleware
 * ============================================================================
 * Intercepts unhandled HTTP requests and redirects invalid requests:
 * - API / JSON clients: Returns JSON with status 404, method, path, and reason.
 * - Browser navigation: Redirects invalid requests to the generic 404 page ('/404'),
 *   which presents a branded, responsive 404 error template with diagnostic details.
 * ============================================================================
 */

function notFoundGuardian(req, res, next) {
  const method = req.method;
  const path = req.originalUrl || req.url;

  // Prevent infinite redirect loop if /404 itself is requested
  if (path === '/404' || path.startsWith('/404?')) {
    return next();
  }

  // Determine helpful diagnostic reason based on path and method
  let reason = `Aradığınız '${path}' sayfası sitemizde mevcut değil veya taşınmış olabilir.`;

  if (path.startsWith('/api/')) {
    reason = `Endpoint '${method} ${path}' was not found. Please check the URL path, HTTP method, or consult the API specification at /api/swagger.`;
  }

  res.locals.errorReason = reason;

  // Pure API / AJAX check: only return JSON if it's an /api/ path or client explicitly wants JSON without HTML
  const acceptHeader = req.headers.accept || '';
  const isApi = path.startsWith('/api/') || 
                req.xhr || 
                (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html'));

  if (isApi) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      method,
      path,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  // Browser navigation: Redirect invalid request to the generic 404 page
  const redirectUrl = `/404?route=${encodeURIComponent(path)}&reason=${encodeURIComponent(reason)}`;
  return res.redirect(redirectUrl);
}

module.exports = notFoundGuardian;
