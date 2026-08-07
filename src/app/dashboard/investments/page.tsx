import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InvestmentsHome from '@/components/InvestmentsHome';

export const dynamic = 'force-dynamic';

export default async function InvestmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance, investment_start_date, last_yield_calculation, earnings_withdrawal_permitted, capital_withdrawal_permitted, wallet_balance')
    .eq('id', user.id)
    .single();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .in('tx_hash', ['capital_deployment', 'withdrawal_capital', 'withdrawal_earnings', 'investment_earnings', 'capital_reinvestment'])
    .order('created_at', { ascending: false })
    .limit(10);

  const capBalance = profile?.capital_balance || 0;
  const earnBalance = profile?.earnings_balance || 0;
  const startDate = profile?.investment_start_date || null;
  const lastYieldCalc = profile?.last_yield_calculation || null;

  return (
    <InvestmentsHome 
      userId={user.id}
      capitalBalance={capBalance}
      earningsBalance={earnBalance}
      investmentStartDate={startDate}
      lastYieldCalculation={lastYieldCalc}
      transactions={transactions || []}
      earningsPermitted={profile?.earnings_withdrawal_permitted || false}
      capitalPermitted={profile?.capital_withdrawal_permitted || false}
      walletBalance={profile?.wallet_balance || 0}
    />
  );
}
