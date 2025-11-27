-- =============================================
-- FIX RLS POLICIES CHO PAYMENT SYSTEM
-- =============================================

-- Service Role phải có quyền update profiles
-- Tạo policy cho service role bypass RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- QUAN TRỌNG: Cho phép service role update bất kỳ profile nào
CREATE POLICY "Service role can update profiles" ON profiles 
  FOR ALL USING (true);

-- Fix coin_transactions policies
ALTER TABLE coin_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON coin_transactions;

CREATE POLICY "Users can view own transactions" ON coin_transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions" ON coin_transactions 
  FOR INSERT WITH CHECK (true);

-- Fix payment_sessions policies
ALTER TABLE payment_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Users can create payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Users can update own payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Service role can update payment sessions" ON payment_sessions;

CREATE POLICY "Users can view own payment sessions" ON payment_sessions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment sessions" ON payment_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment sessions" ON payment_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can update payment sessions" ON payment_sessions 
  FOR ALL USING (true);

-- Fix mbbank_transactions policies
ALTER TABLE mbbank_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mbbank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mbbank transactions" ON mbbank_transactions;
DROP POLICY IF EXISTS "Service role can insert mbbank transactions" ON mbbank_transactions;

CREATE POLICY "Users can view own mbbank transactions" ON mbbank_transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert mbbank transactions" ON mbbank_transactions 
  FOR INSERT WITH CHECK (true);

SELECT 'Đã fix RLS policies cho payment system!' AS message;
