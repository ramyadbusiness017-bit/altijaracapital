import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WalletHome from '@/components/WalletHome';

export const dynamic = 'force-dynamic';

export default async function InvestmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance, wallet_balance, eth_balance, last_yield_calculation, investment_start_date, earnings_withdrawal_permitted, capital_withdrawal_permitted')
    .eq('id', user.id)
    .single();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const firstName = user.user_metadata?.first_name || 'Investor';
  const capBalance = profile?.capital_balance || 0;
  const earnBalance = profile?.earnings_balance || 0;
  const walletBalance = profile?.wallet_balance || 0;
  const ethBalance = profile?.eth_balance || 0;
  const lastYieldCalc = profile?.last_yield_calculation || null;
  const investmentStartDate = profile?.investment_start_date || null;

  return (
    <WalletHome 
      firstName={firstName}
      userId={user.id}
      initialCapital={capBalance}
      initialEarnings={earnBalance}
      walletBalance={walletBalance}
      ethBalance={ethBalance}
      lastYieldCalculation={lastYieldCalc}
      investmentStartDate={investmentStartDate}
      transactions={[]}
      notifications={notifications || []}
      earningsPermitted={profile?.earnings_withdrawal_permitted || false}
      capitalPermitted={profile?.capital_withdrawal_permitted || false}
    />
  );
}
