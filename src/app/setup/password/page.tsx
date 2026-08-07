import SubmitButton from "../../../components/SubmitButton";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { clearSetupData } from "../../actions/setup";

export default async function PasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams.error || '';

  async function handleCreatePassword(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      redirect('/setup/password?error=Passwords do not match');
    }

    if (password.length < 8) {
      redirect('/setup/password?error=Password must be at least 8 characters long');
    }

    const supabase = await createClient();
    
    // Check if user is actually authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Error updating password:', error.message);
      redirect(`/setup/password?error=${encodeURIComponent(error.message)}`);
    }

    // Success! Clear the onboarding cookies
    await clearSetupData();

    // Send them to the dashboard
    redirect('/dashboard');
  }

  return (
    <div className="w-full max-w-xl mx-auto py-12 flex flex-col items-center">
      <div className="w-20 h-20 bg-[#07351A]/10 rounded-full flex items-center justify-center mb-8">
        <LockKeyhole className="w-10 h-10 text-[#07351A]" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-[#07351A] mb-4 leading-tight font-serif tracking-tight text-center">
        Create Your Password
      </h1>
      
      <p className="text-lg text-slate-600 mb-12 text-center max-w-md">
        Your email has been verified. Please create a strong password to secure your Al-Tijara account.
      </p>

      {error && (
        <div className="w-full mb-8 p-4 bg-red-50 text-red-600 text-[14px] rounded-xl border border-red-100 text-center font-medium">
          {error}
        </div>
      )}

      <form action={handleCreatePassword} className="w-full max-w-md space-y-5">
        <div>
          <input 
            type="password" 
            name="password"
            placeholder="New Password" 
            required
            className="w-full px-4 py-4 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
          />
        </div>

        <div>
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Confirm Password" 
            required
            className="w-full px-4 py-4 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#07351A] focus:border-[#07351A] transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="pt-4">
          <SubmitButton 
            text="Secure My Account" 
            loaderMessage="Encrypting Credentials..."
            className="w-full py-4 bg-[#07351A] hover:bg-[#106E37] text-white font-bold rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
          />
        </div>
      </form>
    </div>
  );
}
