const express = require('express');
const path = require('path');
const os = require('os');
const multer = require('multer');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const User = require('./models/User');
const UserController = require('./controllers/UserController');
const ApiUserController = require('./controllers/ApiUserController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer(); // multipart/form-data support

// Middleware
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
// Web View Controller Endpoints (UserController)
// ============================================================================
app.get('/', (req, res) => UserController.home(req, res));
app.get('/about', (req, res) => UserController.about(req, res));
app.get('/alumni', (req, res) => UserController.index(req, res));
app.get('/users/:id', (req, res) => UserController.show(req, res));
app.post('/users', upload.none(), (req, res) => UserController.store(req, res));
app.post('/users/:id/update', upload.none(), (req, res) => UserController.update(req, res));
app.post('/users/:id/delete', (req, res) => UserController.destroy(req, res));

// GET /hello/:name → "Hello,{name}!" döndür
app.get('/hello/:name', (req, res) => {
  res.send(`Hello,${req.params.name}!`);
});

// GET /sum/:number1/:number2 → iki sayının toplamını döndür
app.get('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);
  res.send(`${num1 + num2}`);
});

// GET /api/health → Kapsamlı sunucu sağlık durumu (JSON)
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

  // Durum belirleme: bellek %90+ → critical, %75+ → warning
  let overallStatus = 'healthy';
  const checks = [];

  if (parseFloat(memUsagePercent) > 90) {
    overallStatus = 'critical';
    checks.push({ name: 'memory', status: 'critical', message: `Sistem belleği %${memUsagePercent} kullanımda` });
  } else if (parseFloat(memUsagePercent) > 75) {
    overallStatus = 'warning';
    checks.push({ name: 'memory', status: 'warning', message: `Sistem belleği %${memUsagePercent} kullanımda` });
  } else {
    checks.push({ name: 'memory', status: 'healthy', message: `Sistem belleği %${memUsagePercent} kullanımda` });
  }

  checks.push({ name: 'server', status: 'healthy', message: 'Express sunucusu çalışıyor' });

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
        formatted: `${days}g ${hours}sa ${minutes}dk ${seconds}sn`
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      osUptime: `${Math.floor(os.uptime() / 3600)} saat`
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

// ============================================================================
// REST API Controller Endpoints (ApiUserController)
// ============================================================================
app.get('/api/users', (req, res) => ApiUserController.getAll(req, res));
app.get('/api/users/:id', (req, res) => ApiUserController.getById(req, res));
app.post('/api/users', upload.none(), (req, res) => ApiUserController.create(req, res));
app.put('/api/users/:id', upload.none(), (req, res) => ApiUserController.update(req, res));
app.patch('/api/users/:id', upload.none(), (req, res) => ApiUserController.patch(req, res));
app.delete('/api/users/:id', (req, res) => ApiUserController.delete(req, res));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
