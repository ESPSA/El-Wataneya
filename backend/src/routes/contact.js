import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { sanitizeInput } from '../utils/sanitize.js';

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const data = sanitizeInput(req.body);
  await query(
    'INSERT INTO contact_messages(name,email,subject,message) VALUES($1,$2,$3,$4)',
    [data.name, data.email, data.subject, data.message]
  );
  res.json({ success: true });
}));

export default router;
