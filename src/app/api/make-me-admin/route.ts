import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // Get the currently logged in user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be logged in first. Go to /login and try again.' }, { status: 401 });
  }

  // Elevate the user to admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update profile to admin', details: updateError }, { status: 500 });
  }

  // Redirect them directly to the admin panel
  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
