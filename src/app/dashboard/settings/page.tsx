import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsOverview from '@/components/SettingsOverview';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, uid, created_at, avatar_url')
    .eq('id', user.id)
    .single();

  const firstName = profile?.first_name || user.user_metadata?.first_name || 'David';
  const lastName = profile?.last_name || user.user_metadata?.last_name || 'Johnson';
  const fullName = `${firstName} ${lastName}`.trim();
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Apr 20, 2025';

  const emailNotifs = user.user_metadata?.email_notifs ?? true;
  const pushNotifs = user.user_metadata?.push_notifs ?? true;
  const marketingNotifs = user.user_metadata?.marketing_notifs ?? false;

  return (
    <SettingsOverview 
      fullName={fullName}
      userId={profile?.uid || user.id.slice(0, 8)}
      email={user.email || ''}
      joinDate={joinDate}
      avatarUrl={profile?.avatar_url || user.user_metadata?.avatar_url || ''}
      initialEmailNotifs={emailNotifs}
      initialPushNotifs={pushNotifs}
      initialMarketingNotifs={marketingNotifs}
    />
  );
}
