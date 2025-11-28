-- Fix Friends System Policies
-- Drop existing policies and recreate them

-- Drop existing policies for friendships
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON friendships;

-- Drop existing policies for friend_requests
DROP POLICY IF EXISTS "Users can view their friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update received requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can delete their sent requests" ON friend_requests;

-- Drop existing policies for user_activities
DROP POLICY IF EXISTS "Users can view public activities of friends" ON user_activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON user_activities;

-- Drop existing policies for friend_messages
DROP POLICY IF EXISTS "Users can view their messages" ON friend_messages;
DROP POLICY IF EXISTS "Users can send messages to friends" ON friend_messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON friend_messages;

-- Drop existing policies for conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "System can create conversations" ON conversations;
DROP POLICY IF EXISTS "System can update conversations" ON conversations;

-- Recreate Friendships policies
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate Friend requests policies
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

-- Recreate Activities policies
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

-- Recreate Messages policies
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

-- Recreate Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update conversations"
  ON conversations FOR UPDATE
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE friendships IS 'Stores friendship relationships between users';
COMMENT ON TABLE friend_requests IS 'Stores friend request history';
COMMENT ON TABLE user_activities IS 'Stores user activities for friend feed';
COMMENT ON TABLE friend_messages IS 'Stores messages between friends';
COMMENT ON TABLE conversations IS 'Tracks conversation threads between users';
