-- =============================================
-- BẢNG PAYMENT SESSIONS CHO QR CODE
-- =============================================

-- Bảng lưu các phiên thanh toán
CREATE TABLE IF NOT EXISTS payment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES coin_packages(id),
  amount_vnd integer NOT NULL,
  coins_amount integer NOT NULL,
  transfer_content text NOT NULL,
  transaction_code text UNIQUE NOT NULL,
  qr_code_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_transaction_code ON payment_sessions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);

-- Enable RLS
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own payment sessions" ON payment_sessions;
CREATE POLICY "Users can view own payment sessions" ON payment_sessions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create payment sessions" ON payment_sessions;
CREATE POLICY "Users can create payment sessions" ON payment_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment sessions" ON payment_sessions;
CREATE POLICY "Users can update own payment sessions" ON payment_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function để tự động expire các session cũ
CREATE OR REPLACE FUNCTION expire_old_payment_sessions()
RETURNS void AS $$
BEGIN
  UPDATE payment_sessions
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Tạo cron job để chạy mỗi phút (nếu có pg_cron)
-- SELECT cron.schedule('expire-payment-sessions', '* * * * *', 'SELECT expire_old_payment_sessions()');

SELECT 'Đã tạo bảng payment_sessions!' AS message;
