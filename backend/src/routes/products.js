import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT * FROM products WHERE status='approved'");
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM products WHERE id=$1 AND status='approved'", [req.params.id]);
  const product = rows[0];
  if (!product) return res.status(404).json({ message: 'Not Found' });
  res.json(product);
}));

export default router;
