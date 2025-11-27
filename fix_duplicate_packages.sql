-- Fix Duplicate Coin Packages
-- Xóa payment sessions cũ và packages, tạo lại sạch

-- 1. Delete old payment sessions first (to avoid foreign key constraint)
DELETE FROM payment_sessions;

-- 2. Delete all packages
DELETE FROM coin_packages;

-- 3. Insert clean packages (5 gói duy nhất với màu sắc đẹp)
INSERT INTO coin_packages (name, coins, price_vnd, bonus_coins, is_popular) VALUES
('Gói Test', 10, 10000, 0, false),
('Gói Cơ Bản', 100, 100000, 0, false),
('Gói Phổ Biến', 300, 300000, 30, true),
('Gói Tiết Kiệm', 500, 500000, 100, false),
('Gói VIP', 2000, 2000000, 500, false);

-- 4. Verify
SELECT 
  name,
  coins,
  bonus_coins,
  coins + bonus_coins as total_coins,
  price_vnd,
  is_popular,
  CASE 
    WHEN is_popular THEN '⭐ Popular'
    ELSE '✓ Available'
  END as status
FROM coin_packages 
ORDER BY price_vnd;

SELECT '✅ Done! 5 clean packages created' as result;
