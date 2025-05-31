"use client";

import type { ReactNode } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarInset,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/Header';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { siteConfig } from '@/config/site';
import { Button } from '../ui/button';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout, profile } = useAuth();
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon" side="left">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* Replace with a proper logo if available */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-headline text-xl font-semibold group-data-[collapsible=icon]:hidden">{siteConfig.name}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          {/* Example footer items - can be dynamic based on user */}
           <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" asChild>
            <Link href="/profile">
              <UserCircle className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Profile</span>
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 dark:text-red-400 dark:hover:text-red-500 dark:hover:bg-red-400/10">
            <LogOut className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
