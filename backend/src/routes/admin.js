import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Products
router.get('/products', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM products');
  res.json(rows);
}));

router.post('/products', asyncHandler(async (req, res) => {
  const p = req.body;
  const { rows } = await query(
    'INSERT INTO products(name_ar,name_en,category_key,category_ar,category_en,image_urls,price_ar,price_en,origin_ar,origin_en,description_ar,description_en,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
    [p.name.ar, p.name.en, p.categoryKey, p.category.ar, p.category.en, p.imageUrls, p.price.ar, p.price.en, p.origin.ar, p.origin.en, p.description.ar, p.description.en, 'pending']
  );
  res.status(201).json(rows[0]);
}));

router.put('/products/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await query('UPDATE products SET status=$1 WHERE id=$2', [status, id]);
  res.json({ success: true });
}));

router.delete('/products/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM products WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

// Users
router.get('/users', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM users');
  res.json(rows);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

// Articles
router.get('/articles', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM articles');
  res.json(rows);
}));

router.post('/articles', asyncHandler(async (req, res) => {
  const a = req.body;
  const { rows } = await query(
    'INSERT INTO articles(title_ar,title_en,content_ar,content_en,summary_ar,summary_en,image_url,author_id,author_name,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [a.title.ar, a.title.en, a.content.ar, a.content.en, a.summary.ar, a.summary.en, a.imageUrl, a.authorId, a.authorName, a.status]
  );
  res.status(201).json(rows[0]);
}));

router.put('/articles/:id', asyncHandler(async (req, res) => {
  const a = req.body;
  const { id } = req.params;
  const { rows } = await query(
    'UPDATE articles SET title_ar=$1,title_en=$2,content_ar=$3,content_en=$4,summary_ar=$5,summary_en=$6,image_url=$7,status=$8,updated_at=now() WHERE id=$9 RETURNING *',
    [a.title?.ar, a.title?.en, a.content?.ar, a.content?.en, a.summary?.ar, a.summary?.en, a.imageUrl, a.status, id]
  );
  res.json(rows[0]);
}));

router.delete('/articles/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM articles WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

export default router;
