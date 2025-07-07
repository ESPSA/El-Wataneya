import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT * FROM projects WHERE status='approved' AND is_active=true");
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM projects WHERE id=$1 AND status='approved' AND is_active=true", [req.params.id]);
  const project = rows[0];
  if (!project) return res.status(404).json({ message: 'Not Found' });
  res.json(project);
}));

router.get('/:artisanId/projects', authenticate, asyncHandler(async (req, res) => {
  const artisanId = req.params.artisanId;
  if (req.user.id !== artisanId) return res.status(403).json({ message: 'Forbidden' });
  const { rows } = await query('SELECT * FROM projects WHERE artisan_id=$1', [artisanId]);
  res.json(rows);
}));

router.get('/:artisanId/projects/:projectId', authenticate, asyncHandler(async (req, res) => {
  const { artisanId, projectId } = req.params;
  if (req.user.id !== artisanId) return res.status(403).json({ message: 'Forbidden' });
  const { rows } = await query('SELECT * FROM projects WHERE id=$1 AND artisan_id=$2', [projectId, artisanId]);
  const project = rows[0];
  if (!project) return res.status(404).json({ message: 'Not Found' });
  res.json(project);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { title, imageUrls, location, styleKey, style, productsUsed } = req.body;
  const { rows } = await query(
    'INSERT INTO projects(title_ar,title_en,image_urls,artisan_id,location_ar,location_en,style_key,style_ar,style_en,products_used,status,is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
    [title.ar, title.en, imageUrls, req.user.id, location.ar, location.en, styleKey, style.ar, style.en, productsUsed, 'pending', true]
  );
  res.status(201).json(rows[0]);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { rows: existingRows } = await query('SELECT artisan_id FROM projects WHERE id=$1', [projectId]);
  if (!existingRows.length || existingRows[0].artisan_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { title, imageUrls, location, styleKey, style, productsUsed } = req.body;
  const { rows } = await query(
    'UPDATE projects SET title_ar=$1,title_en=$2,image_urls=$3,location_ar=$4,location_en=$5,style_key=$6,style_ar=$7,style_en=$8,products_used=$9,status=$10 WHERE id=$11 RETURNING *',
    [title?.ar, title?.en, imageUrls, location?.ar, location?.en, styleKey, style?.ar, style?.en, productsUsed, 'pending', projectId]
  );
  res.json(rows[0]);
}));

router.put('/:id/activation', authenticate, asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { isActive } = req.body;
  const { rows: existingRows } = await query('SELECT artisan_id FROM projects WHERE id=$1', [projectId]);
  if (!existingRows.length || existingRows[0].artisan_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { rows } = await query('UPDATE projects SET is_active=$1 WHERE id=$2 RETURNING *', [isActive, projectId]);
  res.json(rows[0]);
}));

export default router;
