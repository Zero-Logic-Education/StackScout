import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../../globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Admin Login | StackScout',
  description: 'Вход в административную панель StackScout',
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <ThemeRegistry>
          <main>{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
