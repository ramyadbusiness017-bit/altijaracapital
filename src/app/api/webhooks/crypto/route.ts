import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This is a placeholder webhook endpoint to receive real-time deposits.
// When you integrate with a provider like NowPayments, CoinPayments, or Alchemy,
// you will point their webhook URL to: https://yourdomain.com/api/webhooks/crypto

export async function POST(request: Request) {
  try {
    // 1. Verify Webhook Signature (Crucial for security)
    // const signature = request.headers.get('x-webhook-signature');
    // if (!verifySignature(signature, payload)) return new Response('Unauthorized', { status: 401 });

    const payload = await request.json();

    // Example payload extraction (adjust based on your provider)
    const { 
      wallet_address, // The address the user deposited to
      amount,         // Amount in crypto/USD
      currency,       // e.g., 'USDT'
      status,         // e.g., 'finished'
      tx_hash         // The blockchain hash
    } = payload;

    // Only process completed deposits
    if (status !== 'finished' && status !== 'completed') {
      return NextResponse.json({ received: true, status: 'ignored_not_completed' });
    }

    const supabase = await createClient();

    // 2. Find the user who owns this wallet address
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, wallet_balance')
      .eq('wallet_address', wallet_address)
      .single();

    if (profileError || !profile) {
      console.error('Webhook Error: Wallet address not found', wallet_address);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Prevent duplicate processing using tx_hash
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('tx_hash', tx_hash) // Requires adding tx_hash column to transactions table
      .single();
      
    if (existingTx) {
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // 4. Automatically credit the user's wallet_balance (NO ADMIN APPROVAL NEEDED)
    const newBalance = (profile.wallet_balance || 0) + parseFloat(amount);
    
    await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', profile.id);

    // 5. Log the completed deposit transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: profile.id,
        amount: parseFloat(amount),
        type: 'wallet_deposit',
        status: 'completed',
        // tx_hash: tx_hash 
      });

    return NextResponse.json({ received: true, credited: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
