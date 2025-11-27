-- =============================================
-- BẢNG CHO MBBANK PAYMENT
-- =============================================

-- Bảng lưu các giao dịch MBBank đã xử lý
CREATE TABLE IF NOT EXISTS mbbank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_vnd integer NOT NULL,
  coins_added integer NOT NULL,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Bảng lưu gói nạp xu
CREATE TABLE IF NOT EXISTS coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coins integer NOT NULL,
  price_vnd integer NOT NULL,
  bonus_coins integer DEFAULT 0,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mbbank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own mbbank transactions" ON mbbank_transactions;
CREATE POLICY "Users can view own mbbank transactions" ON mbbank_transactions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view coin packages" ON coin_packages;
CREATE POLICY "Anyone can view coin packages" ON coin_packages 
  FOR SELECT USING (true);

-- Thêm các gói nạp xu
INSERT INTO coin_packages (name, coins, price_vnd, bonus_coins, is_popular) VALUES
('Gói Cơ Bản', 100, 100000, 0, false),
('Gói Phổ Biến', 300, 300000, 30, true),
('Gói Tiết Kiệm', 500, 500000, 100, false),
('Gói Siêu Tiết Kiệm', 1000, 1000000, 300, true),
('Gói VIP', 2000, 2000000, 800, false)
ON CONFLICT DO NOTHING;

SELECT 'Đã tạo bảng MBBank payment!' AS message;
