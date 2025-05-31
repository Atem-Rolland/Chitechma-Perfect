"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
          <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
          <h1 className="font-headline text-4xl font-bold text-destructive mb-4">Oops, Something Went Wrong!</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            We encountered an unexpected error. Please try again, or if the problem persists, contact support.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
             <pre className="mb-6 p-4 bg-muted text-destructive-foreground rounded-md text-left text-sm max-w-xl overflow-auto">
              Error: {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}
          <div className="flex gap-4">
            <Button
              onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
              }
              size="lg"
            >
              Try Again
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
