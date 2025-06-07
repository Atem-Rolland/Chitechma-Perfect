
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { NavItem } from '@/config/site'; 
import type { Role } from '@/types'; 
import { cn } from '@/lib/utils';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard, 
  GraduationCap, 
  UserCheck,
  FileText,
  DollarSign,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  BarChart3, 
  DownloadCloud, 
  FileWarning, 
  FolderArchive, 
  ClipboardCheck, 
  Video, 
  MessageSquare, 
  BookCheck as ResultsIcon, 
  History, 
  Presentation, 
  Edit, 
  Bell, 
  CalendarCheck, 
  BookCopy as ManageCoursesIcon, 
  FileSignature,
  Bot,
  CalendarDays,
  BarChartHorizontalBig, // Added
  UsersCog, // Added
  Library, // Added
  ListChecks, // Added
  AlertCircle as AlertCircleIcon, // Added
  UploadCloud as UploadCloudIcon, // Added
  Lock as LockIcon, // Added
  Landmark as LandmarkIcon, // Added
  Receipt as ReceiptIcon, // Added
  MailWarning as MailWarningIcon, // Added
  Megaphone as MegaphoneIcon, // Added
  PieChart as PieChartIcon, // Added
  SlidersHorizontal as SlidersHorizontalIcon, // Added
  DatabaseZap as DatabaseZapIcon // Added
} from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  GraduationCap,
  UserCheck,
  FileText,
  DollarSign,
  Settings,
  ShieldCheck,
  ResultsIcon, 
  BarChart3,
  DownloadCloud,
  FileWarning,
  FolderArchive,
  ClipboardCheck,
  Video,
  MessageSquare,
  History,
  Presentation,
  Edit,
  Bell,
  CalendarCheck,
  ManageCoursesIcon, 
  FileSignature,
  Bot,
  CalendarDays,
  BarChartHorizontalBig,
  UsersCog,
  Library,
  ListChecks,
  AlertCircleIcon,
  UploadCloudIcon,
  LockIcon,
  LandmarkIcon,
  ReceiptIcon,
  MailWarningIcon,
  MegaphoneIcon,
  PieChartIcon,
  SlidersHorizontalIcon,
  DatabaseZapIcon
};

