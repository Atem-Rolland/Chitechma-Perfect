
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { siteConfig } from '@/config/site';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Chitechma University...</p>
      </div>
    );
  }

  if (user) {
    // Already authenticated, redirecting...
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-6">
      <header className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary sm:text-6xl md:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-lg text-foreground/80 sm:text-xl">
          {siteConfig.description}
        </p>
      </header>

      <main className="mt-12 flex flex-col items-center gap-6 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/register">Register</Link>
        </Button>
      </main>

      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rollycreative. All rights reserved.</p>
        <nav className="mt-2 space-x-4">
          {siteConfig.footerNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.title}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
