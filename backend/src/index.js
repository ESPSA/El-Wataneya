import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import artisanRoutes from './routes/artisans.js';
import projectRoutes from './routes/projects.js';
import articleRoutes from './routes/articles.js';
import offerRoutes from './routes/offers.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(csurf({ cookie: true }));

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
