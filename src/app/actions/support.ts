'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitSupportTicket(subject: string, message: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!subject || !message) {
      return { success: false, error: 'Subject and message are required' };
    }

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject,
        message,
        status: 'Open'
      });

    if (error) {
      console.error('Error inserting support ticket:', error);
      return { success: false, error: error.message };
    }

    // Attempt to send email notification to admins
    try {
      if (process.env.RESEND_API_KEY) {
        // You can change 'admin@al-tijaracapital.com' to your actual operational support email
        await resend.emails.send({
          from: 'Support System <onboarding@resend.dev>',
          to: 'admin@al-tijaracapital.com', 
          subject: `New Support Ticket: ${subject}`,
          html: `
            <h2>New Support Ticket</h2>
            <p><strong>From User:</strong> ${user.email} (ID: ${user.id})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background:#f9f9f9;padding:15px;border-left:5px solid #ccc;color:#000;">${message}</blockquote>
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin email notification via Resend:', emailError);
      // We don't fail the ticket creation if the email fails
    }

    revalidatePath('/dashboard/support');
    return { success: true };
  } catch (err: any) {
    console.error('Submit support ticket exception:', err);
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}
