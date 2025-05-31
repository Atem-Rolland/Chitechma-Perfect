"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, UserCheck, ShieldCheck, Settings, BarChartHorizontalBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data
const systemStats = {
  totalUsers: 1250,
  pendingApprovals: 5,
  activeCourses: 85,
  departments: 12,
};

export function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-4xl">{systemStats.totalUsers}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/admin/users"><Users className="mr-2 h-4 w-4"/>Manage Users</Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Pending Approvals</CardDescription>
          <CardTitle className="text-4xl text-amber-500">{systemStats.pendingApprovals}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/admin/approvals"><UserCheck className="mr-2 h-4 w-4"/>Review Approvals</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Active Courses</CardDescription>
          <CardTitle className="text-4xl">{systemStats.activeCourses}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/admin/courses"><BookOpen className="mr-2 h-4 w-4"/>Manage Courses</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Departments</CardDescription>
          <CardTitle className="text-4xl">{systemStats.departments}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/admin/departments"><ShieldCheck className="mr-2 h-4 w-4"/>Manage Departments</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="text-primary"/>System Configuration</CardTitle>
          <CardDescription>Quick access to key administrative settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start p-4 h-auto" asChild>
            <Link href="/dashboard/admin/programs">
              <GraduationCap className="mr-3 h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Programs</p>
                <p className="text-xs text-muted-foreground">Manage academic programs</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto" asChild>
            <Link href="/dashboard/admin/semesters">
              <CalendarDays className="mr-3 h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Semesters & Terms</p>
                <p className="text-xs text-muted-foreground">Configure academic terms</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto" asChild>
            <Link href="/dashboard/admin/roles">
              <Users className="mr-3 h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Roles & Permissions</p>
                <p className="text-xs text-muted-foreground">Define user access levels</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto" asChild>
            <Link href="/dashboard/admin/system-settings">
              <Settings className="mr-3 h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">General Settings</p>
                <p className="text-xs text-muted-foreground">Site-wide configurations</p>
              </div>
            </Link>
          </Button>
           <Button variant="outline" className="justify-start p-4 h-auto" asChild>
            <Link href="/dashboard/admin/logs">
              <BarChartHorizontalBig className="mr-3 h-5 w-5 text-primary"/>
              <div>
                <p className="font-semibold">Audit Logs</p>
                <p className="text-xs text-muted-foreground">View system activity</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle>Platform Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src="https://placehold.co/800x300.png" alt="Activity Chart" width={800} height={300} className="rounded-md" data-ai-hint="dashboard chart" />
          <p className="text-sm text-muted-foreground mt-2">Chart displaying user registrations, course enrollments, etc. over time.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Assuming GraduationCap and CalendarDays are available in lucide-react
import { GraduationCap, CalendarDays } from "lucide-react";
