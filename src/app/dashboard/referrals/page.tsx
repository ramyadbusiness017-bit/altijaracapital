import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralsOverview from '@/components/ReferralsOverview';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, referral_code')
    .eq('id', user.id)
    .single();

  const { data: referrals } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, has_funded, created_at')
    .eq('referred_by', profile?.referral_code || '');

  const { data: referralTx } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('tx_hash', 'referral_bonus')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const firstName = profile?.first_name || 'Investor';

  return (
    <ReferralsOverview 
      firstName={firstName}
      userId={user.id}
      referralCode={profile?.referral_code || ''}
      referrals={referrals || []}
      referralEarnings={referralTx || []}
    />
  );
}
