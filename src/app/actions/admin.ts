"use server";

import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendNotification } from './notifications';

async function checkAdminSession() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    throw new Error("Unauthorized: Admin access required");
  }
}

function getRawAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function processTransaction(txId: string, action: 'process' | 'approve' | 'decline', ethPrice: number = 3000) {
  await checkAdminSession();
  const supabase = getRawAdminClient();

  // Get transaction details
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (txError || !tx) throw new Error("Transaction not found");
  
  if (action === 'process' && tx.status !== 'pending') {
    throw new Error("Only pending transactions can be marked as processing");
  }
  if (action === 'approve' && tx.status !== 'processing' && tx.status !== 'pending') {
    throw new Error("Transaction must be pending or processing to be approved");
  }

  // Handle Wallet Updates (Approve Deposits / Decline Withdrawals)
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('wallet_balance, eth_balance, capital_balance, earnings_balance')
    .eq('id', tx.user_id)
    .single();

  if (userProfile) {
    const updates: any = {};
    
    if (action === 'decline' && (tx.type === 'withdraw' || tx.type === 'withdrawal' || tx.type === 'withdrawal_capital' || tx.type === 'withdrawal_earnings')) {
      let subType = tx.type;
      let amountToRefund = tx.amount;
      
      if (tx.tx_hash) {
        if (tx.tx_hash.startsWith('{')) {
          try {
            const parsed = JSON.parse(tx.tx_hash);
            subType = parsed.original_tx_hash || subType;
          } catch (e) {}
        } else {
          subType = tx.tx_hash;
        }
      }
      
      if (subType === 'eth_withdrawal' || subType === 'withdrawal_gas') {
        const GAS_FEE = 0.001625;
        updates.eth_balance = (userProfile.eth_balance || 0) + amountToRefund + GAS_FEE;
      } else if (subType === 'wallet_withdrawal' || subType === 'withdrawal_capital' || tx.type === 'withdraw' || tx.type === 'withdrawal') {
        updates.wallet_balance = (userProfile.wallet_balance || 0) + amountToRefund;
      } else if (subType === 'withdrawal_earnings') {
        updates.earnings_balance = (userProfile.earnings_balance || 0) + amountToRefund;
      }
    } else if (action === 'approve' && (tx.type === 'deposit' || tx.type === 'wallet_deposit')) {
      let subType = tx.type;
      let amountToCredit = tx.amount;
      
      if (tx.tx_hash) {
        if (tx.tx_hash.startsWith('{')) {
          try {
            const parsed = JSON.parse(tx.tx_hash);
            subType = parsed.original_tx_hash || subType;
          } catch (e) {}
        } else {
          subType = tx.tx_hash;
        }
      }
      
      if (subType === 'eth_deposit') {
        updates.eth_balance = (userProfile.eth_balance || 0) + amountToCredit;
      } else {
        updates.wallet_balance = (userProfile.wallet_balance || 0) + amountToCredit;
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', tx.user_id);
    }
  }

  // Handle Notifications & Extended Status
  let newStatus = tx.status;
  let txHashObj: any = {};
  
  if (tx.tx_hash && tx.tx_hash.startsWith('{')) {
    try { txHashObj = JSON.parse(tx.tx_hash); } catch(e) {}
  } else if (tx.tx_hash) {
    txHashObj = { original_tx_hash: tx.tx_hash };
  }

  let amountStr = `${tx.amount}`;
  let isEth = tx.type === 'eth_deposit' || tx.type === 'eth_withdrawal' || tx.tx_hash === 'eth_deposit' || tx.tx_hash === 'eth_withdrawal' || txHashObj?.original_tx_hash === 'eth_deposit' || txHashObj?.original_tx_hash === 'eth_withdrawal' || txHashObj?.token === 'ETH';
  if (isEth) {
    amountStr = `${tx.amount} ETH (~$${(tx.amount * ethPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`;
  } else {
    amountStr = `$${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USDT`;
  }

  if (action === 'process') {
    newStatus = 'processing';
    txHashObj.extended_status = 'processing';
    await sendNotification(
      tx.user_id,
      "Transaction Processing",
      `Your ${tx.type === 'deposit' ? 'deposit' : 'withdrawal'} of ${amountStr} is currently being processed on the network and awaiting block confirmations.`,
      "info"
    );
  } else if (action === 'approve') {
    newStatus = 'completed';
    txHashObj.extended_status = 'completed';
    await sendNotification(
      tx.user_id,
      "Transaction Completed",
      `Your ${tx.type === 'deposit' ? 'deposit' : 'withdrawal'} of ${amountStr} has been successfully confirmed on the network.`,
      "success"
    );
  } else if (action === 'decline') {
    newStatus = 'rejected';
    txHashObj.extended_status = 'rejected';
    await sendNotification(
      tx.user_id,
      "Transaction Failed",
      `Your ${tx.type === 'deposit' ? 'deposit' : 'withdrawal'} of ${amountStr} failed on the network. Funds have been securely reverted to your balance.`,
      "error"
    );
  }

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({ 
      status: newStatus,
      tx_hash: JSON.stringify(txHashObj) 
    })
    .eq('id', txId);
    
  if (updateErr) {
    if (updateErr.message.includes('invalid input value for enum')) {
      let fallbackStatus = newStatus;
      if (newStatus === 'processing') fallbackStatus = 'pending';
      if (newStatus === 'completed') fallbackStatus = 'approved';
      
      await supabase
        .from('transactions')
        .update({ 
          status: fallbackStatus,
          tx_hash: JSON.stringify(txHashObj)
        })
        .eq('id', txId);
    } else {
      throw updateErr;
    }
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function toggleUserPermit(targetUserId: string, type: 'earnings' | 'capital' | 'gas', currentValue: boolean) {
  await checkAdminSession();
  const supabase = getRawAdminClient();

  let column = '';
  if (type === 'earnings') column = 'earnings_withdrawal_permitted';
  else if (type === 'capital') column = 'capital_withdrawal_permitted';
  else if (type === 'gas') column = 'block_gas_fees';
  
  await supabase
    .from('profiles')
    .update({ [column]: !currentValue })
    .eq('id', targetUserId);

  if (type === 'capital' && !currentValue === true) {
    await sendNotification(
      targetUserId,
      "Investment Cycle Complete",
      "Congratulations. Your investment cycle has reached maturity. Your principal capital is now unlocked and available. Please login to select your next action.",
      "success"
    );
  } else if (type === 'earnings' && !currentValue === true) {
    // Sync the ledger for the manual bypass
    const { data: profile } = await supabase
      .from('profiles')
      .select('capital_balance, earnings_balance, investment_start_date, last_yield_calculation')
      .eq('id', targetUserId)
      .single();

    if (profile && (profile.capital_balance || 0) > 0) {
      const SECONDS_IN_WEEK = 604800;
      const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
      const elapsed = (Date.now() - lastCalc) / 1000;
      const realtimeEarnings = (profile.capital_balance * 0.30 * (elapsed / SECONDS_IN_WEEK));

      if (realtimeEarnings > 0) {
        await supabase
          .from('transactions')
          .insert({
            user_id: targetUserId,
            amount: realtimeEarnings,
            type: 'deposit',
            tx_hash: 'investment_earnings',
            status: 'approved',
            description: 'Manual Earnings Payout'
          });
      }
    }

    await sendNotification(
      targetUserId,
      "Earnings Payout Authorized",
      "Your current investment earnings have been successfully unlocked and are now available for withdrawal.",
      "success"
    );
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function updateUserBalances(targetUserId: string, newWalletBalance: number, newCapitalBalance: number) {
  await checkAdminSession();
  const supabase = getRawAdminClient();

  if (newWalletBalance < 0 || newCapitalBalance < 0) throw new Error("Balances cannot be negative");

  const { error } = await supabase
    .from('profiles')
    .update({ 
      wallet_balance: newWalletBalance,
      capital_balance: newCapitalBalance
    })
    .eq('id', targetUserId);

  if (error) throw new Error("Failed to update balances");

  await supabase
    .from('transactions')
    .insert({
      user_id: targetUserId,
      amount: 0, 
      type: 'deposit', 
      status: 'approved'
    });

  revalidatePath('/admin');
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function adminAdjustBalance(targetUserId: string, assetType: 'wallet' | 'capital' | 'eth', actionType: 'add' | 'deduct', amount: number) {
  await checkAdminSession();
  if (amount <= 0) throw new Error("Amount must be greater than 0");

  const supabase = getRawAdminClient();
  
  // 1. Fetch current profile to get current balance
  const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
  if (profileErr || !profile) throw new Error("Profile not found");

  // 2. Determine column and calculate new balance
  let column = '';
  let currentBalance = 0;
  let txType = '';
  let txHash = '';
  let notificationTitle = '';
  let notificationMsg = '';

  if (assetType === 'wallet') {
    column = 'wallet_balance';
    currentBalance = profile.wallet_balance || 0;
    txType = actionType === 'add' ? 'deposit' : 'withdraw';
    txHash = actionType === 'add' ? 'wallet_deposit' : 'wallet_withdrawal';
    notificationTitle = actionType === 'add' ? 'Deposit Successful' : 'Withdrawal Processed';
    notificationMsg = actionType === 'add' ? `Your deposit of $${amount.toLocaleString()} to your Liquid Wallet was successful.` : `Your withdrawal of $${amount.toLocaleString()} from your Liquid Wallet has been processed.`;
  } else if (assetType === 'capital') {
    column = 'capital_balance';
    currentBalance = profile.capital_balance || 0;
    txType = actionType === 'add' ? 'deposit' : 'withdraw';
    txHash = actionType === 'add' ? 'capital_deployment' : 'capital_withdrawal';
    notificationTitle = actionType === 'add' ? 'Investment Active' : 'Capital Withdrawn';
    notificationMsg = actionType === 'add' ? `Your capital investment of $${amount.toLocaleString()} is now active.` : `Your capital withdrawal of $${amount.toLocaleString()} was successful.`;
  } else if (assetType === 'eth') {
    column = 'eth_balance';
    currentBalance = profile.eth_balance || 0;
    txType = actionType === 'add' ? 'deposit' : 'withdraw';
    txHash = actionType === 'add' ? 'eth_deposit' : 'eth_withdrawal';
    notificationTitle = actionType === 'add' ? 'ETH Deposit Successful' : 'ETH Withdrawal Processed';
    notificationMsg = actionType === 'add' ? `Your deposit of ${amount} ETH was successful.` : `Your withdrawal of ${amount} ETH has been processed.`;
  }

  const newBalance = actionType === 'add' ? (currentBalance + amount) : (currentBalance - amount);
  if (newBalance < 0) throw new Error("Insufficient funds to deduct this amount.");

  // 3. Update Balance
  const { error: updateErr } = await supabase.from('profiles').update({ [column]: newBalance }).eq('id', targetUserId);
  if (updateErr) throw new Error("Failed to update balance");

  // 4. Create organic-looking transaction record
  await supabase.from('transactions').insert({
    user_id: targetUserId,
    amount: amount,
    type: txType,
    tx_hash: txHash,
    status: 'approved'
  });

  // 5. Send notification to user so they think it happened naturally
  try {
    await sendNotification(targetUserId, notificationTitle, notificationMsg, 'success');
  } catch(e) {
    console.error("Failed to send notification for balance adjust:", e);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard', 'layout');
  return { success: true, newBalance };
}

export async function resolveSupportTicket(ticketId: string, newStatus: 'Resolved' | 'Open') {
  await checkAdminSession();
  
  // We MUST use the raw @supabase/supabase-js client to bypass RLS since there is no UPDATE policy on support_tickets
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await adminSupabase
    .from('support_tickets')
    .update({ status: newStatus })
    .eq('id', ticketId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard/support');
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
