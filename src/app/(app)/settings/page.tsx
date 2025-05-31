"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle'; // Ensure this path is correct
import { motion } from 'framer-motion';
import { Palette, Bell, ShieldLock, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <header>
        <h1 className="font-headline text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and account settings.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="text-primary"/> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="theme-toggle" className="font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode.
              </p>
            </div>
            <ThemeToggle /> {/* Placed ThemeToggle here */}
          </div>
          {/* Placeholder for more appearance settings like font size, density etc. */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="text-primary"/> Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification settings are not yet available.</p>
          {/* Placeholder for notification settings */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldLock className="text-primary"/> Account & Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your account password.
              </p>
            </div>
            <Button variant="outline" disabled><KeyRound className="mr-2 h-4 w-4"/>Change Password</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Two-Factor Authentication (MFA)</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Button variant="outline" disabled>Setup MFA</Button>
          </div>
          {/* Placeholder for more security settings */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
