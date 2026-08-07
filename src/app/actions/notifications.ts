"use server";

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function sendNotification(userId: string, title: string, message: string, type: string = 'info', shouldRevalidate: boolean = true) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type
  });
  if (error) throw new Error(error.message);
  
  if (shouldRevalidate) {
    try {
      revalidatePath('/dashboard', 'layout');
    } catch (e) {
      console.warn('Skipping revalidation: ', e);
    }
  }
  return { success: true };
}

export async function sendMassNotification(title: string, message: string, type: string = 'info') {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (!profiles) throw new Error("No profiles found");

  const notifications = profiles.map(p => ({
    user_id: p.id,
    title,
    message,
    type
  }));

  const { error } = await supabase.from('notifications').insert(notifications);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
