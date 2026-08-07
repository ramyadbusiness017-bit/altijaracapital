import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Command Center | Al-Tijara',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication check moved to page.tsx to prevent infinite redirect loops
  // with the nested /admin/login page.

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {children}
    </div>
  );
}
