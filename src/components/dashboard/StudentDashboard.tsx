"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, CreditCard, FileText, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data - replace with actual data fetching
const enrolledCourses = [
  { id: 'CSE101', name: 'Introduction to Programming', credits: 3, grade: 'A' },
  { id: 'MTH202', name: 'Calculus II', credits: 4, grade: 'B+' },
  { id: 'PHY210', name: 'University Physics I', credits: 4, grade: 'In Progress' },
];

const tuitionStatus = {
  totalDue: 2500,
  paid: 2000,
  balance: 500,
  currency: 'USD',
  dueDate: '2024-09-15',
};

export function StudentDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Enrolled Courses</CardTitle>
          <CardDescription>Your current and recently completed courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length > 0 ? (
            <ul className="space-y-3">
              {enrolledCourses.map(course => (
                <li key={course.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                  <div>
                    <h3 className="font-medium">{course.name} ({course.id})</h3>
                    <p className="text-sm text-muted-foreground">{course.credits} Credits</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${course.grade === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{course.grade}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No courses enrolled yet.</p>
          )}
          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link href="/dashboard/student/courses">View All Courses</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary"/>Recent Grades</CardTitle>
          <CardDescription>Summary of your academic performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for grades summary or link */}
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
            <p className="font-medium">Overall GPA</p>
            <p className="text-xl font-semibold text-primary">3.75</p> {/* Mock GPA */}
          </div>
          <p className="text-sm text-muted-foreground">Your detailed results and transcripts can be found in the "My Grades" section.</p>
          <Button className="w-full" asChild>
            <Link href="/dashboard/student/grades">
              <FileText className="mr-2 h-4 w-4"/> View My Grades
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/student/grades/download-transcript.pdf" target="_blank"> {/* Mock link */}
              <Download className="mr-2 h-4 w-4"/> Download Transcript
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/>Tuition Status</CardTitle>
          <CardDescription>Overview of your fee payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Due:</span>
            <span className="font-semibold">{tuitionStatus.currency} {tuitionStatus.totalDue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span className="font-semibold">{tuitionStatus.currency} {tuitionStatus.paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-semibold text-destructive">{tuitionStatus.currency} {tuitionStatus.balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-semibold">{tuitionStatus.dueDate}</span>
          </div>
          <Button className="w-full mt-4" asChild>
            <Link href="/dashboard/student/payments">Make a Payment</Link>
          </Button>
        </CardContent>
      </Card>

       <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Announcements &amp; Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src="https://placehold.co/600x200.png" alt="University Event" width={600} height={200} className="rounded-md mb-4" data-ai-hint="university campus event" />
          <p className="text-muted-foreground">Stay updated with the latest news and events from the university.</p>
          {/* Placeholder for announcements list */}
           <ul className="space-y-2 mt-3">
            <li className="text-sm p-2 bg-secondary/30 rounded-md">Mid-term exams start next week!</li>
            <li className="text-sm p-2 bg-secondary/30 rounded-md">Guest lecture on AI in Education - Oct 25th.</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
