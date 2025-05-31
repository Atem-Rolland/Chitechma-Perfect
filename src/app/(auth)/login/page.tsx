
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to Chitechma University',
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-headline text-3xl font-semibold">Welcome Back!</h1>
        <p className="text-muted-foreground">Sign in to access your dashboard.</p>
      </div>
      <LoginForm />
    </>
  );
}
