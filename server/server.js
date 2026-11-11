const express = require('express');
const path = require('path');
const os = require('os');
const multer = require('multer');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
// Import Middleware
const loggerMiddleware = require('./middleware/logger');
const notFoundGuardian = require('./middleware/notFoundGuardian');
const serverErrorGuardian = require('./middleware/serverErrorGuardian');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const apiUserRoutes = require('./routes/apiUserRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const apiAnnouncementRoutes = require('./routes/apiAnnouncementRoutes');
const jobRoutes = require('./routes/jobRoutes');
const apiJobRoutes = require('./routes/apiJobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const apiApplicationRoutes = require('./routes/apiApplicationRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI → /api/swagger
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Alumni Tracker API — Swagger',
  customfavIcon: '',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON endpoint
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================================================
// Application Routes (Mounted to Modular Routers)
// ============================================================================
app.use('/api/users', apiUserRoutes);
app.use('/api/announcements', apiAnnouncementRoutes);
app.use('/api/jobs', apiJobRoutes);
app.use('/api/applications', apiApplicationRoutes);
app.use('/', userRoutes);
app.use('/', announcementRoutes);
app.use('/', jobRoutes);
app.use('/', applicationRoutes);

// GET /hello/:name → Returns greeting message
app.get('/hello/:name', (req, res) => {
  res.send(`Hello,${req.params.name}!`);
});

// GET /sum/:number1/:number2 → Returns sum of two numbers
app.get('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);
  res.send(`${num1 + num2}`);
});

// GET /api/trigger-500 → Diagnostic endpoint to test 5xx Guardian
app.get('/api/trigger-500', (req, res, next) => {
  const err = new Error('Simulated database deadlock or unhandled exception during critical transaction.');
  err.status = 500;
  next(err);
});

// GET /error-test → Diagnostic web endpoint to test HTML 5xx Guardian
app.get('/error-test', (req, res, next) => {
  const err = new Error('Template rendering failed: Server could not render dynamic view.');
  err.status = 500;
  next(err);
});

// GET /api/health → Comprehensive server health status (JSON)
app.get('/api/health', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

  const cpus = os.cpus();
  const cpuLoad = cpus.map((cpu, i) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return {
      core: i,
      model: cpu.model,
      speed: `${cpu.speed} MHz`,
      usage: `${(((total - idle) / total) * 100).toFixed(1)}%`
    };
  });

  const uptimeSec = process.uptime();
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = Math.floor(uptimeSec % 60);

  const processMemory = process.memoryUsage();

  // Status classification: memory > 90% → critical, > 75% → warning
  let overallStatus = 'healthy';
  const checks = [];

  if (parseFloat(memUsagePercent) > 90) {
    overallStatus = 'critical';
    checks.push({ name: 'memory', status: 'critical', message: `System memory at ${memUsagePercent}% utilization` });
  } else if (parseFloat(memUsagePercent) > 75) {
    overallStatus = 'warning';
    checks.push({ name: 'memory', status: 'warning', message: `System memory at ${memUsagePercent}% utilization` });
  } else {
    checks.push({ name: 'memory', status: 'healthy', message: `System memory at ${memUsagePercent}% utilization` });
  }

  checks.push({ name: 'server', status: 'healthy', message: 'Express server running normally' });

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    server: {
      name: 'alumni-tracker-server',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      uptime: {
        raw: `${uptimeSec.toFixed(0)}s`,
        formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      osUptime: `${Math.floor(os.uptime() / 3600)} hours`
    },
    memory: {
      system: {
        total: formatBytes(totalMem),
        used: formatBytes(usedMem),
        free: formatBytes(freeMem),
        usagePercent: `${memUsagePercent}%`
      },
      process: {
        rss: formatBytes(processMemory.rss),
        heapTotal: formatBytes(processMemory.heapTotal),
        heapUsed: formatBytes(processMemory.heapUsed),
        external: formatBytes(processMemory.external)
      }
    },
    cpu: {
      count: cpus.length,
      cores: cpuLoad
    },
    runtime: {
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      pid: process.pid
    }
  });
});

// 404 Guardian Middleware (Catches unhandled routes and returns reason)
app.use(notFoundGuardian);

// 5xx Server Error Guardian Middleware (Catches internal exceptions and returns reason)
app.use(serverErrorGuardian);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
