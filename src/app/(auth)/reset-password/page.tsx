
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password for Chitechma University',
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-headline text-3xl font-semibold">Forgot Password?</h1>
        <p className="text-muted-foreground">Enter your email to receive a reset link.</p>
      </div>
      <ResetPasswordForm />
    </>
  );
}