const defaultSidebarNav: Record<Role | 'guest', NavItem[]> = {
  student: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'My Courses', href: '/courses', icon: BookOpen },
    { title: 'My Timetable', href: '/dashboard/student/timetable', icon: CalendarDays },
    { 
      title: 'Results', 
      href: '#', 
      icon: GraduationCap, 
      subItems: [
        { title: 'View Grades', href: '/dashboard/student/grades', icon: ResultsIcon },
        { title: 'GPA Analytics', href: '/dashboard/student/grades/gpa-analytics', icon: BarChart3 },
        { title: 'Download Transcript', href: '/dashboard/student/grades/transcript', icon: DownloadCloud },
        { title: 'Grade Appeals', href: '/dashboard/student/grades/appeals', icon: FileWarning },
      ]
    },
    { 
      title: 'Tuition & Payments', 
      href: '#', 
      icon: CreditCard,
      subItems: [
        { title: 'Overview & Pay', href: '/dashboard/student/payments', icon: CreditCard },
        { title: 'Payment History', href: '/dashboard/student/payments/history', icon: History },
      ]
    },
    {
      title: 'E-Learning',
      href: '#', 
      icon: FolderArchive, 
      subItems: [
        { title: 'Course Materials', href: '/dashboard/student/e-learning/materials', icon: FolderArchive },
        { title: 'Assignments', href: '/dashboard/student/e-learning/assignments', icon: ClipboardCheck },
        { title: 'Video Lectures', href: '/dashboard/student/e-learning/lectures', icon: Video },
        { title: 'Live Classes', href: '/dashboard/student/e-learning/live-classes', icon: Presentation },
        { title: 'Discussion Forum', href: '/dashboard/student/e-learning/forum', icon: MessageSquare },
        { title: 'AI Chatbot', href: '/dashboard/student/e-learning/chatbot', icon: Bot },
      ]
    },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ],
  lecturer: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { title: 'My Courses', href: '/dashboard/lecturer/courses', icon: ManageCoursesIcon },
    { 
      title: 'Grading & Evaluation', 
      href: '#', 
      icon: Edit,
      subItems: [
        { title: 'Assignments', href: '/dashboard/lecturer/assignments', icon: ClipboardCheck },
        { title: 'Enter Marks (CA/Exam)', href: '/dashboard/lecturer/grades/entry', icon: FileSignature },
        { title: 'View Gradebook', href: '/dashboard/lecturer/gradebook', icon: BarChart3 },
      ]
    },
    { title: 'Student Management', href: '/dashboard/lecturer/students', icon: Users },
    { title: 'Announcements', href: '/dashboard/lecturer/announcements', icon: MegaphoneIcon },
    { title: 'Grade Appeals', href: '/dashboard/lecturer/appeals', icon: FileWarning },
    { title: 'My Timetable', href: '/dashboard/lecturer/timetable', icon: CalendarCheck },
  ],
  admin: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { 
      title: 'User Management', 
      href: '#', 
      icon: UsersCog,
      subItems: [
        { title: 'View All Users', href: '/dashboard/admin/users/view-all', icon: Eye},
        { title: 'Create User', href: '/dashboard/admin/users/create', icon: UserPlus},
        { title: 'Roles & Permissions', href: '/dashboard/admin/users/roles', icon: ShieldCheck},
        { title: 'Pending Approvals', href: '/dashboard/admin/approvals/accounts', icon: UserCheck },
      ] 
    },
    { 
      title: 'Academic Setup', 
      href: '#', 
      icon: Settings,
      subItems: [
        { title: 'Departments', href: '/dashboard/admin/departments', icon: Library },
        { title: 'Programs', href: '/dashboard/admin/programs', icon: GraduationCap },
        { title: 'Academic Periods', href: '/dashboard/admin/academic-years', icon: CalendarDays },
        { title: 'Course Management', href: '/dashboard/admin/courses/manage', icon: BookOpen },
        { title: 'Assign Lecturers', href: '/dashboard/admin/courses/assign', icon: Users },

      ]
    },
     { 
      title: 'Registration & Results', 
      href: '#', 
      icon: Edit3,
      subItems: [
        { title: 'Registration Windows', href: '/dashboard/admin/registration/periods', icon: CalendarCheck },
        { title: 'Approve Registrations', href: '/dashboard/admin/registrations/approve-courses', icon: ListChecks },
        { title: 'Result Management', href: '/dashboard/admin/results/entry', icon: FileSignature },
        { title: 'Lock/Unlock Results', href: '/dashboard/admin/results/lock', icon: LockIcon },
      ]
    },
    { 
      title: 'Financial Oversight', 
      href: '#', 
      icon: DollarSign,
      subItems: [
        { title: 'View Payments', href: '/dashboard/admin/finance/payments', icon: Eye },
        { title: 'Fee Structures', href: '/dashboard/admin/finance/fees', icon: LandmarkIcon },
        { title: 'Student Records', href: '/dashboard/admin/finance/student-records', icon: FileText },
        { title: 'Fee Reminders', href: '/dashboard/admin/finance/reminders', icon: MailWarningIcon },
        { title: 'Payment Gateway Sim', href: '/dashboard/admin/finance/gateway-test', icon: CreditCard },
      ] 
    },
     { 
      title: 'Communication', 
      href: '#', 
      icon: MegaphoneIcon,
      subItems: [
         { title: 'Announcements', href: '/dashboard/admin/announcements/new', icon: Edit3 },
         { title: 'Manage Chatbot', href: '/dashboard/admin/chatbot/manage', icon: Bot },
      ]
    },
    { 
      title: 'System & Reports', 
      href: '#', 
      icon: BarChartHorizontalBig,
      subItems: [
        { title: 'Generate Reports', href: '/dashboard/admin/reports', icon: PieChartIcon },
        { title: 'Audit Logs', href: '/dashboard/admin/logs/audit', icon: History },
      ] 
    },
  ],
  finance: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { title: 'Payment Records', href: '/dashboard/finance/payments', icon: DollarSign },
    { title: 'Financial Reports', href: '/dashboard/finance/reports', icon: FileText },
    { title: 'Fee Management', href: '/dashboard/finance/fees', icon: Settings},
    { title: 'Student Financials', href: '/dashboard/finance/student-records', icon: UsersCog},
    { title: 'Issue Reminders', href: '/dashboard/finance/reminders', icon: MailWarningIcon},

  ],
  guest: [], 
  null: [], 
};

