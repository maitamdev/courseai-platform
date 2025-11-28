-- Thêm trạng thái tin nhắn: sent, delivered, seen
ALTER TABLE friend_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen'));

-- Index để query nhanh tin nhắn chưa đọc
CREATE INDEX IF NOT EXISTS idx_friend_messages_status ON friend_messages(receiver_id, status);

-- Function để đánh dấu tin nhắn đã xem
CREATE OR REPLACE FUNCTION mark_messages_as_seen(p_user_id UUID, p_friend_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE friend_messages
  SET status = 'seen'
  WHERE receiver_id = p_user_id 
    AND sender_id = p_friend_id
    AND status != 'seen';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để đếm tin nhắn chưa đọc
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM friend_messages
  WHERE receiver_id = p_user_id AND status != 'seen';
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Đã thêm trạng thái tin nhắn!' AS message;
