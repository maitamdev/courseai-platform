-- Update search_users function to search by email
-- Cho phép tìm kiếm bạn bè theo email, username, hoặc full name

CREATE OR REPLACE FUNCTION search_users(search_query TEXT, current_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  level INTEGER,
  xp INTEGER,
  email TEXT,
  is_friend BOOLEAN,
  request_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.level,
    p.total_xp as xp,
    u.email,
    EXISTS(
      SELECT 1 FROM friendships 
      WHERE user_id = current_user_id 
      AND friend_id = p.id 
      AND status = 'accepted'
    ) as is_friend,
    (
      SELECT status FROM friend_requests 
      WHERE (sender_id = current_user_id AND receiver_id = p.id) 
      OR (sender_id = p.id AND receiver_id = current_user_id) 
      ORDER BY created_at DESC 
      LIMIT 1
    ) as request_status
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE 
    p.id != current_user_id AND
    (
      p.username ILIKE '%' || search_query || '%' OR
      p.full_name ILIKE '%' || search_query || '%' OR
      u.email ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    -- Ưu tiên exact match
    CASE 
      WHEN u.email ILIKE search_query THEN 1
      WHEN p.username ILIKE search_query THEN 2
      WHEN p.full_name ILIKE search_query THEN 3
      ELSE 4
    END,
    p.total_xp DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_users TO authenticated;

-- Comment
COMMENT ON FUNCTION search_users IS 'Search users by email, username, or full name for friend requests';
