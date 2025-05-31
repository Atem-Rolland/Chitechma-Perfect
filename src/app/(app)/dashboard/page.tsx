"use client";

import { useAuth } from '@/hooks/useAuth';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { LecturerDashboard } from '@/components/dashboard/LecturerDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { FinanceDashboard } from '@/components/dashboard/FinanceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
