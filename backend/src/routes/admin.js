import express from 'express';
import asyncHandler from 'express-async-handler';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sanitizeInput } from '../utils/sanitize.js';

const router = express.Router();
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
});

const ensurePrimary = asyncHandler(async (req, _res, next) => {
  const { rows } = await query('SELECT is_primary FROM users WHERE id=$1', [req.user.id]);
  if (!rows[0]?.is_primary) return res.status(403).json({ message: 'Primary admin only' });
  next();
});

// Products
router.get('/products', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM products');
  res.json(rows);
}));

router.post('/products', asyncHandler(async (req, res) => {
  const p = sanitizeInput(req.body);
  const { rows } = await query(
    'INSERT INTO products(name_ar,name_en,category_key,category_ar,category_en,image_urls,price_ar,price_en,origin_ar,origin_en,description_ar,description_en,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
    [p.name.ar, p.name.en, p.categoryKey, p.category.ar, p.category.en, p.imageUrls, p.price.ar, p.price.en, p.origin.ar, p.origin.en, p.description.ar, p.description.en, 'pending']
  );
  res.status(201).json(rows[0]);
}));

router.get('/products/:id', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM products WHERE id=$1', [req.params.id]);
  const product = rows[0];
  if (!product) return res.status(404).json({ message: 'Not Found' });
  res.json(product);
}));

router.put('/products/:id', asyncHandler(async (req, res) => {
  const p = sanitizeInput(req.body);
  const { id } = req.params;
  const { rows } = await query(
    'UPDATE products SET name_ar=$1,name_en=$2,category_key=$3,category_ar=$4,category_en=$5,image_urls=$6,price_ar=$7,price_en=$8,origin_ar=$9,origin_en=$10,description_ar=$11,description_en=$12 WHERE id=$13 RETURNING *',
    [p.name?.ar, p.name?.en, p.categoryKey, p.category?.ar, p.category?.en, p.imageUrls, p.price?.ar, p.price?.en, p.origin?.ar, p.origin?.en, p.description?.ar, p.description?.en, id]
  );
  res.json(rows[0]);
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

// Projects
router.get('/projects', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM projects');
  res.json(rows);
}));

router.post('/projects', asyncHandler(async (req, res) => {
  const p = sanitizeInput(req.body);
  const { rows } = await query(
    'INSERT INTO projects(title_ar,title_en,image_urls,artisan_id,location_ar,location_en,style_key,style_ar,style_en,products_used,status,is_active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
    [p.title.ar, p.title.en, p.imageUrls, p.artisanId, p.location.ar, p.location.en, p.styleKey, p.style.ar, p.style.en, p.productsUsed, 'pending', true]
  );
  res.status(201).json(rows[0]);
}));

router.get('/projects/:id', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
  const project = rows[0];
  if (!project) return res.status(404).json({ message: 'Not Found' });
  res.json(project);
}));

router.put('/projects/:id', asyncHandler(async (req, res) => {
  const p = sanitizeInput(req.body);
  const { id } = req.params;
  const { rows } = await query(
    'UPDATE projects SET title_ar=$1,title_en=$2,image_urls=$3,artisan_id=$4,location_ar=$5,location_en=$6,style_key=$7,style_ar=$8,style_en=$9,products_used=$10 WHERE id=$11 RETURNING *',
    [p.title?.ar, p.title?.en, p.imageUrls, p.artisanId, p.location?.ar, p.location?.en, p.styleKey, p.style?.ar, p.style?.en, p.productsUsed, id]
  );
  res.json(rows[0]);
}));

router.put('/projects/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await query('UPDATE projects SET status=$1 WHERE id=$2', [status, id]);
  res.json({ success: true });
}));

router.delete('/projects/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM projects WHERE id=$1', [req.params.id]);
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

// Admins (primary admin only)
router.get('/admins', ensurePrimary, asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT * FROM users WHERE type='admin' AND is_primary=false");
  res.json(rows);
}));

router.post('/admins', ensurePrimary, asyncHandler(async (req, res) => {
  const d = sanitizeInput(req.body);
  const { rows } = await query(
    "INSERT INTO users(name,email,password,type,is_primary) VALUES($1,$2,$3,'admin',false) RETURNING *",
    [d.name, d.email, d.password]
  );
  res.status(201).json(rows[0]);
}));

router.delete('/admins/:id', ensurePrimary, asyncHandler(async (req, res) => {
  await query('DELETE FROM users WHERE id=$1 AND type=\'admin\'', [req.params.id]);
  res.json({ success: true });
}));

// Offers
router.post('/offers', asyncHandler(async (req, res) => {
  const o = sanitizeInput(req.body);
  const { rows } = await query(
    'INSERT INTO offers(title_ar,title_en,description_ar,description_en,discount_percentage,product_ids,start_date,end_date,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [o.title.ar, o.title.en, o.description.ar, o.description.en, o.discountPercentage, o.productIds, o.startDate, o.endDate, o.status]
  );
  res.status(201).json(rows[0]);
}));

router.delete('/offers/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM offers WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

// Articles
router.get('/articles', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM articles');
  res.json(rows);
}));

router.post('/articles', asyncHandler(async (req, res) => {
  const a = sanitizeInput(req.body);
  const { rows } = await query(
    'INSERT INTO articles(title_ar,title_en,content_ar,content_en,summary_ar,summary_en,image_url,author_id,author_name,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [a.title.ar, a.title.en, a.content.ar, a.content.en, a.summary.ar, a.summary.en, a.imageUrl, a.authorId, a.authorName, a.status]
  );
  res.status(201).json(rows[0]);
}));

router.get('/articles/:id', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM articles WHERE id=$1', [req.params.id]);
  const article = rows[0];
  if (!article) return res.status(404).json({ message: 'Not Found' });
  res.json(article);
}));

router.put('/articles/:id', asyncHandler(async (req, res) => {
  const a = sanitizeInput(req.body);
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
