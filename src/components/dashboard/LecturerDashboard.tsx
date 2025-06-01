
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileSignature, PlusCircle, BarChart3, CalendarCheck, MessageSquare, Bell, Settings, BookCopy, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for lecturer
const lecturerStats = {
  assignedCoursesCount: 3, // Example
  totalStudents: 120,     // Example
  pendingGrading: 5,      // Example assignments
  unreadMessages: 2,      // Example
};

export function LecturerDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Assigned Courses</CardDescription>
          <CardTitle className="text-4xl">{lecturerStats.assignedCoursesCount}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/lecturer/courses"><BookOpen className="mr-2 h-4 w-4"/>View My Courses</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-4xl">{lecturerStats.totalStudents}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" variant="outline" asChild>
            <Link href="/dashboard/lecturer/students"><Users className="mr-2 h-4 w-4"/>Manage Students</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Pending Grading</CardDescription>
          <CardTitle className="text-4xl text-amber-500">{lecturerStats.pendingGrading}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/lecturer/assignments"><FileSignature className="mr-2 h-4 w-4"/>Go to Assignments</Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Unread Messages</CardDescription>
          <CardTitle className="text-4xl text-blue-500">{lecturerStats.unreadMessages}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="w-full" variant="outline" asChild>
            <Link href="/dashboard/lecturer/messages"><MessageSquare className="mr-2 h-4 w-4"/>View Messages</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="text-primary"/>Quick Actions & Management</CardTitle>
          <CardDescription>Access key lecturer functionalities.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/courses">
              <BookCopy className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">Manage Courses</p>
                <p className="text-xs text-muted-foreground">View details, materials, and class lists.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/assignments">
              <Edit className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">Assignments & Grading</p>
                <p className="text-xs text-muted-foreground">Create, view submissions, and grade.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/grades/entry">
              <FileSignature className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">Enter Marks</p>
                <p className="text-xs text-muted-foreground">Input CA and Exam scores.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/announcements">
              <Bell className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">Announcements</p>
                <p className="text-xs text-muted-foreground">Communicate with your students.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/appeals">
               <BarChart3 className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">Grade Appeals</p>
                <p className="text-xs text-muted-foreground">Review and respond to appeals.</p>
              </div>
            </Link>
          </Button>
           <Button variant="outline" className="justify-start p-4 h-auto text-left" asChild>
            <Link href="/dashboard/lecturer/timetable">
               <CalendarCheck className="mr-3 h-6 w-6 text-primary"/>
              <div>
                <p className="font-semibold">My Timetable</p>
                <p className="text-xs text-muted-foreground">View your teaching schedule.</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader>
          <CardTitle>Recent Course Activity (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src="https://placehold.co/800x250.png" alt="Course Activity Chart" width={800} height={250} className="rounded-md" data-ai-hint="dashboard activity chart" />
          <p className="text-sm text-muted-foreground mt-2">Chart displaying recent assignment submissions, forum activity, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}
