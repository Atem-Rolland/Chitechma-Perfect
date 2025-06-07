
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, BookOpen, UserCheck, ShieldCheck, Settings, BarChartHorizontalBig, Edit, UserCog, UserPlus, KeyRound, ScanLine, Trash2, Edit3, Power,
  GraduationCap, CalendarDays, DollarSign, FileText, MessageSquare, AlertCircle, Search, ListFilter, Eye, UploadCloud,
  ClipboardCheck, Lock, Unlock, Landmark, Receipt, MailWarning, CreditCard, Megaphone, Bot, PieChart, History, DatabaseZap, Library, ListChecks, SlidersHorizontal, FileSignature
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";

// Mock data for Admin Dashboard
const systemStats = {
  totalUsers: 1250,
  pendingApprovals: 5,
  activeCourses: 85,
  departments: 12,
  totalRevenue: "750M XAF",
  openRegistrations: 2,
};

export function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Stats Cards */}
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-4xl">{systemStats.totalUsers.toLocaleString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">+25 since last month</p>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Pending Account Approvals</CardDescription>
          <CardTitle className="text-4xl text-amber-500">{systemStats.pendingApprovals}</CardTitle>
        </CardHeader>
        <CardContent>
           <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/admin/approvals/accounts"><UserCheck className="mr-2 h-4 w-4"/>Review Accounts</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Active Courses</CardDescription>
          <CardTitle className="text-4xl">{systemStats.activeCourses}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{systemStats.departments} Departments</p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Open Registrations</CardDescription>
          <CardTitle className="text-4xl text-green-500">{systemStats.openRegistrations}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" variant="outline" asChild>
            <Link href="/dashboard/admin/registration/periods"><CalendarDays className="mr-2 h-4 w-4"/>Manage Periods</Link>
          </Button>
        </CardContent>
      </Card>

      {/* User Management Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCog className="text-primary"/>User Management</CardTitle>
          <CardDescription>Manage all user accounts, roles, and statuses for students, lecturers, and staff.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/view-all"><Eye className="mr-2 h-4 w-4"/>View All Users</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/create"><UserPlus className="mr-2 h-4 w-4"/>Create User Account</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/roles"><ShieldCheck className="mr-2 h-4 w-4"/>Manage Roles & Permissions</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/reset-password"><KeyRound className="mr-2 h-4 w-4"/>Reset User Passwords</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/matricules"><ScanLine className="mr-2 h-4 w-4"/>Assign/Edit Matricules</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/status"><Power className="mr-2 h-4 w-4"/>Activate/Deactivate Accounts</Link></Button>
        </CardContent>
      </Card>

      {/* Academic Configuration Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="text-primary"/>Academic Configuration</CardTitle>
          <CardDescription>Setup and manage academic structures and periods.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/departments"><Library className="mr-2 h-4 w-4"/>Manage Departments</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/programs"><GraduationCap className="mr-2 h-4 w-4"/>Manage Degree Programs</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/academic-years"><CalendarDays className="mr-2 h-4 w-4"/>Academic Years & Semesters</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/registration/periods"><Edit3 className="mr-2 h-4 w-4"/>Manage Registration Windows</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/registrations/approve-courses"><ListChecks className="mr-2 h-4 w-4"/>Approve Student Registrations</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/registration/overrides"><AlertCircle className="mr-2 h-4 w-4"/>Override Registration Limits</Link></Button>
        </CardContent>
      </Card>
      
      {/* Course and Result Management Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Course & Result Management</CardTitle>
          <CardDescription>Administer courses, lecturer assignments, and result processing.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/courses/manage"><Edit className="mr-2 h-4 w-4"/>Manage Courses (Add/Edit)</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/courses/upload"><UploadCloud className="mr-2 h-4 w-4"/>Bulk Course Upload</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/courses/assign"><Users className="mr-2 h-4 w-4"/>Assign Courses to Lecturers</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/results/entry"><FileSignature className="mr-2 h-4 w-4"/>Manage Result Entry</Link></Button>
           <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/results/upload"><UploadCloud className="mr-2 h-4 w-4"/>Bulk Result Upload</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/results/lock"><Lock className="mr-2 h-4 w-4"/>Lock/Unlock Result Entry</Link></Button>
        </CardContent>
      </Card>

      {/* Financial Oversight Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Financial Oversight</CardTitle>
          <CardDescription>Monitor payments, manage fee structures, and financial records.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/payments"><Eye className="mr-2 h-4 w-4"/>View All Payments</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/fees"><Landmark className="mr-2 h-4 w-4"/>Manage Fee Structures</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/receipts"><Receipt className="mr-2 h-4 w-4"/>Issue Receipts/Summaries</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/student-records"><FileText className="mr-2 h-4 w-4"/>Edit Student Financial Records</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/reminders"><MailWarning className="mr-2 h-4 w-4"/>Send Fee Reminders</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/gateway-test"><CreditCard className="mr-2 h-4 w-4"/>Simulate Payment Gateway</Link></Button>
        </CardContent>
      </Card>

      {/* Communication & Announcements Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="text-primary"/>Communication</CardTitle>
          <CardDescription>Send announcements and manage system communications.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/announcements/new"><Edit3 className="mr-2 h-4 w-4"/>Create Announcement</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/announcements/target"><Users className="mr-2 h-4 w-4"/>Targeted Announcements</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/chatbot/manage"><Bot className="mr-2 h-4 w-4"/>Manage Chatbot Responses</Link></Button>
        </CardContent>
      </Card>

      {/* Reports & Analytics Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChart className="text-primary"/>Reports & Analytics</CardTitle>
          <CardDescription>Generate system reports for various academic and financial metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/reports/academic"><GraduationCap className="mr-2 h-4 w-4"/>Academic Progress Reports</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/reports/financial"><DollarSign className="mr-2 h-4 w-4"/>Financial Reports</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/reports/registration"><ListChecks className="mr-2 h-4 w-4"/>Registration Summaries</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/reports/custom"><SlidersHorizontal className="mr-2 h-4 w-4"/>Custom Report Builder</Link></Button>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">Export reports by department, level, semester, or custom filters within each section.</p>
        </CardFooter>
      </Card>

      {/* Audit Logs Card */}
       <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="text-primary"/>Audit Logs</CardTitle>
          <CardDescription>View logs of all important system events and changes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/logs/user-activity"><Users className="mr-2 h-4 w-4"/>User Activity Logs</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/logs/system-changes"><DatabaseZap className="mr-2 h-4 w-4"/>System Change Logs</Link></Button>
        </CardContent>
      </Card>


      {/* Placeholder for a system health or activity chart */}
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle>System Activity Overview</CardTitle>
          <CardDescription>A visual summary of key platform metrics.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-muted rounded-md">
          <Image src="https://placehold.co/800x300.png?text=System+Activity+Chart" alt="System Activity Chart" width={800} height={300} className="max-w-full h-auto rounded-md" data-ai-hint="dashboard analytics chart" />
        </CardContent>
      </Card>
    </div>
  );
}
    
