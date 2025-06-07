
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"; 
import Link from "next/link";
import React from 'react'; // Ensure React is imported for Fragment
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  // getPageTitle function can be removed if breadcrumbs are comprehensive
  // const getPageTitle = () => {
  //   if (pathname === '/dashboard') return 'Dashboard';
  //   const lastSegment = pathSegments[pathSegments.length - 1];
  //   return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ') : siteConfig.name;
  // };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 md:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      <div className="hidden md:flex">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.slice(1).map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
              const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
              const isLast = index === pathSegments.length - 2; // pathSegments include 'dashboard'
              
              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>


      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Search bar placeholder if needed */}
        {/* <Input type="search" placeholder="Search..." className="hidden md:flex h-9 w-[200px] lg:w-[300px]" /> */}
        
        <Link href="/dashboard/notifications" passHref>
          <Button variant="ghost" size="icon" aria-label="View Notifications">
            <Bell className="h-5 w-5" />
            {/* Future: Add a badge for unread count here */}
          </Button>
        </Link>
        
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}

    