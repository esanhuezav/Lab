const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = process.env.DATA_FILE || 'contacts.json';
const DATA_PATH = path.join(DATA_DIR, DATA_FILE);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]', 'utf8');
}

function readContacts() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo contactos:', e.message);
    return [];
  }
}

function writeContacts(contacts) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(contacts, null, 2), 'utf8');
}

app.get('/api/contacts', (_req, res) => {
  ensureStorage();
  return res.json(readContacts());
});

app.post('/api/contacts', (req, res) => {
  const { nombre, email, telefono } = req.body || {};
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son requeridos' });
  }
  ensureStorage();
  const contacts = readContacts();
  const newContact = {
    id: Date.now().toString(),
    nombre,
    email,
    telefono: telefono || ''
  };
  contacts.push(newContact);
  writeContacts(contacts);
  return res.status(201).json(newContact);
});

app.delete('/api/contacts/:id', (req, res) => {
  ensureStorage();
  const contacts = readContacts();
  const filtered = contacts.filter(c => c.id !== req.params.id);
  writeContacts(filtered);
  return res.status(204).end();
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  ensureStorage();
  console.log(`Agenda escuchando en http://localhost:${PORT}`);
});