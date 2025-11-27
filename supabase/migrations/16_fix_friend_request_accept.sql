-- Fix Friend Request Accept Issue
-- Đảm bảo receiver có thể update và trigger có thể tạo friendships

-- Drop và recreate policies với permissions đúng
DROP POLICY IF EXISTS "Users can update received requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;

-- Policy cho phép receiver update friend requests
CREATE POLICY "Users can update received requests"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Policy cho phép trigger tạo friendships (SECURITY DEFINER)
CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (true);  -- Cho phép trigger tạo

-- Recreate function với SECURITY DEFINER để có full permissions
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Tạo friendship 2 chiều
    INSERT INTO friendships (user_id, friend_id, status)
    VALUES (NEW.sender_id, NEW.receiver_id, 'accepted')
    ON CONFLICT (user_id, friend_id) 
    DO UPDATE SET 
      status = 'accepted', 
      updated_at = NOW();
    
    INSERT INTO friendships (user_id, friend_id, status)
    VALUES (NEW.receiver_id, NEW.sender_id, 'accepted')
    ON CONFLICT (user_id, friend_id) 
    DO UPDATE SET 
      status = 'accepted', 
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in accept_friend_request: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_accept_friend_request ON friend_requests;
CREATE TRIGGER trigger_accept_friend_request
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION accept_friend_request();

-- Grant necessary permissions
GRANT ALL ON friendships TO postgres, service_role;
GRANT SELECT, INSERT, DELETE ON friendships TO authenticated;

GRANT ALL ON friend_requests TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO authenticated;

-- Add policy for friendships UPDATE (for trigger)
DROP POLICY IF EXISTS "Users can update friendships" ON friendships;
CREATE POLICY "Users can update friendships"
  ON friendships FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Comment
COMMENT ON FUNCTION accept_friend_request() IS 'Automatically creates bidirectional friendships when friend request is accepted';
COMMENT ON POLICY "Users can update received requests" ON friend_requests IS 'Allows receivers to accept/reject friend requests';
COMMENT ON POLICY "Users can create friendships" ON friendships IS 'Allows trigger to create friendships automatically';
