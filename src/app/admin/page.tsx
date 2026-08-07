import { createAdminClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch pending transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Fetch support tickets
  const { data: rawTickets } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  // Map profiles to tickets manually since they both reference auth.users rather than each other
  const tickets = (rawTickets || []).map(ticket => ({
    ...ticket,
    profiles: profiles?.find(p => p.id === ticket.user_id) || null
  }));

  // Fetch ETH price
  let ethPrice = 3000;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ethereum?.usd) {
        ethPrice = data.ethereum.usd;
      }
    }
  } catch (err) {
    console.error("Failed to fetch ETH price for admin dashboard:", err);
  }

  return (
    <AdminDashboard 
      initialProfiles={profiles || []} 
      initialTransactions={transactions || []} 
      initialTickets={tickets}
      ethPrice={ethPrice}
    />
  );
}
