-- PostgreSQL schema for Elwataneya

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  type TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  permissions JSONB
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_urls TEXT[] NOT NULL,
  price_en TEXT NOT NULL,
  price_ar TEXT NOT NULL,
  origin_en TEXT NOT NULL,
  origin_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS artisan_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  location_en TEXT,
  location_ar TEXT,
  experience INTEGER,
  specialties TEXT[],
  is_certified BOOLEAN DEFAULT FALSE,
  bio_en TEXT,
  bio_ar TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  artisan_id INTEGER REFERENCES users(id),
  location_en TEXT,
  location_ar TEXT,
  category_id INTEGER REFERENCES categories(id),
  products_used INTEGER[],
  status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  image_url TEXT,
  author_id INTEGER REFERENCES users(id),
  author_name TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  product_ids INTEGER[],
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active'
);
