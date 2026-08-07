import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import TopUtilityBar from '@/components/TopUtilityBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { generateUIA } from '@/lib/wallet'
import { NotificationsProvider } from '@/components/NotificationsProvider'
import DashboardHeader from '@/components/DashboardHeader'

export const metadata = {
  title: 'Portfolio | Al-Tijara',
  description: 'Institutional Crypto Wealth Management',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_balance, earnings_balance, wallet_balance, uia_address, uid, avatar_url, investment_start_date, last_yield_calculation, capital_withdrawal_permitted')
    .eq('id', user.id)
    .single()

  // --- Just-In-Time (JIT) Auto-Provisioning for Legacy Users ---
  // If an old user refreshes the dashboard, ensure they get their UIA and UID seamlessly!
  if (!profile?.uia_address || !profile?.uid) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { count } = await adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('uia_address', 'is', null);

    const walletIndex = count || 0;
    const uiaAddress = profile?.uia_address || generateUIA(walletIndex);
    const customUid = profile?.uid || `AJ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const firstName = user.user_metadata?.first_name || 'Investor';
    const lastName = user.user_metadata?.last_name || '';
    const avatarUrl = user.user_metadata?.avatar_url || profile?.avatar_url || '';

    await adminSupabase.from('profiles').upsert({
      id: user.id,
      uia_address: uiaAddress,
      wallet_address: uiaAddress,
      uid: customUid,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl
    }, { onConflict: 'id' });
    
    // Fallback sync user metadata just in case
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: { wallet_index: walletIndex, first_name: firstName, last_name: lastName, avatar_url: avatarUrl }
    });
  }
  // --- Auto-Maturity Check for Day 30 ---
  if (profile?.capital_balance && profile?.capital_balance > 0 && profile?.investment_start_date && !profile?.capital_withdrawal_permitted) {
    const startObj = new Date(profile.investment_start_date).getTime();
    const now = Date.now();
    const daysCompleted = (now - startObj) / (1000 * 60 * 60 * 24);

    if (daysCompleted >= 30) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Auto-authorize capital withdrawal
      await adminSupabase.from('profiles').update({ capital_withdrawal_permitted: true }).eq('id', user.id);
      
      const { sendNotification } = await import('@/app/actions/notifications');
      await sendNotification(
        user.id,
        "Investment Cycle Complete",
        "Congratulations. Your investment cycle has reached maturity. Your principal capital is now unlocked and available. Please login to select your next action.",
        "success",
        false
      );
    }
  }

  // --- Auto-Sync Earnings Milestones Ledger ---
  if (profile?.capital_balance && profile?.capital_balance > 0 && profile?.investment_start_date) {
    const { syncEarningsMilestones } = await import('@/app/actions/wallet');
    // Non-blocking sync
    syncEarningsMilestones(user.id).catch(console.error);
  }
  // -------------------------------------------------------------

  const firstName = user.user_metadata?.first_name || 'User'
  const lastName = user.user_metadata?.last_name || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || ''
  
  // Real-time yield calculation
  const SECONDS_IN_WEEK = 604800;
  let realtimeEarnings = profile?.earnings_balance || 0;
  if (profile?.capital_balance && profile?.capital_balance > 0 && (profile?.investment_start_date || profile?.last_yield_calculation)) {
    const lastCalc = new Date(profile.last_yield_calculation || profile.investment_start_date).getTime();
    const elapsed = (Date.now() - lastCalc) / 1000;
    realtimeEarnings += profile.capital_balance * 0.30 * (elapsed / SECONDS_IN_WEEK);
  }

  // Total Portfolio = Wallet + Capital + Real-time Earnings
  // Note: If you want to include ETH balance in the total USD value, you could add (profile?.eth_balance * approximate_eth_price)
  const totalPortfolio = (profile?.wallet_balance || 0) + (profile?.capital_balance || 0) + realtimeEarnings
  return (
    <div className="flex h-screen bg-[#070A0D] text-slate-200 overflow-hidden">
      <NotificationsProvider userId={user.id}>
        <Sidebar 
          firstName={firstName} 
          lastName={lastName} 
          portfolioValue={totalPortfolio} 
          avatarUrl={avatarUrl}
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-smooth">
            <DashboardHeader firstName={firstName} />
            {children}
          </main>
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <MobileNav />
          </div>
        </div>
      </NotificationsProvider>
    </div>
  )
}
