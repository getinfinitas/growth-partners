import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

// Optimized font loading with performance settings
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Better font loading performance
  variable: '--font-inter', // CSS custom property for better theming
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Infinitas',
    default: 'Infinitas - Streamline Business Relationships & Unlock Google Business Profile Potential',
  },
  description: 'Transform how you manage customer relationships. Infinitas combines powerful contact management, activity tracking, and Google Business Profile integration to help you grow your local presence and strengthen business connections.',
  keywords: 'CRM, Google Business Profile, Contact Management, Business Relationships, Local Business, Customer Management, Activity Tracking',
  authors: [{ name: 'Infinitas' }],
  metadataBase: new URL('https://getinfinitas.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://getinfinitas.com',
    siteName: 'Infinitas',
    title: 'Infinitas - Streamline Business Relationships',
    description: 'Manage contacts, track interactions, and grow your local presence with Google Business Profile integration',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Infinitas - Business Relationship Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@infinitas_app',
    creator: '@infinitas_app',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
