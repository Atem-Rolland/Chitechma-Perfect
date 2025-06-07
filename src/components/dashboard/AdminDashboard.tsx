
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, BookOpen, UserCheck, ShieldCheck, Settings, BarChartHorizontalBig, Edit,
  GraduationCap, CalendarDays, DollarSign, FileText, MessageSquare, AlertCircle, Search, ListFilter
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
          <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>User Management</CardTitle>
          <CardDescription>Manage all user accounts, roles, and statuses.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/students">View/Manage Students</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/lecturers">View/Manage Lecturers</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/staff">View/Manage Staff (Finance, Admin)</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/users/create">Create New User Account</Link></Button>
        </CardContent>
      </Card>

      {/* Academic Configuration Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="text-primary"/>Academic Configuration</CardTitle>
          <CardDescription>Setup and manage academic structures and periods.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/departments">Manage Departments</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/programs">Manage Degree Programs</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/academic-years">Academic Years & Semesters</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/registration/settings">Course Registration Settings</Link></Button>
        </CardContent>
      </Card>
      
      {/* Course and Result Management Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Course & Result Management</CardTitle>
          <CardDescription>Administer courses, lecturer assignments, and result processing.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/courses/manage">Manage Courses (Add/Edit)</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/courses/assign">Assign Courses to Lecturers</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/registrations/approve">Approve Course Registrations</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/results/manage">Manage Result Entry/Upload</Link></Button>
        </CardContent>
      </Card>

      {/* Financial Oversight Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Financial Oversight</CardTitle>
          <CardDescription>Monitor payments, manage fee structures, and financial records.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/payments">View All Payments</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/fees">Manage Fee Structures</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/student-records">Edit Student Financial Records</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/finance/reminders">Send Fee Reminders</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3 sm:col-span-2" asChild><Link href="/dashboard/admin/finance/gateway-test">Simulate Payment Gateway</Link></Button>
        </CardContent>
      </Card>

      {/* Communication & Announcements Card */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="text-primary"/>Communication</CardTitle>
          <CardDescription>Send announcements and manage system communications.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/announcements/new">Create Announcement</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/chatbot/manage">Manage Chatbot (if applicable)</Link></Button>
        </CardContent>
      </Card>

      {/* Reports & Analytics + Audit Logs Card (Combined for space or can be separate) */}
      <Card className="md:col-span-2 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>Reports & Logs</CardTitle>
          <CardDescription>Generate system reports and view audit trails.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/reports">Generate Reports</Link></Button>
          <Button variant="outline" className="justify-start text-left h-auto p-3" asChild><Link href="/dashboard/admin/logs/audit">View Audit Logs</Link></Button>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">More detailed analytics and specific report types available within the 'Reports' section.</p>
        </CardFooter>
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

    