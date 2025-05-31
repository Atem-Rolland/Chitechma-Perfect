
"use client";

import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center"
      >
        <Image src="https://placehold.co/300x200.png" alt="Profile not found" width={200} height={133} className="opacity-50 mb-6 rounded-lg" data-ai-hint="error empty state" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground max-w-sm">
          User profile data could not be loaded. Please try logging out and back in, or contact support if the issue persists.
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary"/>
            <div>
              <CardTitle className="font-headline text-2xl">My Profile</CardTitle>
              <CardDescription>Manage your personal information and account settings. Some details may be read-only.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ProfileForm userProfile={profile} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

    