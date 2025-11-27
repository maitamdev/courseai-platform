-- Fix Send Coins Activity Type
-- Thêm coins_sent và coins_received vào allowed activity types

-- Drop old constraint
ALTER TABLE user_activities 
DROP CONSTRAINT IF EXISTS user_activities_activity_type_check;

-- Add new constraint with coins activities
ALTER TABLE user_activities
ADD CONSTRAINT user_activities_activity_type_check 
CHECK (activity_type IN (
  'course_completed', 
  'lesson_completed', 
  'game_completed', 
  'level_up', 
  'badge_earned', 
  'achievement',
  'coins_sent',
  'coins_received'
));

-- Comment
COMMENT ON CONSTRAINT user_activities_activity_type_check ON user_activities 
IS 'Allowed activity types including coin transactions';
