import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT * FROM offers WHERE status IN ('active','scheduled')");
  res.json(rows);
}));

export default router;
