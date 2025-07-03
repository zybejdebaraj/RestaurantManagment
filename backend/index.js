const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  // Add image column to restaurants table if it doesn't exist
  db.query(`
    ALTER TABLE restaurants 
    ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT '/images/restaurant-placeholder.jpg'
  `, (err) => {
    if (err) {
      console.error('Error adding image column:', err);
    }
  });
});

app.use(cors());
app.use(bodyParser.json());

// Import routes
const menuRoutes = require('./routes/menus')(db);
app.use('/menus', menuRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Restaurant Routes
// GET all restaurants
app.get('/restaurant', (req, res) => {
  db.query('SELECT * FROM restaurants', (err, results) => {
    if (err) {
      console.error('Error fetching restaurants:', err);
      res.status(500).json({ error: 'Failed to fetch restaurants' });
      return;
    }
    res.json(results);
  });
});

// GET single restaurant
app.get('/restaurant/:id', (req, res) => {
  db.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching restaurant:', err);
      res.status(500).json({ error: 'Failed to fetch restaurant' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json(results[0]);
  });
});

// POST new restaurant
app.post('/restaurant', (req, res) => {
  const { name, address, contact, image } = req.body;
  db.query(
    'INSERT INTO restaurants (name, address, contact, image) VALUES (?, ?, ?, ?)',
    [name, address, contact, image || '/images/restaurant-placeholder.jpg'],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, name, address, contact, image });
    }
  );
});

// PUT update restaurant
app.put('/restaurant/:id', (req, res) => {
  const { name, address, contact, image } = req.body;
  db.query(
    'UPDATE restaurants SET name = ?, address = ?, contact = ?, image = ? WHERE id = ?',
    [name, address, contact, image, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Restaurant updated successfully' });
    }
  );
});

// delete restaurant
app.delete('/restaurant/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM restaurants WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting restaurant:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  });
});

// POST new user (sign up)
app.post('/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ id: result.insertId, name, email });
  });
});

// GET user (login)
app.get('/users', (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(401).json([]);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.error(`Backend running on http://localhost:${PORT}`);
});
