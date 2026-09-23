const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// GET / → "ok" döndür
app.get('/', (req, res) => {
  res.send('ok');
});

// GET /hello → "Hello;World!" döndür
app.get('/hello', (req, res) => {
  res.send('Hello;World!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
