"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const GAS_FEE_USDT = 2.00;

export async function submitDeposit(amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'deposit',
      amount: amount,
      status: 'pending'
    });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return { success: true, message: "Deposit request submitted successfully. Awaiting Admin Approval." };
}

export async function submitWithdrawal(type: 'withdrawal_earnings' | 'withdrawal_capital', amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized");

  // Fetch the user's current profile balances
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance, investment_start_date, eth_balance')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");

  const now = new Date().getTime();
  const startDate = profile.investment_start_date ? new Date(profile.investment_start_date).getTime() : now;
  const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);

  // Dynamic Gas Simulator (Deterministic algorithm based on current hour)
  // Simulates realistic ETH network congestion between $1.50 and $4.50
  const hourSeed = Math.floor(now / (1000 * 60 * 60));
  const pseudoRandom = Math.abs(Math.sin(hourSeed));
  const simulatedGasFee = Number((1.50 + (pseudoRandom * 3.0)).toFixed(2));

  // The Insufficient Funds Trap
  // By default eth_balance is 0. If they have less ETH than the gas fee, we reject.
  const ethBalanceUSDT = (profile.eth_balance || 0) * 3500; // Rough ETH to USDT conversion for the check
  if (ethBalanceUSDT < simulatedGasFee) {
    throw new Error("Insufficient ETH to cover network gas fee");
  }

  if (type === 'withdrawal_earnings') {
    if (amount > profile.earnings_balance) throw new Error("Insufficient earnings balance");
    if (daysElapsed < 7) {
      throw new Error(`Earnings are locked for 7 days. You have ${Math.ceil(7 - daysElapsed)} days remaining.`);
    }
  }

  if (type === 'withdrawal_capital') {
    if (amount > profile.capital_balance) throw new Error("Insufficient capital balance");
    if (daysElapsed < 30) {
      throw new Error(`Capital is strictly locked for 30 days. You have ${Math.ceil(30 - daysElapsed)} days remaining.`);
    }
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: type,
      amount: amount,
      gas_fee_deducted: simulatedGasFee,
      status: 'pending'
    });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return { success: true, message: "Withdrawal request submitted successfully. Awaiting Admin Approval." };
}
