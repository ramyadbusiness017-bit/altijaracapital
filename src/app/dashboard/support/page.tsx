import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SupportCenter from '@/components/SupportCenter';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Help & Support | Al-Tijara Capital',
  description: 'Get help and send queries to Al-Tijara Capital support team',
};

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get past tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <SupportCenter initialTickets={tickets || []} />;
}
