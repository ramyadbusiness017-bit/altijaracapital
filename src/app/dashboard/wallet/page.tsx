import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WalletOverview from '@/components/WalletOverview';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, wallet_balance, wallet_address, uia_address, eth_balance, block_gas_fees')
    .eq('id', user.id)
    .single();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const firstName = profile?.first_name || 'Investor';
  const walletBalance = profile?.wallet_balance || 0;
  const ethBalance = profile?.eth_balance || 0;
  const walletAddress = profile?.wallet_address || profile?.uia_address || null;
  const blockGasFees = profile?.block_gas_fees || false;

  // Server-side fetching of real-time crypto prices
  let initialEthPrice = 3000;
  let initialEthChange = 0;
  let initialUsdtPrice = 1; // Default to $1 as requested

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether&vs_currencies=usd&include_24hr_change=true', {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ethereum?.usd) {
        initialEthPrice = data.ethereum.usd;
        initialEthChange = data.ethereum.usd_24h_change || 0;
      }
      if (data.tether?.usd) {
        initialUsdtPrice = data.tether.usd;
      }
    }
  } catch (error) {
    console.error("Server-side price fetch failed:", error);
  }

  return (
    <WalletOverview 
      firstName={firstName}
      userId={user.id}
      walletBalance={walletBalance}
      ethBalance={ethBalance}
      walletAddress={walletAddress}
      transactions={transactions || []}
      initialEthPrice={initialEthPrice}
      initialEthChange={initialEthChange}
      initialUsdtPrice={initialUsdtPrice}
      blockGasFees={blockGasFees}
    />
  );
}
