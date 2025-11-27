-- Fix RLS Policies for purchased_courses table
-- Đảm bảo mỗi user chỉ thấy khóa học mà họ đã mua

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own purchased courses" ON purchased_courses;
DROP POLICY IF EXISTS "Users can insert own purchased courses" ON purchased_courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON purchased_courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON purchased_courses;

-- Policy cho SELECT - Users chỉ có thể xem khóa học mà họ đã mua
CREATE POLICY "Users can view own purchased courses" 
ON purchased_courses FOR SELECT 
USING (auth.uid() = user_id);

-- Policy cho INSERT - Users chỉ có thể mua khóa học cho chính mình
CREATE POLICY "Users can insert own purchased courses" 
ON purchased_courses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON purchased_courses TO authenticated;
GRANT ALL ON purchased_courses TO service_role;

-- Comment
COMMENT ON POLICY "Users can view own purchased courses" ON purchased_courses 
IS 'Users can only see courses they have purchased';

COMMENT ON POLICY "Users can insert own purchased courses" ON purchased_courses 
IS 'Users can only purchase courses for themselves';

-- Verify RLS is enabled
ALTER TABLE purchased_courses ENABLE ROW LEVEL SECURITY;
