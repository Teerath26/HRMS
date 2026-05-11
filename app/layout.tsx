import type {Metadata} from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from 'sonner';
import { MobileNav } from '@/components/mobile-nav';

export const metadata: Metadata = {
  title: 'Hindtech HRMS',
  description: 'Factory attendance management system mapped to Google Sheets.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#0A0C10] text-slate-200 font-sans" suppressHydrationWarning>
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col overflow-auto h-full w-full">
          <MobileNav />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
