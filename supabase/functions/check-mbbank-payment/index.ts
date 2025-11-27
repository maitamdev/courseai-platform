// Supabase Edge Function để check payment từ MBBank
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MBBANK_ACCOUNT = '0877724374';
const MBBANK_NAME = 'MAI TRAN THIEN TAM';

// Tỷ lệ: 1000 VND = 1 coin
const VND_TO_COIN_RATE = 1000;

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Lấy danh sách giao dịch từ MBBank API
    // Note: Bạn cần đăng ký API với MBBank hoặc dùng service trung gian
    const mbBankResponse = await fetch('https://api.mbbank.com.vn/transactions', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MBBANK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mbBankResponse.ok) {
      throw new Error('Failed to fetch MBBank transactions');
    }

    const transactions = await mbBankResponse.json();

    // Lọc các giao dịch chưa xử lý
    for (const transaction of transactions) {
      const { id: transactionId, amount, description, timestamp } = transaction;

      // Check xem transaction đã được xử lý chưa
      const { data: existing } = await supabaseClient
        .from('mbbank_transactions')
        .select('id')
        .eq('transaction_id', transactionId)
        .single();

      if (existing) continue; // Đã xử lý rồi

      // Parse user_id từ description (format: "NAP XU [user_id]")
      const match = description.match(/NAP XU\s+([a-f0-9-]+)/i);
      if (!match) continue;

      const userId = match[1];

      // Tính số coin
      const coins = Math.floor(amount / VND_TO_COIN_RATE);

      // Cộng coin cho user
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('total_coins')
        .eq('id', userId)
        .single();

      if (!profile) continue;

      await supabaseClient
        .from('profiles')
        .update({ total_coins: profile.total_coins + coins })
        .eq('id', userId);

      // Lưu transaction
      await supabaseClient.from('coin_transactions').insert({
        user_id: userId,
        transaction_type: 'purchase',
        amount: coins,
        description: `Nạp ${coins} xu qua MBBank`,
        reference_id: transactionId,
      });

      // Đánh dấu đã xử lý
      await supabaseClient.from('mbbank_transactions').insert({
        transaction_id: transactionId,
        user_id: userId,
        amount_vnd: amount,
        coins_added: coins,
        processed_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
