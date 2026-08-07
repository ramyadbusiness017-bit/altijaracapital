"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "AdminSecure2026!";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Issue a secure cookie session
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return { success: true };
  }

  return { error: 'Invalid credentials' };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}
