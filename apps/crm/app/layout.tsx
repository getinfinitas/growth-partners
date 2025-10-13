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
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google';

// Configure fonts
const geist = Geist({ 
  subsets: ['latin'], 
  variable: '--font-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
});

const sourceSerif4 = Source_Serif_4({ 
  subsets: ['latin'], 
  variable: '--font-serif',
});

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${geist.variable} ${geistMono.variable} ${sourceSerif4.variable}`}
      suppressHydrationWarning
    >
      <body className={geist.className} suppressHydrationWarning>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
