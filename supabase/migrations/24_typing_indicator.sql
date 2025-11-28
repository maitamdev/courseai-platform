-- Typing indicator table
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view typing status for their conversations"
  ON typing_status FOR SELECT
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can update their own typing status"
  ON typing_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update typing status"
  ON typing_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their typing status"
  ON typing_status FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update typing status
CREATE OR REPLACE FUNCTION update_typing_status(p_friend_id UUID, p_is_typing BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO typing_status (user_id, friend_id, is_typing, updated_at)
  VALUES (auth.uid(), p_friend_id, p_is_typing, now())
  ON CONFLICT (user_id, friend_id)
  DO UPDATE SET is_typing = p_is_typing, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-clear typing status after 5 seconds of inactivity
CREATE OR REPLACE FUNCTION clear_stale_typing()
RETURNS void AS $$
BEGIN
  UPDATE typing_status 
  SET is_typing = false 
  WHERE is_typing = true 
  AND updated_at < now() - interval '5 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
