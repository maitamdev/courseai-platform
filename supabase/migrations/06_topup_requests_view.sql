-- =============================================
-- VIEW ĐỂ LẤY EMAIL TỪ AUTH.USERS
-- =============================================

-- Tạo view để join topup_requests với auth.users
CREATE OR REPLACE VIEW topup_requests_with_email AS
SELECT 
  tr.*,
  p.username,
  p.full_name,
  au.email
FROM topup_requests tr
JOIN profiles p ON tr.user_id = p.id
LEFT JOIN auth.users au ON tr.user_id = au.id;

-- Grant permissions
GRANT SELECT ON topup_requests_with_email TO authenticated;

-- RLS cho view (kế thừa từ topup_requests)
ALTER VIEW topup_requests_with_email SET (security_invoker = on);

SELECT 'View topup_requests_with_email created!' AS message;
