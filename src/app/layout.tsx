
import type { Metadata } from 'next';
import { Inter, Urbanist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { siteConfig } from '@/config/site';

// Setup Inter font for body
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable for Inter
  display: 'swap',
});

// Setup Urbanist font for headlines
const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist', // CSS variable for Urbanist
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'], // Include necessary weights
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico', 
    apple: '/apple-icon.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${urbanist.variable}`}>
      <head>
        {/* Removed direct Google Font links, next/font handles this */}
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
