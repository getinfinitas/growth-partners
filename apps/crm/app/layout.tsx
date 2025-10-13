import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';
import './globals.css';

// Force dynamic rendering to avoid pre-rendering issues with icons
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | Infinitas CRM',
    default: 'Infinitas CRM - Business Relationship Management',
  },
  description: 'Manage your business relationships, contacts, and Google Business Profile integration.',
  metadataBase: new URL('https://app.getinfinitas.com'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={GeistSans.className}>
      <body className="antialiased" suppressHydrationWarning>
        <SidebarProvider>
          <ClientAppSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

