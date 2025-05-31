
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create an account with Chitechma University',
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-headline text-3xl font-semibold">Create an Account</h1>
        <p className="text-muted-foreground">Join Chitechma University today!</p>
      </div>
      <RegisterForm />
    </>
  );
}
