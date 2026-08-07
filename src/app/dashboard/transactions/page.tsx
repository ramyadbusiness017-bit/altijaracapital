import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TransactionsOverview from '@/components/TransactionsOverview';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  let ethPrice = 3000;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { next: { revalidate: 300 } });
    const data = await res.json();
    if (data?.ethereum?.usd) ethPrice = data.ethereum.usd;
  } catch (e) {}

  return (
    <TransactionsOverview transactions={transactions || []} ethPrice={ethPrice} />
  );
}
