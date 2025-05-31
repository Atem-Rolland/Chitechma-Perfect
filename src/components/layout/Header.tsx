"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"; // Assuming breadcrumb exists
import Link from "next/link";

export function AppHeader() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ') : siteConfig.name;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 md:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      {/* Breadcrumbs (Optional, example implementation) */}
      <div className="hidden md:flex">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.slice(1).map((segment, index) => (
              <React.Fragment key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === pathSegments.length - 2 ? (
                    <BreadcrumbPage>{segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/${pathSegments.slice(0, index + 2).join('/')}`}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>


      <div className="ml-auto flex items-center gap-4">
        {/* Search bar placeholder if needed */}
        {/* <Input type="search" placeholder="Search..." className="hidden md:flex h-9 w-[200px] lg:w-[300px]" /> */}
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}

// Minimal Breadcrumb component if not already present in ui.
// This is a simplified version. For a full version, you'd create a separate breadcrumb.tsx in components/ui
const React = { Fragment: ({ children }: any) => children }; // Placeholder for React if not imported

// If you don't have Breadcrumb components, you can create basic ones or remove this section.
// For now, I'm assuming you might add them or have them from ShadCN.
// If not, you can replace the Breadcrumb section with a simple <h1>{getPageTitle()}</h1>
// const Breadcrumb: React.FC<{ children: React.ReactNode }> = ({ children }) => <nav aria-label="breadcrumb">{children}</nav>;
// const BreadcrumbList: React.FC<{ children: React.ReactNode }> = ({ children }) => <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">{children}</ol>;
// const BreadcrumbItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
// const BreadcrumbLink: React.FC<{ children: React.ReactNode, asChild?: boolean, href?: string }> = ({ children, asChild, href }) => asChild && href ? <Link href={href} className="transition-colors hover:text-foreground">{children}</Link> : <span className="transition-colors hover:text-foreground">{children}</span>;
// const BreadcrumbSeparator: React.FC = () => <span role="presentation">/</span>;
// const BreadcrumbPage: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="font-normal text-foreground">{children}</span>;

