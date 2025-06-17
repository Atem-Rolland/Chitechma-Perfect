
"use client";

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react'; // To help TypeScript with dynamic import types

// Dynamically import role-specific dashboards
const StudentDashboard = dynamic(() => import('@/components/dashboard/StudentDashboard').then(mod => mod.StudentDashboard), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false // Optional: can be true if dashboards are SSR-friendly
});
const LecturerDashboard = dynamic(() => import('@/components/dashboard/LecturerDashboard').then(mod => mod.LecturerDashboard), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});
const AdminDashboard = dynamic(() => import('@/components/dashboard/AdminDashboard').then(mod => mod.AdminDashboard), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});
const FinanceDashboard = dynamic(() => import('@/components/dashboard/FinanceDashboard').then(mod => mod.FinanceDashboard), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});


export default function DashboardPage() {
  const { profile, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const welcomeMessage = profile?.displayName ? `Welcome back, ${profile.displayName}!` : "Welcome to your Dashboard!";

  const renderDashboardContent = () => {
    switch (role) {
      case 'student':
        return <StudentDashboard />;
      case 'lecturer':
        return <LecturerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your role is not recognized or you do not have access to a dashboard.</p>
              <p>Please contact support if you believe this is an error.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold text-foreground">{welcomeMessage}</h1>
          <p className="text-muted-foreground">Here's an overview of your activities and information.</p>
        </div>
        {/* Placeholder for global actions or date range picker */}
      </div>
      
      {renderDashboardContent()}
    </motion.div>
  );
}
