-- =============================================
-- FUNCTION ĐỂ CỘNG XU THỦ CÔNG (TẠM THỜI)
-- =============================================

-- Function để admin cộng xu thủ công
CREATE OR REPLACE FUNCTION manual_add_coins(
  p_user_id uuid,
  p_transaction_code text,
  p_amount_vnd integer
)
RETURNS json AS $$
DECLARE
  v_session payment_sessions;
  v_result json;
BEGIN
  -- Tìm payment session
  SELECT * INTO v_session
  FROM payment_sessions
  WHERE transaction_code = p_transaction_code
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Payment session not found or already processed'
    );
  END IF;
  
  -- Check user_id có khớp không
  IF v_session.user_id != p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User ID mismatch'
    );
  END IF;
  
  -- Check số tiền
  IF p_amount_vnd < v_session.amount_vnd THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Amount too low'
    );
  END IF;
  
  -- Cộng xu
  UPDATE profiles
  SET total_coins = total_coins + v_session.coins_amount
  WHERE id = p_user_id;
  
  -- Lưu transaction
  INSERT INTO coin_transactions (user_id, transaction_type, amount, description, reference_id)
  VALUES (
    p_user_id,
    'purchase',
    v_session.coins_amount,
    'Nạp xu qua QR Code (Manual)',
    p_transaction_code
  );
  
  -- Update payment session
  UPDATE payment_sessions
  SET status = 'completed',
      completed_at = NOW()
  WHERE id = v_session.id;
  
  -- Lưu MBBank transaction
  INSERT INTO mbbank_transactions (transaction_id, user_id, amount_vnd, coins_added)
  VALUES (p_transaction_code, p_user_id, p_amount_vnd, v_session.coins_amount);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Coins added successfully',
    'coins_added', v_session.coins_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manual_add_coins TO authenticated;

-- Example usage:
-- SELECT manual_add_coins(
--   'user-id-here',
--   'NAPXU12345678',
--   100000
-- );

SELECT 'Function manual_add_coins created!' AS message;
