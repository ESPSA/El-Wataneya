import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM artisans JOIN users ON users.id = artisans.user_id');
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM artisans JOIN users ON users.id = artisans.user_id WHERE user_id=$1', [req.params.id]);
  const artisan = rows[0];
  if (!artisan) return res.status(404).json({ message: 'Not Found' });
  const projects = await query("SELECT * FROM projects WHERE artisan_id=$1 AND is_active=true AND status='approved'", [req.params.id]);
  artisan.projects = projects.rows;
  res.json(artisan);
}));

export default router;
