import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateUIA } from '@/lib/wallet'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Elevate to Admin Client to bypass RLS for profile creation
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Check if user already has their UIA and UID set up
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('uia_address, uid')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.uia_address || !profile.uid) {
        console.log(`[Google Auth] First time login detected for ${user.email}. Generating Treasury Profile...`);

        try {
          // Generate UIA Wallet Index
          const { count, error: countError } = await adminSupabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('uia_address', 'is', null);
          
          if (countError) throw countError;

          const walletIndex = count || 0;
          const uiaAddress = generateUIA(walletIndex);
          
          // Generate Custom UID (e.g., AJ-XXXXXX)
          const randomString = Math.random().toString(36).substring(2, 9).toUpperCase();
          const customUid = `AJ-${randomString}`;

          // Safely extract names and avatar from Google OAuth metadata
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Keep auth.users metadata synced just in case
          await adminSupabase.auth.admin.updateUserById(user.id, {
            user_metadata: { 
              wallet_index: walletIndex,
              first_name: firstName,
              last_name: lastName,
              avatar_url: avatarUrl
            }
          });

          // The "Perfect" Architecture: Hard-saving everything directly to the profiles table
          const { error: upsertError } = await adminSupabase
            .from('profiles')
            .upsert({
              id: user.id,
              uia_address: uiaAddress,
              wallet_address: uiaAddress,
              uid: customUid,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              avatar_url: avatarUrl
            }, { onConflict: 'id' });

          if (upsertError) {
            console.error('[Google Auth] CRITICAL: Failed to save Master Profile to database:', upsertError.message);
          } else {
            console.log(`[Google Auth] Successfully provisioned UID ${customUid} and Master Profile for ${user.email}`);
          }

        } catch (err) {
          console.error('[Google Auth] Failed during auto-provisioning sequence:', err);
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('[Google Auth] Code Exchange Failed:', error?.message);
    }
  }

  // Redirect to login with error if auth failed or code is missing
  return NextResponse.redirect(`${origin}/login?error=Google%20Authentication%20Failed`)
}