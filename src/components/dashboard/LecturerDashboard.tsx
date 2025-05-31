"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileSignature, PlusCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data
const assignedCourses = [
  { id: 'CSE301', name: 'Data Structures', students: 45, lastUpdate: '2024-07-15' },
  { id: 'CSE405', name: 'Compiler Design', students: 30, lastUpdate: '2024-07-10' },
];

const recentActivity = [
  { action: 'Graded assignments for CSE301', date: '2 days ago' },
  { action: 'Uploaded lecture notes for CSE405', date: '3 days ago' },
];

export function LecturerDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>My Courses</CardTitle>
          <CardDescription>Courses you are currently teaching.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedCourses.length > 0 ? (
            <ul className="space-y-3">
              {assignedCourses.map(course => (
                <li key={course.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                  <div>
                    <h3 className="font-medium">{course.name} ({course.id})</h3>
                    <p className="text-sm text-muted-foreground">{course.students} Students enrolled</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/lecturer/courses/${course.id}`}>Manage</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No courses assigned yet.</p>
          )}
          <Button variant="default" className="mt-4 w-full" asChild>
            <Link href="/dashboard/lecturer/courses/new">
              <PlusCircle className="mr-2 h-4 w-4"/> Propose New Course
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSignature className="text-primary"/>Grading &amp; Submissions</CardTitle>
          <CardDescription>Quick access to grading tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image src="https://placehold.co/300x150.png" alt="Grading illustration" width={300} height={150} className="rounded-md" data-ai-hint="education grading" />
          <p className="text-sm text-muted-foreground">You have <strong>5 assignments</strong> pending review across your courses.</p>
          <Button className="w-full" asChild>
            <Link href="/dashboard/lecturer/grades">
              <FileSignature className="mr-2 h-4 w-4"/> Go to Grading Center
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Student Interaction</CardTitle>
          <CardDescription>Communication and student lists.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Quickly access student lists or send announcements.</p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/lecturer/students">View Student Lists</Link>
          </Button>
           <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/lecturer/announcements">Send Announcement</Link>
          </Button>
        </CardContent>
      </Card>

       <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="text-primary"/>Recent Activity</CardTitle>
          <CardDescription>Your latest actions on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {recentActivity.map((activity, index) => (
                 <li key={index} className="text-sm p-2 bg-secondary/30 rounded-md">
                  <span className="font-medium">{activity.action}</span> - <span className="text-xs text-muted-foreground">{activity.date}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
