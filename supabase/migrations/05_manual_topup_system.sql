-- =============================================
-- HỆ THỐNG CỘNG XU THỦ CÔNG
-- =============================================

-- Bảng lưu yêu cầu nạp xu (user submit)
CREATE TABLE IF NOT EXISTS topup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES coin_packages(id),
  amount_vnd integer NOT NULL,
  coins_amount integer NOT NULL,
  transfer_proof_url text, -- URL ảnh bill chuyển khoản
  transfer_note text, -- Ghi chú của user
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text, -- Ghi chú của admin
  processed_by uuid REFERENCES profiles(id), -- Admin xử lý
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_topup_requests_user_id ON topup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_topup_requests_status ON topup_requests(status);

-- Enable RLS
ALTER TABLE topup_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own topup requests" ON topup_requests;
CREATE POLICY "Users can view own topup requests" ON topup_requests 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create topup requests" ON topup_requests;
CREATE POLICY "Users can create topup requests" ON topup_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all topup requests" ON topup_requests;
CREATE POLICY "Admins can view all topup requests" ON topup_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (email = 'admin@codequest.com' OR email LIKE '%@admin.com')
    )
  );

DROP POLICY IF EXISTS "Admins can update topup requests" ON topup_requests;
CREATE POLICY "Admins can update topup requests" ON topup_requests 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (email = 'admin@codequest.com' OR email LIKE '%@admin.com')
    )
  );

-- Function để approve topup request
CREATE OR REPLACE FUNCTION approve_topup_request(
  p_request_id uuid,
  p_admin_note text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_request topup_requests;
  v_result json;
BEGIN
  -- Lấy request
  SELECT * INTO v_request
  FROM topup_requests
  WHERE id = p_request_id
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Request not found or already processed'
    );
  END IF;
  
  -- Cộng xu cho user
  UPDATE profiles
  SET total_coins = total_coins + v_request.coins_amount
  WHERE id = v_request.user_id;
  
  -- Lưu transaction
  INSERT INTO coin_transactions (user_id, transaction_type, amount, description, reference_id)
  VALUES (
    v_request.user_id,
    'purchase',
    v_request.coins_amount,
    'Nạp xu qua chuyển khoản (Manual)',
    p_request_id::text
  );
  
  -- Update request status
  UPDATE topup_requests
  SET 
    status = 'approved',
    admin_note = p_admin_note,
    processed_by = auth.uid(),
    processed_at = NOW()
  WHERE id = p_request_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Topup approved successfully',
    'coins_added', v_request.coins_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để reject topup request
CREATE OR REPLACE FUNCTION reject_topup_request(
  p_request_id uuid,
  p_admin_note text
)
RETURNS json AS $$
BEGIN
  UPDATE topup_requests
  SET 
    status = 'rejected',
    admin_note = p_admin_note,
    processed_by = auth.uid(),
    processed_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Request not found or already processed'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Topup rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION approve_topup_request TO authenticated;
GRANT EXECUTE ON FUNCTION reject_topup_request TO authenticated;

SELECT 'Manual topup system created!' AS message;
