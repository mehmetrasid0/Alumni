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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
