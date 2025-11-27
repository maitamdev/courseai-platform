// Supabase Edge Function - Webhook từ Casso.vn để check payment
// @ts-ignore - Deno runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore - Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore - Deno global
    const supabaseClient = createClient(
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse webhook data từ Casso
    const webhookData = await req.json();
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Full webhook data:', JSON.stringify(webhookData, null, 2));

    // Casso có thể gửi nhiều format khác nhau:
    // Format 1: { data: { ... } }
    // Format 2: { data: [{ ... }] } <- CASSO GỬI FORMAT NÀY
    // Format 3: { ... } trực tiếp
    // Format 4: Array [{ ... }]
    let transactionData = webhookData;
    
    if (webhookData.data) {
      // Nếu data là array, lấy phần tử đầu tiên
      if (Array.isArray(webhookData.data) && webhookData.data.length > 0) {
        transactionData = webhookData.data[0];
        console.log('Using webhookData.data[0] (array format)');
      } else {
        transactionData = webhookData.data;
        console.log('Using webhookData.data (object format)');
      }
    } else if (Array.isArray(webhookData) && webhookData.length > 0) {
      transactionData = webhookData[0];
      console.log('Using first item from array');
    }

    console.log('Transaction data:', JSON.stringify(transactionData, null, 2));

    const description = transactionData.description || transactionData.Description || transactionData.desc || '';
    const amount = Math.abs(transactionData.amount || transactionData.Amount || 0); // Dùng Math.abs vì Casso có thể gửi số âm
    const tid = transactionData.tid || transactionData.transactionId || transactionData.id?.toString() || '';

    console.log('Parsed values:', { description, amount, tid });

    if (!description || !amount) {
      console.error('Missing required fields:', { description, amount });
      throw new Error('Invalid webhook data: missing description or amount');
    }

    // Parse transaction code từ description
    // Format: "NAPXU12345678 a1b2c3d4" hoặc "NAPXU12345678"
    const match = description.match(/NAPXU\d{8}/i);
    if (!match) {
      console.error('No transaction code found in description:', description);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No transaction code found',
          description: description
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transactionCode = match[0].toUpperCase();
    console.log('=== TRANSACTION CODE FOUND ===');
    console.log('Transaction code:', transactionCode);

    // Tìm payment session
    console.log('Searching for payment session...');
    const { data: session, error: sessionError } = await supabaseClient
      .from('payment_sessions')
      .select('*')
      .eq('transaction_code', transactionCode)
      .eq('status', 'pending')
      .single();

    console.log('Session query result:', { session, sessionError });

    if (sessionError || !session) {
      console.error('Payment session not found or already processed');
      console.error('Transaction code:', transactionCode);
      console.error('Error:', sessionError);
      
      // Kiểm tra xem session có tồn tại với status khác không
      const { data: anySession } = await supabaseClient
        .from('payment_sessions')
        .select('*')
        .eq('transaction_code', transactionCode)
        .single();
      
      console.log('Any session with this code:', anySession);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Session not found or already processed',
          transactionCode,
          existingSession: anySession
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check số tiền có khớp không
    console.log('=== CHECKING AMOUNT ===');
    console.log('Received amount:', amount);
    console.log('Expected amount:', session.amount_vnd);
    
    if (amount < session.amount_vnd) {
      console.error('Amount mismatch!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Amount mismatch',
          received: amount,
          expected: session.amount_vnd
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('=== PROCESSING PAYMENT ===');
    console.log('Session:', session);

    // Cộng xu cho user
    console.log('Fetching profile...');
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('total_coins')
      .eq('id', session.user_id)
      .single();

    console.log('Profile:', profile, 'Error:', profileError);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const oldCoins = profile.total_coins || 0;
    const newCoins = oldCoins + session.coins_amount;
    
    console.log('Updating coins:', { oldCoins, adding: session.coins_amount, newCoins });

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        total_coins: newCoins
      })
      .eq('id', session.user_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Profile updated successfully!');

    // Lưu transaction
    console.log('Creating coin transaction...');
    const { error: txError } = await supabaseClient.from('coin_transactions').insert({
      user_id: session.user_id,
      transaction_type: 'purchase',
      amount: session.coins_amount,
      description: `Nạp ${session.coins_amount} xu qua QR Code`,
      reference_id: tid || transactionCode,
    });

    if (txError) {
      console.error('Error creating coin transaction:', txError);
    } else {
      console.log('Coin transaction created!');
    }

    // Update payment session
    console.log('Updating payment session status...');
    const { error: sessionUpdateError } = await supabaseClient
      .from('payment_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (sessionUpdateError) {
      console.error('Error updating session:', sessionUpdateError);
    } else {
      console.log('Payment session updated!');
    }

    // Lưu MBBank transaction
    console.log('Creating MBBank transaction...');
    const { error: mbError } = await supabaseClient.from('mbbank_transactions').insert({
      transaction_id: tid || transactionCode,
      user_id: session.user_id,
      amount_vnd: amount,
      coins_added: session.coins_amount,
      processed_at: new Date().toISOString(),
    });

    if (mbError) {
      console.error('Error creating MBBank transaction:', mbError);
    } else {
      console.log('MBBank transaction created!');
    }

    console.log('=== PAYMENT PROCESSED SUCCESSFULLY ===');
    console.log({
      user_id: session.user_id,
      coins_added: session.coins_amount,
      old_balance: oldCoins,
      new_balance: newCoins,
      amount_vnd: amount,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed',
        coins_added: session.coins_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
