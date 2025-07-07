import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/sanitize.js';

const router = express.Router();
router.use(authenticate);

router.put('/:id/avatar', asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { newAvatarUrl } = sanitizeInput(req.body);
  const { rows } = await query(
    'UPDATE users SET avatar_url=$1 WHERE id=$2 RETURNING *',
    [newAvatarUrl, req.params.id]
  );
  res.json(rows[0]);
}));

export default router;
