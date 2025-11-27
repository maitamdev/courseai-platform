import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  accountNo: string;
  transactionId: string;
  amount: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { accountNo, transactionId, amount }: PaymentRequest = await req.json();

    // TODO: Tích hợp với payment gateway
    // Hiện tại trả về mock data để test
    // Trong production, thay bằng API thật từ Casso, VietQR, hoặc Google Apps Script
    
    // Mock response - luôn trả về success sau 10 giây (để test)
    const mockSuccess = Math.random() > 0.5;
    
    return new Response(
      JSON.stringify({ 
        success: mockSuccess, 
        transaction: {
          accountNo,
          transactionId,
          amount,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});
