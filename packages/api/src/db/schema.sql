-- Run this in your Supabase SQL editor
-- https://app.supabase.com → SQL Editor → New query

CREATE TABLE posts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  content      text NOT NULL,         -- raw markdown
  excerpt      text DEFAULT '',
  tags         text[] DEFAULT '{}',
  published    boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX posts_slug_idx ON posts (slug);

-- Index for listing published posts by date
CREATE INDEX posts_published_idx ON posts (published, published_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public read published posts"
  ON posts FOR SELECT
  USING (published = true);

-- Only service_role (API) can write
-- (your SUPABASE_SERVICE_KEY bypasses RLS automatically)
