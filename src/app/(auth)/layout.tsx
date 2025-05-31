import type { ReactNode } from 'react';
import Link from 'next/link';
import { School } from 'lucide-react'; // Or any other suitable logo icon
import { siteConfig } from '@/config/site';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <School className="h-10 w-10" />
          <span className="font-headline text-3xl font-bold">{siteConfig.name}</span>
        </Link>
      </div>
      <main className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl sm:p-8">
        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
