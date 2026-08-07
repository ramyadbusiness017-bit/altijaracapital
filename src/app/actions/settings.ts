'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateProfile(firstName: string, lastName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Update auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
    }
  });

  if (authError) {
    console.error('Error updating auth metadata:', authError);
    return { success: false, error: authError.message };
  }

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Update profiles table using admin client to bypass restrictive RLS
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    return { success: false, error: profileError.message };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });

  if (authError) return { success: false, error: authError.message };

  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (profileError) return { success: false, error: profileError.message };

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function uploadAvatarFile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  
  const buffer = await file.arrayBuffer();

  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  const { error: uploadError } = await adminSupabase.storage
    .from('avatars')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: { publicUrl } } = adminSupabase.storage.from('avatars').getPublicUrl(fileName);

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (authError) return { success: false, error: authError.message };

  const { error: profileError } = await adminSupabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  if (profileError) return { success: false, error: profileError.message };

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  
  return { success: true, url: publicUrl };
}

export async function updateNotificationPrefs(prefs: { email: boolean, push: boolean, marketing: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      email_notifs: prefs.email,
      push_notifs: prefs.push,
      marketing_notifs: prefs.marketing,
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}


