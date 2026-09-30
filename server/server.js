const express = require('express');
const path = require('path');
const os = require('os');
const multer = require('multer');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

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

// In-memory users dizisi (veritabanı yerine)
let users = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@alumni.edu', graduationYear: 2020, department: 'Bilgisayar Mühendisliği', company: 'Google', role: 'Software Engineer' },
  { id: 2, name: 'Elif Demir', email: 'elif@alumni.edu', graduationYear: 2019, department: 'Elektrik-Elektronik', company: 'Microsoft', role: 'Product Manager' },
  { id: 3, name: 'Mehmet Kaya', email: 'mehmet@alumni.edu', graduationYear: 2021, department: 'Endüstri Mühendisliği', company: 'Amazon', role: 'Data Analyst' },
  { id: 4, name: 'Zeynep Çelik', email: 'zeynep@alumni.edu', graduationYear: 2018, department: 'Bilgisayar Mühendisliği', company: 'Meta', role: 'Frontend Developer' },
  { id: 5, name: 'Can Öztürk', email: 'can@alumni.edu', graduationYear: 2022, department: 'Yazılım Mühendisliği', company: 'Apple', role: 'iOS Developer' },
  { id: 6, name: 'Ofe Emor Demiroz', email: 'ofe@alumni.edu', graduationYear: 2023, department: 'Hisarüstü', company: 'Ay Yapım', role: 'Cast Manager' }
];
let nextId = 7;

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

// GET /api/users → Tüm kullanıcıları listele
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});
// GET /api/users/:id → Tek kullanıcı getir
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: `ID ${id} ile kullanıcı bulunamadı`
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// DELETE /api/users/:id → Kullanıcı sil
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `ID ${id} ile kullanıcı bulunamadı`
    });
  }

  const deleted = users.splice(index, 1)[0];

  res.json({
    success: true,
    message: `${deleted.name} başarıyla silindi`,
    data: deleted
  });
});

// POST /api/users → Yeni kullanıcı ekle
app.post('/api/users', upload.none(), (req, res) => {
  const { name, email, graduationYear, department, company, role } = req.body;

  // Zorunlu alan kontrolü
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'name ve email alanları zorunludur'
    });
  }

  // Email tekrar kontrolü
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({
      success: false,
      error: 'Bu email adresi zaten kayıtlı'
    });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    graduationYear: graduationYear || null,
    department: department || null,
    company: company || null,
    role: role || null
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Kullanıcı başarıyla eklendi',
    data: newUser
  });
});
// PUT /api/users/:id → Kullanıcıyı tamamen güncelle (tüm alanlar zorunlu)
app.put('/api/users/:id', upload.none(), (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `ID ${id} ile kullanıcı bulunamadı`
    });
  }

  const { name, email, graduationYear, department, company, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'PUT isteğinde name ve email alanları zorunludur'
    });
  }

  // Email başka kullanıcıda var mı kontrol et
  const emailExists = users.find(u => u.email === email && u.id !== id);
  if (emailExists) {
    return res.status(409).json({
      success: false,
      error: 'Bu email adresi başka bir kullanıcıya ait'
    });
  }

  users[index] = {
    id,
    name,
    email,
    graduationYear: graduationYear || null,
    department: department || null,
    company: company || null,
    role: role || null
  };

  res.json({
    success: true,
    message: 'Kullanıcı tamamen güncellendi',
    data: users[index]
  });
});

// PATCH /api/users/:id → Kullanıcıyı kısmi güncelle (sadece gönderilen alanlar)
app.patch('/api/users/:id', upload.none(), (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `ID ${id} ile kullanıcı bulunamadı`
    });
  }

  const updates = req.body;

  // Email güncelleniyorsa başka kullanıcıda var mı kontrol et
  if (updates.email) {
    const emailExists = users.find(u => u.email === updates.email && u.id !== id);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Bu email adresi başka bir kullanıcıya ait'
      });
    }
  }

  // Sadece gönderilen alanları güncelle, id değiştirilemez
  const allowedFields = ['name', 'email', 'graduationYear', 'department', 'company', 'role'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      users[index][field] = updates[field];
    }
  });

  res.json({
    success: true,
    message: 'Kullanıcı kısmi güncellendi',
    data: users[index]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
