'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateUIA } from '@/lib/wallet'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const referredBy = formData.get('referredBy') as string | null

  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        onboarding_data: {
          referredBy: referredBy || ''
        }
      }
    }
  })

  if (error) {
    console.error('Error signing up:', error.message)
    redirect('/?error=' + encodeURIComponent(error.message))
  }

  // Generate the HD Wallet (UIA)
  if (data.user) {
    try {
      const adminSupabase = await createAdminClient();

      const { count } = await adminSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('wallet_address', 'is', null);

      const uiaAddress = generateUIA(count || 0);
      
      // Update or insert the profile with the generated UIA
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          wallet_address: uiaAddress
        }, { onConflict: 'id' });
        
      if (profileError) {
        console.error('Error saving profile UIA:', profileError.message);
      }
    } catch (err) {
      console.error('Failed to generate UIA:', err);
    }
  }

  // Redirect to verify page for OTP email verification if email confirmation is required,
  // or directly to dashboard if auto-confirmed.
  redirect(`/verify?email=${encodeURIComponent(email)}`)
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract email from form
  const email = formData.get('email') as string

  // We use standard Supabase OTP. To have this use Resend for delivery,
  // ensure the Resend API Key is set in Supabase Dashboard -> Auth -> Custom SMTP.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // In a real app we might redirect to a specific URL after magic link click,
      // but here we are primarily relying on the 6-digit OTP code entry.
      shouldCreateUser: true,
    },
  })

  if (error) {
    console.error('Error sending OTP:', error.message)
    // In production, handle errors via UI toast/flash message
    redirect('/login?error=Could not send access code')
  }

  // Redirect to verify page, passing the email via search params so they don't have to re-enter it
  redirect(`/verify?email=${encodeURIComponent(email)}`)
}

export async function loginWithPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let errorMessage: string | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error signing in:', error.message)
      errorMessage = 'Invalid email or password';
    }
  } catch (err: any) {
    console.error('Unhandled exception during login:', err);
    errorMessage = 'Server connection error';
  }

  if (errorMessage) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  redirect('/dashboard')
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const code = formData.get('code') as string

  // First try verifying it as a signup OTP
  let { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  })

  // If that fails, it might be a login OTP
  if (error) {
    const { error: loginError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    error = loginError
  }

  if (error) {
    console.error('Error verifying OTP:', error.message)
    redirect(`/verify?email=${encodeURIComponent(email)}&error=Invalid or expired code`)
  }

  // OTP verified successfully. Now fetch the user to generate their UIA and custom UID.
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      // Update the profile securely bypassing RLS
      const adminSupabase = await createAdminClient();

      // Fetch the next sequential HD Wallet index by counting active UIAs
      const { count, error: countError } = await adminSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('wallet_address', 'is', null);
      
      if (countError) throw countError;

      const walletIndex = count || 0;
      const uiaAddress = generateUIA(walletIndex);
      
      // Generate custom AJ-XXXXXXX format
      const randomString = Math.random().toString(36).substring(2, 9).toUpperCase();
      const customUid = `AJ-${randomString}`;

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({
          wallet_address: uiaAddress,
          uid: customUid,
          referral_code: customUid,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          referred_by: user.user_metadata?.onboarding_data?.referredBy || ''
        })
        .eq('id', user.id);
        
      // Permanently save the wallet index to user metadata to track derivation
      if (!updateError) {
        await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: { wallet_index: walletIndex }
        });
      }
        
      if (updateError) {
        console.error('RLS/Admin update error:', updateError);
      }
        
    } catch (err) {
      console.error('Failed to generate UIA during verification:', err);
    }
  }

  // Successfully verified OTP! Now prompt them to create a password.
  redirect('/setup/password')
}

export async function resendOtp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    // If signup resend fails, try login resend
    const { error: loginError } = await supabase.auth.resend({
      type: 'signup', // Wait, type should be 'signup' or 'magiclink'. Let's use signInWithOtp again.
      email
    });
  }
  
  // It's cleaner to just re-run signInWithOtp to recreate the OTP!
  const { error: resendError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });

  if (resendError) {
    redirect(`/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent(resendError.message)}`)
  }

  // Redirect with a success param or just reload
  redirect(`/verify?email=${encodeURIComponent(email)}&error=Code%20Resent%20Successfully`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function loginWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://altijaracapital.vercel.app'

  if (formData) {
    const referredBy = formData.get('referredBy') as string;
    if (referredBy) {
      const cookieStore = await cookies();
      const existingStr = cookieStore.get('altijara_onboarding_data')?.value;
      let data: any = {};
      if (existingStr) {
        try { data = JSON.parse(existingStr) } catch(e) {}
      }
      data.referredBy = referredBy;
      cookieStore.set('altijara_onboarding_data', JSON.stringify(data), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google Auth Error:', error.message)
    redirect('/login?error=Could not initiate Google login')
  }

  if (data.url) {
    redirect(data.url)
  }
}




