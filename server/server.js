const express = require('express');
const path = require('path');
const os = require('os');
const multer = require('multer');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer(); // form-data (multipart/form-data) desteği

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

// GET /alumni → Mezunlar arayüzü
app.get('/alumni', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'alumni.html'));
});

// Note: User data store and state management are encapsulated within the User Model (./models/User.js)

// GET / → Ana sayfa (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /about → Hakkında sayfası
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

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
// User CRUD Controller Endpoints (Delegating to User Model)
// ============================================================================

// GET /api/users → List all users (supports optional filtering)
app.get('/api/users', (req, res) => {
  const data = User.findAll(req.query);
  res.json({
    success: true,
    count: data.length,
    data
  });
});

// GET /api/users/:id → Get single user by ID
app.get('/api/users/:id', (req, res) => {
  const user = User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `ID ${req.params.id} ile kullanıcı bulunamadı`
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// DELETE /api/users/:id → Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const deleted = User.delete(req.params.id);
    res.json({
      success: true,
      message: `${deleted.name} başarıyla silindi`,
      data: deleted
    });
  } catch (err) {
    res.status(err.statusCode || 404).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/users → Create new user
app.post('/api/users', upload.none(), (req, res) => {
  try {
    const newUser = User.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla eklendi',
      data: newUser
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message
    });
  }
});

// PUT /api/users/:id → Fully update user
app.put('/api/users/:id', upload.none(), (req, res) => {
  try {
    const updated = User.update(req.params.id, req.body, false);
    res.json({
      success: true,
      message: 'Kullanıcı tamamen güncellendi',
      data: updated
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message
    });
  }
});

// PATCH /api/users/:id → Partially update user
app.patch('/api/users/:id', upload.none(), (req, res) => {
  try {
    const updated = User.update(req.params.id, req.body, true);
    res.json({
      success: true,
      message: 'Kullanıcı kısmi güncellendi',
      data: updated
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
