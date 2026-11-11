/**
 * ============================================================================
 * Alumni Tracker — 5xx Server Error Guardian Middleware
 * ============================================================================
 * Express error-handling middleware (4 parameters: err, req, res, next)
 * Intercepts unhandled exceptions, database errors, and runtime failures:
 * - API / JSON clients: Returns JSON with status, error, and reason.
 * - Browser navigation: Redirects to the homepage ('/') with error parameters,
 *   keeping the user on the site and automatically popping up the error modal.
 * ============================================================================
 */

function serverErrorGuardian(err, req, res, next) {
  // If response headers have already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err.status && err.status >= 500 && err.status < 600)
    ? err.status
    : (err.statusCode && err.statusCode >= 500 && err.statusCode < 600)
      ? err.statusCode
      : 500;

  const method = req.method;
  const path = req.originalUrl || req.url;

  // Synthesize a human-readable diagnostic reason
  let reason = err.message || 'Beklenmedik bir sunucu hatası meydana geldi.';

  if (err.code === 'ECONNREFUSED') {
    reason = 'Veritabanı bağlantısı kurulamadı: Veritabanı servisi çevrimdışı veya bağlantı kabul etmiyor.';
  } else if (err.code === '23505') {
    reason = `Veritabanı benzersizlik kısıtı ihlali: ${err.detail || err.message}`;
  } else if (err.code === '23503') {
    reason = `Veritabanı yabancı anahtar ilişkisi ihlali: ${err.detail || err.message}`;
  }

  res.locals.errorReason = reason;
  res.locals.errorStack = err.stack;

  // Print stack trace to terminal
  console.error(`[5xx GUARDIAN] ${new Date().toISOString()} ${method} ${path} - Status: ${statusCode}`);
  console.error(`Reason: ${reason}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Pure API / AJAX check
  const acceptHeader = req.headers.accept || '';
  const isApi = path.startsWith('/api/') || 
                req.xhr || 
                (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html'));

  if (isApi) {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      error: 'Internal Server Error',
      method,
      path,
      reason,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      timestamp: new Date().toISOString()
    });
  }

  // Browser navigation: Keep user on the homepage and display the error modal on the site
  const redirectUrl = `/?error=${statusCode}&route=${encodeURIComponent(path)}&reason=${encodeURIComponent(reason)}`;
  return res.redirect(redirectUrl);
}

module.exports = serverErrorGuardian;
