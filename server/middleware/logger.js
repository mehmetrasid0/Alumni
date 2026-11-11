/**
 * ============================================================================
 * Alumni Tracker — HTTP Request Logger Middleware
 * ============================================================================
 * 1. Writes live HTTP telemetry to terminal:
 *    Format: <HH:MM:SS> <METHOD> <ROUTE> <STATUS_CODE> <DURATION>ms
 *    Example: 10:20:30 POST /user 201 18ms
 * 
 * 2. Persists all 4xx and 5xx errors to logs/error.logs file:
 *    Records timestamp, method, route, status code, duration, IP,
 *    and detailed diagnostic reason & stack trace for future post-mortem inspection.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.error('[LOGGER] Could not create logs directory:', err.message);
  }
}

const errorLogPath = path.join(logsDir, 'error.logs');

/**
 * Append formatted error record to logs/error.logs
 */
function appendErrorLog(entry) {
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] [STATUS ${entry.status}] ${entry.method} ${entry.route} (${entry.duration}ms)`;

  if (entry.ip) {
    line += ` - Client: ${entry.ip}`;
  }
  if (entry.reason) {
    line += `\n  Reason: ${entry.reason}`;
  }
  if (entry.stack) {
    line += `\n  Stack: ${entry.stack}`;
  }
  line += '\n' + '-'.repeat(80) + '\n';

  fs.appendFile(errorLogPath, line, 'utf8', (err) => {
    if (err) {
      console.error('[LOGGER] Failed to append to logs/error.logs:', err.message);
    }
  });
}

function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const now = new Date();
    const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const method = req.method.toUpperCase();
    const route = req.originalUrl || req.url;
    const status = res.statusCode;

    // 1. Live stdout / terminal stream
    console.log(`${time} ${method} ${route} ${status} ${duration}ms`);

    // 2. File persistence: Save all 4xx and 5xx errors to logs/error.logs
    if (status >= 400) {
      appendErrorLog({
        status,
        method,
        route,
        duration,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        reason: res.locals.errorReason || null,
        stack: res.locals.errorStack || null
      });
    }
  });

  next();
}

module.exports = loggerMiddleware;
module.exports.appendErrorLog = appendErrorLog;
module.exports.errorLogPath = errorLogPath;
