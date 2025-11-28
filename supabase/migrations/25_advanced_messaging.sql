-- =============================================
-- ADVANCED MESSAGING FEATURES
-- =============================================

-- 1. Add columns to friend_messages for edit/delete/pin
ALTER TABLE friend_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES friend_messages(id),
ADD COLUMN IF NOT EXISTS voice_duration INTEGER;

-- 2. Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES friend_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions" ON message_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON message_reactions FOR DELETE USING (auth.uid() = user_id);

-- 3. Online status table
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view online status" ON user_online_status FOR SELECT USING (true);
CREATE POLICY "Users can update own status" ON user_online_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own status2" ON user_online_status FOR UPDATE USING (auth.uid() = user_id);

-- 4. Chat themes table
CREATE TABLE IF NOT EXISTS chat_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'default',
  custom_color VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE chat_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own themes" ON chat_themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can set themes" ON chat_themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update themes" ON chat_themes FOR UPDATE USING (auth.uid() = user_id);

-- 5. Group chats table
CREATE TABLE IF NOT EXISTS group_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;

-- 6. Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 7. Group messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  message_type VARCHAR(20) DEFAULT 'text',
  media_url TEXT,
  media_type VARCHAR(50),
  reply_to_id UUID REFERENCES group_messages(id),
  mentions UUID[],
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  voice_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Group chat policies
CREATE POLICY "Members can view group" ON group_chats FOR SELECT 
  USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create groups" ON group_chats FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view members" ON group_members FOR SELECT 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Group creator can add members" ON group_members FOR INSERT 
  WITH CHECK (group_id IN (SELECT id FROM group_chats WHERE created_by = auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Members can leave" ON group_members FOR DELETE 
  USING (auth.uid() = user_id OR group_id IN (SELECT id FROM group_chats WHERE created_by = auth.uid()));

CREATE POLICY "Members can view messages" ON group_messages FOR SELECT 
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can send messages" ON group_messages FOR INSERT 
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) AND auth.uid() = sender_id);

CREATE POLICY "Sender can edit/delete" ON group_messages FOR UPDATE 
  USING (auth.uid() = sender_id);

-- 8. Functions
CREATE OR REPLACE FUNCTION update_online_status(p_is_online BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO user_online_status (user_id, is_online, last_seen)
  VALUES (auth.uid(), p_is_online, now())
  ON CONFLICT (user_id)
  DO UPDATE SET is_online = p_is_online, last_seen = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_message(p_message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE friend_messages 
  SET is_deleted = true, message = 'Tin nhắn đã bị xóa'
  WHERE id = p_message_id AND sender_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION edit_message(p_message_id UUID, p_new_message TEXT)
RETURNS void AS $$
BEGIN
  UPDATE friend_messages 
  SET message = p_new_message, is_edited = true, edited_at = now()
  WHERE id = p_message_id AND sender_id = auth.uid() AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_pin_message(p_message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE friend_messages 
  SET is_pinned = NOT is_pinned, pinned_at = CASE WHEN is_pinned THEN NULL ELSE now() END
  WHERE id = p_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_chat_theme(p_friend_id UUID, p_theme VARCHAR, p_color VARCHAR DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO chat_themes (user_id, friend_id, theme, custom_color)
  VALUES (auth.uid(), p_friend_id, p_theme, p_color)
  ON CONFLICT (user_id, friend_id)
  DO UPDATE SET theme = p_theme, custom_color = p_color;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for chat media (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-media', 'chat-media', true);
