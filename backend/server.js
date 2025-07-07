import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { query } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function generateTokens(user) {
  const accessToken = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = auth.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Authentication
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { name, email, password, type } = req.body;
  const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users(name, email, password, type) VALUES($1,$2,$3,$4) RETURNING id, name, email, type',
    [name, email, hashed, type]
  );
  res.status(201).json(result.rows[0]);
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password, type } = req.body;
  const result = await query('SELECT * FROM users WHERE email=$1 AND type=$2', [email, type]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const tokens = generateTokens(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, type: user.type }, ...tokens });
}));

app.post('/api/auth/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const result = await query('SELECT id, name, email, type FROM users WHERE id=$1', [payload.id]);
    const user = result.rows[0];
    const accessToken = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ user, accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}));

// Public products
app.get('/api/products', asyncHandler(async (req, res) => {
  const result = await query("SELECT * FROM products WHERE status='approved'");
  res.json(result.rows);
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const result = await query("SELECT * FROM products WHERE id=$1 AND status='approved'", [req.params.id]);
  const product = result.rows[0];
  if (!product) return res.status(404).json({ message: 'Not Found' });
  res.json(product);
}));

// Admin products (requires auth, simplified)
app.get('/api/admin/products', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const result = await query('SELECT * FROM products');
  res.json(result.rows);
}));

app.post('/api/admin/products', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { name_en, name_ar, category_id, image_urls, price_en, price_ar, origin_en, origin_ar, description_en, description_ar } = req.body;
  const result = await query(
    `INSERT INTO products(name_en,name_ar,category_id,image_urls,price_en,price_ar,origin_en,origin_ar,description_en,description_ar,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
    [name_en, name_ar, category_id, image_urls, price_en, price_ar, origin_en, origin_ar, description_en, description_ar]
  );
  res.status(201).json(result.rows[0]);
}));

app.put('/api/admin/products/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { status } = req.body;
  await query('UPDATE products SET status=$1 WHERE id=$2', [status, req.params.id]);
  res.json({ success: true });
}));

app.put('/api/admin/products/:id', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { name_en, name_ar, category_id, image_urls, price_en, price_ar, origin_en, origin_ar, description_en, description_ar } = req.body;
  const result = await query(
    `UPDATE products SET name_en=$1,name_ar=$2,category_id=$3,image_urls=$4,price_en=$5,price_ar=$6,origin_en=$7,origin_ar=$8,description_en=$9,description_ar=$10 WHERE id=$11 RETURNING *`,
    [name_en, name_ar, category_id, image_urls, price_en, price_ar, origin_en, origin_ar, description_en, description_ar, req.params.id]
  );
  res.json(result.rows[0]);
}));

app.delete('/api/admin/products/:id', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await query('DELETE FROM products WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
