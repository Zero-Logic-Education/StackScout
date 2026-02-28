import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel | StackScout',
  description: 'Административная панель StackScout',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
