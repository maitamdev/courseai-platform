-- =============================================
-- TEST PAYMENT FLOW
-- =============================================

-- Bước 1: Tạo test payment session
DO $$
DECLARE
  test_user_id uuid;
  test_package_id uuid;
  test_transaction_code text;
BEGIN
  -- Lấy user đầu tiên
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Lấy package đầu tiên
  SELECT id INTO test_package_id FROM coin_packages LIMIT 1;
  
  -- Tạo transaction code
  test_transaction_code := 'NAPXU' || LPAD(FLOOR(RANDOM() * 100000000)::text, 8, '0');
  
  -- Tạo payment session
  INSERT INTO payment_sessions (
    user_id,
    package_id,
    amount_vnd,
    coins_amount,
    transfer_content,
    transaction_code,
    qr_code_url,
    status,
    expires_at
  ) VALUES (
    test_user_id,
    test_package_id,
    100000,
    100,
    test_transaction_code || ' test123',
    test_transaction_code,
    'https://test.com/qr.png',
    'pending',
    NOW() + INTERVAL '10 minutes'
  );
  
  RAISE NOTICE 'Created test payment session with code: %', test_transaction_code;
  RAISE NOTICE 'User ID: %', test_user_id;
END $$;

-- Bước 2: Xem payment session vừa tạo
SELECT 
  ps.id,
  ps.transaction_code,
  ps.status,
  ps.amount_vnd,
  ps.coins_amount,
  ps.user_id,
  p.email,
  p.total_coins as current_coins
FROM payment_sessions ps
LEFT JOIN profiles p ON p.id = ps.user_id
WHERE ps.status = 'pending'
ORDER BY ps.created_at DESC
LIMIT 1;

-- Bước 3: Giả lập webhook xử lý payment
-- Copy transaction_code từ kết quả trên và thay vào đây
DO $$
DECLARE
  test_transaction_code text := 'NAPXU12345678'; -- THAY ĐỔI CODE NÀY
  session_record record;
  profile_record record;
  new_coins integer;
BEGIN
  -- Tìm session
  SELECT * INTO session_record
  FROM payment_sessions
  WHERE transaction_code = test_transaction_code
    AND status = 'pending'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found with code: %', test_transaction_code;
  END IF;
  
  RAISE NOTICE 'Found session: %', session_record.id;
  
  -- Lấy profile hiện tại
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = session_record.user_id;
  
  RAISE NOTICE 'Current coins: %', profile_record.total_coins;
  
  -- Tính coins mới
  new_coins := COALESCE(profile_record.total_coins, 0) + session_record.coins_amount;
  
  RAISE NOTICE 'New coins will be: %', new_coins;
  
  -- Cộng xu
  UPDATE profiles
  SET total_coins = new_coins
  WHERE id = session_record.user_id;
  
  RAISE NOTICE 'Updated profile coins';
  
  -- Tạo coin transaction
  INSERT INTO coin_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    reference_id
  ) VALUES (
    session_record.user_id,
    'purchase',
    session_record.coins_amount,
    'Test nạp ' || session_record.coins_amount || ' xu qua QR Code',
    test_transaction_code
  );
  
  RAISE NOTICE 'Created coin transaction';
  
  -- Update payment session
  UPDATE payment_sessions
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = session_record.id;
  
  RAISE NOTICE 'Updated payment session status';
  
  -- Tạo mbbank transaction
  INSERT INTO mbbank_transactions (
    transaction_id,
    user_id,
    amount_vnd,
    coins_added,
    processed_at
  ) VALUES (
    'TEST_' || test_transaction_code,
    session_record.user_id,
    session_record.amount_vnd,
    session_record.coins_amount,
    NOW()
  );
  
  RAISE NOTICE 'Created mbbank transaction';
  RAISE NOTICE '=== PAYMENT PROCESSED SUCCESSFULLY ===';
END $$;

-- Bước 4: Kiểm tra kết quả
SELECT 
  'Payment Session' as table_name,
  ps.transaction_code,
  ps.status,
  ps.coins_amount,
  ps.completed_at
FROM payment_sessions ps
WHERE ps.status = 'completed'
ORDER BY ps.completed_at DESC
LIMIT 1

UNION ALL

SELECT 
  'Profile Coins' as table_name,
  p.email as transaction_code,
  p.total_coins::text as status,
  NULL as coins_amount,
  p.updated_at as completed_at
FROM profiles p
ORDER BY p.updated_at DESC
LIMIT 1

UNION ALL

SELECT 
  'Coin Transaction' as table_name,
  ct.reference_id as transaction_code,
  ct.transaction_type as status,
  ct.amount as coins_amount,
  ct.created_at as completed_at
FROM coin_transactions ct
WHERE ct.transaction_type = 'purchase'
ORDER BY ct.created_at DESC
LIMIT 1

UNION ALL

SELECT 
  'MBBank Transaction' as table_name,
  mt.transaction_id as transaction_code,
  mt.coins_added::text as status,
  NULL as coins_amount,
  mt.processed_at as completed_at
FROM mbbank_transactions mt
ORDER BY mt.processed_at DESC
LIMIT 1;
