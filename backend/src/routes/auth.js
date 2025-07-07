import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const generateToken = (user, secret, expiresIn) => jwt.sign(user, secret, { expiresIn });

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, type } = req.body;
  const { rows } = await query('SELECT * FROM users WHERE email=$1 AND type=$2', [email, type]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = generateToken({ id: user.id, type: user.type }, process.env.JWT_SECRET, '15m');
  const refreshToken = generateToken({ id: user.id }, process.env.REFRESH_SECRET, '7d');
  await query('INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES ($1,$2,now()+interval ''7 days'')', [user.id, refreshToken]);
  res.json({ user, accessToken, refreshToken });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, type } = req.body;
  const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rowCount) return res.status(409).json({ message: 'User with this email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query('INSERT INTO users(name,email,password,type) VALUES($1,$2,$3,$4) RETURNING *', [name, email, hashed, type]);
  res.status(201).json(rows[0]);
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const { rows } = await query('SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > now()', [refreshToken]);
  const tokenRecord = rows[0];
  if (!tokenRecord) return res.status(401).json({ message: 'Invalid refresh token' });
  const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  const { rows: userRows } = await query('SELECT * FROM users WHERE id=$1', [payload.id]);
  const user = userRows[0];
  const accessToken = generateToken({ id: user.id, type: user.type }, process.env.JWT_SECRET, '15m');
  res.json({ user, accessToken });
}));

export default router;
