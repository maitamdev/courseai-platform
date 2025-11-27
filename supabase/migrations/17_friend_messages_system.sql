-- Friend Messages System
-- Hệ thống nhắn tin giữa bạn bè

-- Bảng messages để lưu tin nhắn
CREATE TABLE IF NOT EXISTS friend_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Đảm bảo không tự nhắn tin cho chính mình
  CHECK (sender_id != receiver_id)
);

-- Indexes để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_messages_sender ON friend_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON friend_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON friend_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON friend_messages(is_read);

-- Bảng conversations để tracking cuộc trò chuyện
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message TEXT,
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Đảm bảo không trùng conversation
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)  -- Đảm bảo user1_id luôn nhỏ hơn user2_id
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Function để tự động cập nhật conversation khi có tin nhắn mới
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
BEGIN
  -- Xác định user1 và user2 (user1 luôn có id nhỏ hơn)
  IF NEW.sender_id < NEW.receiver_id THEN
    v_user1_id := NEW.sender_id;
    v_user2_id := NEW.receiver_id;
  ELSE
    v_user1_id := NEW.receiver_id;
    v_user2_id := NEW.sender_id;
  END IF;
  
  -- Cập nhật hoặc tạo conversation
  INSERT INTO conversations (user1_id, user2_id, last_message_at, last_message, unread_count_user1, unread_count_user2)
  VALUES (
    v_user1_id,
    v_user2_id,
    NEW.created_at,
    NEW.message,
    CASE WHEN NEW.receiver_id = v_user1_id THEN 1 ELSE 0 END,
    CASE WHEN NEW.receiver_id = v_user2_id THEN 1 ELSE 0 END
  )
  ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET
    last_message_at = NEW.created_at,
    last_message = NEW.message,
    unread_count_user1 = CASE 
      WHEN NEW.receiver_id = conversations.user1_id 
      THEN conversations.unread_count_user1 + 1 
      ELSE conversations.unread_count_user1 
    END,
    unread_count_user2 = CASE 
      WHEN NEW.receiver_id = conversations.user2_id 
      THEN conversations.unread_count_user2 + 1 
      ELSE conversations.unread_count_user2 
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động cập nhật conversation
DROP TRIGGER IF EXISTS trigger_update_conversation ON friend_messages;
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON friend_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function để đánh dấu tin nhắn đã đọc
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_user_id UUID,
  p_friend_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
BEGIN
  -- Update messages
  UPDATE friend_messages
  SET is_read = true
  WHERE sender_id = p_friend_id 
    AND receiver_id = p_user_id 
    AND is_read = false;
  
  -- Xác định user1 và user2
  IF p_user_id < p_friend_id THEN
    v_user1_id := p_user_id;
    v_user2_id := p_friend_id;
  ELSE
    v_user1_id := p_friend_id;
    v_user2_id := p_user_id;
  END IF;
  
  -- Reset unread count
  UPDATE conversations
  SET 
    unread_count_user1 = CASE WHEN v_user1_id = p_user_id THEN 0 ELSE unread_count_user1 END,
    unread_count_user2 = CASE WHEN v_user2_id = p_user_id THEN 0 ELSE unread_count_user2 END
  WHERE user1_id = v_user1_id AND user2_id = v_user2_id;
END;
$$ LANGUAGE plpgsql;

-- View để lấy danh sách conversations với thông tin đầy đủ
CREATE OR REPLACE VIEW conversations_with_details AS
SELECT 
  c.id,
  c.user1_id,
  c.user2_id,
  c.last_message_at,
  c.last_message,
  c.unread_count_user1,
  c.unread_count_user2,
  p1.username as user1_username,
  p1.full_name as user1_full_name,
  p1.avatar_url as user1_avatar,
  p2.username as user2_username,
  p2.full_name as user2_full_name,
  p2.avatar_url as user2_avatar
FROM conversations c
JOIN profiles p1 ON c.user1_id = p1.id
JOIN profiles p2 ON c.user2_id = p2.id;

-- RLS Policies
ALTER TABLE friend_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON friend_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to friends"
  ON friend_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE user_id = auth.uid() 
      AND friend_id = receiver_id 
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can update their received messages"
  ON friend_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update conversations"
  ON conversations FOR UPDATE
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON friend_messages TO authenticated;
GRANT SELECT ON conversations TO authenticated;
GRANT ALL ON friend_messages TO service_role;
GRANT ALL ON conversations TO service_role;
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;

-- Comments
COMMENT ON TABLE friend_messages IS 'Stores messages between friends';
COMMENT ON TABLE conversations IS 'Tracks conversation threads between users';
COMMENT ON FUNCTION update_conversation_on_message() IS 'Automatically updates conversation when new message is sent';
COMMENT ON FUNCTION mark_messages_as_read IS 'Marks all messages from a friend as read';
