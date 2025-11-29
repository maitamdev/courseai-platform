-- =============================================
-- MAKE SOCIAL FEED FULLY PUBLIC
-- =============================================

-- Drop old policy and create new one that allows everyone to view all posts
DROP POLICY IF EXISTS "Anyone can view public posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view all posts" ON posts;

CREATE POLICY "Anyone can view all posts" ON posts FOR SELECT USING (true);

-- Remove visibility column if exists (all posts are public now)
ALTER TABLE posts DROP COLUMN IF EXISTS visibility;