interface SidebarNavItemProps {
  item: NavItem & { subItems?: NavItem[] };
  pathname: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, pathname }) => {
  const Icon = item.icon ? iconMap[item.icon.displayName || item.icon.name] || item.icon : null;
  
  let isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '#' && pathname.startsWith(item.href));
  if (item.subItems && !isActive) {
    isActive = item.subItems.some(sub => pathname === sub.href || (sub.href !== '/dashboard' && sub.href !== '#' && pathname.startsWith(sub.href)));
  }

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isActive && !!item.subItems);

  React.useEffect(() => {
    if (item.subItems && item.subItems.some(sub => pathname === sub.href || (sub.href !== '/dashboard' && sub.href !== '#' && pathname.startsWith(sub.href)))) {
      setIsSubmenuOpen(true);
    } else if (item.subItems && !isActive) { // Close if no sub-item is active
        // setIsSubmenuOpen(false); // This line might be too aggressive, let's test behavior
    }
  }, [pathname, item.subItems, isActive]);


  const handleToggleSubmenu = (e: React.MouseEvent) => {
    if (item.subItems) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          onClick={handleToggleSubmenu}
          className="justify-between"
          aria-expanded={isSubmenuOpen}
          tooltip={item.title}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
          </div>
          <AnimatePresence initial={false}>
            {isSubmenuOpen ? (
              <motion.div key="chevron-down" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </motion.div>
            ) : (
              <motion.div key="chevron-right" initial={{ rotate: 0 }} animate={{ rotate: -90 }} exit={{ rotate: 0 }}>
                <ChevronRight className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarMenuButton>
        <AnimatePresence>
        {isSubmenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden group-data-[collapsible=icon]:hidden"
          >
            <SidebarMenuSub>
              {item.subItems.map(subItem => {
                const SubIcon = subItem.icon ? iconMap[subItem.icon.displayName || subItem.icon.name] || subItem.icon : null;
                return (
                  <SidebarMenuSubItem key={subItem.href}>
                    <Link href={subItem.href} passHref legacyBehavior>
                      <SidebarMenuSubButton 
                        isActive={pathname === subItem.href || (subItem.href !== '/dashboard' && subItem.href !== '#' && pathname.startsWith(subItem.href))}
                        className="pl-6" 
                      >
                        {SubIcon && <SubIcon className="h-4 w-4 mr-2" />}
                        {subItem.title}
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </motion.div>
        )}
        </AnimatePresence>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Link href={item.href} passHref legacyBehavior>
        <SidebarMenuButton isActive={isActive} tooltip={item.title}>
          {Icon && <Icon className="h-5 w-5" />}
          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};


export function SidebarNav() {
  const { role } = useAuth();
  const pathname = usePathname();
  
  const navItems = role ? defaultSidebarNav[role] : defaultSidebarNav['null']; 

  if (!navItems || !navItems.length) { 
    return null; 
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarNavItem key={item.href + (item.title || Math.random())} item={item} pathname={pathname} />
      ))}
    </SidebarMenu>
  );
}

    
