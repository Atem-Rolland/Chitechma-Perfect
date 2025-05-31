export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  roles?: Role[]; // Add roles if navigation is role-specific
};

export type Role = "student" | "lecturer" | "admin" | "finance" | "guest";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mainNav: NavItem[];
  sidebarNav?: Record<Role, NavItem[]>; // Role-specific sidebar nav
  footerNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "Academia Interface",
  description: "CHITECHMA University School Management System (CUSMS)",
  url: "https://academia-interface.example.com", // Replace with your actual URL
  ogImage: "https://academia-interface.example.com/og.jpg", // Replace with your OG image URL
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Courses",
      href: "/courses",
    },
  ],
  footerNav: [
    {
      title: "Privacy Policy",
      href: "/privacy",
    },
    {
      title: "Terms of Service",
      href: "/terms",
    },
  ],
  // Sidebar navigation will be defined in SidebarNav.tsx or similar component
  // based on user role from AuthContext.
};
