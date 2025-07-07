import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT * FROM articles WHERE status='published'");
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM articles WHERE id=$1 AND status='published'", [req.params.id]);
  const article = rows[0];
  if (!article) return res.status(404).json({ message: 'Not Found' });
  res.json(article);
}));

export default router;
