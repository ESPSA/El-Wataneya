-- PostgreSQL schema for Elwataneya
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user','artisan','admin')),
  permissions JSONB,
  is_primary BOOLEAN DEFAULT false,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS artisans (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  location_ar TEXT,
  location_en TEXT,
  experience INT,
  specialties JSONB,
  is_certified BOOLEAN DEFAULT false,
  bio_ar TEXT,
  bio_en TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT,
  name_en TEXT,
  category_key TEXT,
  category_ar TEXT,
  category_en TEXT,
  image_urls TEXT[],
  price_ar TEXT,
  price_en TEXT,
  origin_ar TEXT,
  origin_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar TEXT,
  title_en TEXT,
  image_urls TEXT[],
  artisan_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_ar TEXT,
  location_en TEXT,
  style_key TEXT,
  style_ar TEXT,
  style_en TEXT,
  products_used TEXT[],
  status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  discount_percentage NUMERIC,
  product_ids TEXT[],
  start_date DATE,
  end_date DATE,
  status TEXT
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar TEXT,
  title_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  summary_ar TEXT,
  summary_en TEXT,
  image_url TEXT,
  author_id UUID REFERENCES users(id),
  author_name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
