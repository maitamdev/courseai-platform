-- Friends System Migration
-- Tạo bảng friendships để quản lý quan hệ bạn bè

-- Bảng friendships
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Đảm bảo không có duplicate friendships
  UNIQUE(user_id, friend_id),
  
  -- Đảm bảo không tự kết bạn với chính mình
  CHECK (user_id != friend_id)
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Bảng friend_requests để tracking lời mời kết bạn
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Bảng activities để tracking hoạt động của bạn bè
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('course_completed', 'lesson_completed', 'game_completed', 'level_up', 'badge_earned', 'achievement')),
  activity_data JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);

-- Function để tự động tạo friendship khi request được accept
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Tạo friendship 2 chiều
    INSERT INTO friendships (user_id, friend_id, status)
    VALUES (NEW.sender_id, NEW.receiver_id, 'accepted')
    ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'accepted', updated_at = NOW();
    
    INSERT INTO friendships (user_id, friend_id, status)
    VALUES (NEW.receiver_id, NEW.sender_id, 'accepted')
    ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'accepted', updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động tạo friendship
DROP TRIGGER IF EXISTS trigger_accept_friend_request ON friend_requests;
CREATE TRIGGER trigger_accept_friend_request
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION accept_friend_request();

-- Function để unfriend
CREATE OR REPLACE FUNCTION unfriend(p_user_id UUID, p_friend_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM friendships WHERE user_id = p_user_id AND friend_id = p_friend_id;
  DELETE FROM friendships WHERE user_id = p_friend_id AND friend_id = p_user_id;
  DELETE FROM friend_requests WHERE (sender_id = p_user_id AND receiver_id = p_friend_id) OR (sender_id = p_friend_id AND receiver_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- View để lấy danh sách bạn bè với thông tin đầy đủ
CREATE OR REPLACE VIEW friends_with_details AS
SELECT 
  f.user_id,
  f.friend_id,
  p.username as friend_username,
  p.full_name as friend_full_name,
  p.avatar_url as friend_avatar,
  p.level as friend_level,
  p.total_xp as friend_xp,
  p.total_coins as friend_coins,
  f.created_at as friends_since,
  f.status
FROM friendships f
JOIN profiles p ON f.friend_id = p.id
WHERE f.status = 'accepted';

-- View để lấy friend requests với thông tin người gửi
CREATE OR REPLACE VIEW friend_requests_with_details AS
SELECT 
  fr.id,
  fr.sender_id,
  fr.receiver_id,
  fr.status,
  fr.message,
  fr.created_at,
  p.username as sender_username,
  p.full_name as sender_full_name,
  p.avatar_url as sender_avatar,
  p.level as sender_level,
  p.total_xp as sender_xp
FROM friend_requests fr
JOIN profiles p ON fr.sender_id = p.id;

-- RLS Policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Friend requests policies
CREATE POLICY "Users can view their friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their sent requests"
  ON friend_requests FOR DELETE
  USING (auth.uid() = sender_id);

-- Activities policies
CREATE POLICY "Users can view public activities of friends"
  ON user_activities FOR SELECT
  USING (
    is_public = true AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM friendships 
        WHERE user_id = auth.uid() 
        AND friend_id = user_activities.user_id 
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can create their own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON user_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- Function để tìm kiếm users
CREATE OR REPLACE FUNCTION search_users(search_query TEXT, current_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  level INTEGER,
  xp INTEGER,
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
    EXISTS(SELECT 1 FROM friendships WHERE user_id = current_user_id AND friend_id = p.id AND status = 'accepted') as is_friend,
    (SELECT status FROM friend_requests WHERE (sender_id = current_user_id AND receiver_id = p.id) OR (sender_id = p.id AND receiver_id = current_user_id) ORDER BY created_at DESC LIMIT 1) as request_status
  FROM profiles p
  WHERE 
    p.id != current_user_id AND
    (
      p.username ILIKE '%' || search_query || '%' OR
      p.full_name ILIKE '%' || search_query || '%'
    )
  ORDER BY p.total_xp DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Thêm comment
COMMENT ON TABLE friendships IS 'Stores friendship relationships between users';
COMMENT ON TABLE friend_requests IS 'Stores friend request history';
COMMENT ON TABLE user_activities IS 'Stores user activities for friend feed';

-- View để lấy activity feed của bạn bè
CREATE OR REPLACE VIEW friend_activities_feed AS
SELECT 
  ua.id,
  ua.user_id,
  p.username,
  p.full_name,
  ua.activity_type,
  ua.activity_data,
  ua.created_at,
  f.user_id as viewer_id
FROM user_activities ua
JOIN profiles p ON ua.user_id = p.id
JOIN friendships f ON ua.user_id = f.friend_id
WHERE ua.is_public = true AND f.status = 'accepted';

-- Function để gửi xu cho bạn bè
CREATE OR REPLACE FUNCTION send_coins_to_friend(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_sender_coins INTEGER;
  v_is_friend BOOLEAN;
  v_sender_name TEXT;
  v_receiver_name TEXT;
BEGIN
  -- Check if they are friends
  SELECT EXISTS(
    SELECT 1 FROM friendships 
    WHERE user_id = p_sender_id 
    AND friend_id = p_receiver_id 
    AND status = 'accepted'
  ) INTO v_is_friend;
  
  IF NOT v_is_friend THEN
    RAISE EXCEPTION 'Chỉ có thể gửi xu cho bạn bè!';
  END IF;
  
  -- Check sender's balance
  SELECT total_coins INTO v_sender_coins
  FROM profiles
  WHERE id = p_sender_id;
  
  IF v_sender_coins < p_amount THEN
    RAISE EXCEPTION 'Không đủ xu để gửi!';
  END IF;
  
  -- Get names for activity
  SELECT full_name INTO v_sender_name FROM profiles WHERE id = p_sender_id;
  SELECT full_name INTO v_receiver_name FROM profiles WHERE id = p_receiver_id;
  
  -- Deduct from sender
  UPDATE profiles
  SET total_coins = total_coins - p_amount
  WHERE id = p_sender_id;
  
  -- Add to receiver
  UPDATE profiles
  SET total_coins = total_coins + p_amount
  WHERE id = p_receiver_id;
  
  -- Create activity for sender
  INSERT INTO user_activities (user_id, activity_type, activity_data, is_public)
  VALUES (
    p_sender_id,
    'coins_sent',
    jsonb_build_object(
      'amount', p_amount,
      'receiver_id', p_receiver_id,
      'receiver_name', v_receiver_name
    ),
    true
  );
  
  -- Create activity for receiver
  INSERT INTO user_activities (user_id, activity_type, activity_data, is_public)
  VALUES (
    p_receiver_id,
    'coins_received',
    jsonb_build_object(
      'amount', p_amount,
      'sender_id', p_sender_id,
      'sender_name', v_sender_name
    ),
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để log activity khi hoàn thành lesson
CREATE OR REPLACE FUNCTION log_lesson_completion_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_lesson_name TEXT;
BEGIN
  -- Get lesson name
  SELECT title INTO v_lesson_name
  FROM lessons
  WHERE id = NEW.lesson_id;
  
  -- Create activity
  INSERT INTO user_activities (user_id, activity_type, activity_data, is_public)
  VALUES (
    NEW.user_id,
    'lesson_completed',
    jsonb_build_object(
      'lesson_id', NEW.lesson_id,
      'lesson_name', v_lesson_name,
      'xp_earned', NEW.xp_earned
    ),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động log activity
DROP TRIGGER IF EXISTS trigger_log_lesson_activity ON user_progress;
CREATE TRIGGER trigger_log_lesson_activity
  AFTER INSERT ON user_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION log_lesson_completion_activity();

-- Function để log level up activity
CREATE OR REPLACE FUNCTION log_level_up_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level > OLD.level THEN
    INSERT INTO user_activities (user_id, activity_type, activity_data, is_public)
    VALUES (
      NEW.id,
      'level_up',
      jsonb_build_object(
        'old_level', OLD.level,
        'new_level', NEW.level
      ),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động log level up
DROP TRIGGER IF EXISTS trigger_log_level_up ON profiles;
CREATE TRIGGER trigger_log_level_up
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION log_level_up_activity();

-- Grant permissions
GRANT SELECT ON friend_activities_feed TO authenticated;
GRANT EXECUTE ON FUNCTION send_coins_to_friend TO authenticated;
