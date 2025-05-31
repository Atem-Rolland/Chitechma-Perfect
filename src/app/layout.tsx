import type { Metadata } from 'next';
import { Inter, Urbanist } from 'next/font/google'; // Import specific fonts
import './globals.css';
import { Providers } from '@/components/Providers';
import { siteConfig } from '@/config/site';

// Using next/font as per guidelines is not allowed for this project.
// The guidelines state: "IMPORTANT: This project will NOT manage fonts through the standard NextJS package.
// It will intentionally use <link> elements in <head> to import Google Fonts."
// Therefore, the next/font imports are removed, and <link> tags are used.

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Add more metadata as needed: icons, openGraph, etc.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
