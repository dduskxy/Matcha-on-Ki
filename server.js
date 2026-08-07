import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

app.get('/api/menu', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  res.json(data);
});

app.post('/api/menu', (req, res) => {
  const newMenu = req.body;
  fs.writeFileSync(DB_FILE, JSON.stringify(newMenu, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
