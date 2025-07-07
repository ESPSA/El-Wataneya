import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/sanitize.js';

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

router.put('/:id/profile', authenticate, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const data = sanitizeInput(req.body);
  await query('UPDATE users SET name=$1 WHERE id=$2', [data.name, req.params.id]);
  const { rows } = await query(
    'UPDATE artisans SET phone=$1,bio_ar=$2,bio_en=$3,location_ar=$4,location_en=$5,specialties=$6 WHERE user_id=$7 RETURNING *',
    [data.phone, data.bio.ar, data.bio.en, data.location.ar, data.location.en, JSON.stringify(data.specialties), req.params.id]
  );
  res.json(rows[0]);
}));

export default router;
