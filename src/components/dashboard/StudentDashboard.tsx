
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, GraduationCap, CreditCard, FileText, Download, User, Edit3, Settings, LogOut, HelpCircle, History, ChevronDown, Info, Phone, Mail, MapPin, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

// Mock data - replace with actual data fetching
const enrolledCourses = [
  { id: 'CSE101', name: 'Introduction to Programming', credits: 3, grade: 'A' },
  { id: 'MTH202', name: 'Calculus II', credits: 4, grade: 'B+' },
  { id: 'PHY210', name: 'University Physics I', credits: 4, grade: 'In Progress' },
];

const tuitionStatus = {
  totalDue: 1250000, // Example amount in XAF
  paid: 1000000,   // Example amount in XAF
  balance: 250000,  // Example amount in XAF
  currency: 'XAF',
  dueDate: '2024-09-15',
};

const studentMockData = {
  semester: "Fall 2024",
  academicYear: "2024/2025",
  matricule: "CUSMS/001",
  program: "B.Sc. Computer Science",
  department: "Computer Science",
  dateOfBirth: "1998-05-15",
  nationality: "Cameroonian",
  address: "123 University Street, Buea",
  emergencyContactName: "Jane Doe",
  emergencyContactPhone: "+237 6XX XXX XXX",
};

export function StudentDashboard() {
  const { profile, logout } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Student Home Overview */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-card to-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-background ring-offset-2">
                  <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || "User"} />
                  <AvatarFallback className="text-3xl">{getInitials(profile?.displayName)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full" asChild>
                  <Link href="/profile" title="Edit Profile Photo">
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <CardTitle className="font-headline text-3xl">Hi, {profile?.displayName || "Student"}!</CardTitle>
                <CardDescription className="text-md">
                  {profile?.displayName} &bull; {studentMockData.semester} &bull; {studentMockData.academicYear}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto shrink-0">
                    Account Options <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Update Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/student/transactions" passHref>
                     <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" />
                      Transaction History
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/help" passHref>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Student Info Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Student Information</CardTitle>
            <CardDescription>Your personal and contact details. <Link href="/profile" className="text-primary hover:underline text-sm">Edit Profile</Link></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-lg text-foreground/90">General Information</h3>
                <div className="space-y-2 text-sm p-4 bg-secondary/30 rounded-md">
                  <p><strong className="w-32 inline-block text-muted-foreground">Full Name:</strong> {profile?.displayName || "N/A"}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Matricule:</strong> {studentMockData.matricule}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Program:</strong> {studentMockData.program}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Department:</strong> {studentMockData.department}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-lg text-foreground/90">Basic Information</h3>
                <div className="space-y-2 text-sm p-4 bg-secondary/30 rounded-md">
                  <p><strong className="w-32 inline-block text-muted-foreground">Date of Birth:</strong> {studentMockData.dateOfBirth}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Nationality:</strong> {studentMockData.nationality}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Email:</strong> {profile?.email || "N/A"}</p>
                  <p><strong className="w-32 inline-block text-muted-foreground">Phone:</strong> (Placeholder)</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg text-foreground/90">Contact Information</h3>
              <div className="space-y-2 text-sm p-4 bg-secondary/30 rounded-md">
                 <p className="flex items-start"><Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-32 inline-block text-muted-foreground">Mailing Address:</strong> {studentMockData.address}</p>
                 <p className="flex items-start"><Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-32 inline-block text-muted-foreground">Emergency Contact:</strong> {studentMockData.emergencyContactName} ({studentMockData.emergencyContactPhone})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Existing Modules - can be refactored into separate pages/components later */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="lg:col-span-2 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Enrolled Courses</CardTitle>
              <CardDescription>Your current and recently completed courses.</CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledCourses.length > 0 ? (
                <ul className="space-y-3">
                  {enrolledCourses.map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                      <div>
                        <h3 className="font-medium">{course.name} ({course.id})</h3>
                        <p className="text-sm text-muted-foreground">{course.credits} Credits</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${course.grade === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>{course.grade}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No courses enrolled yet.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/courses">View All Courses & Register</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary"/>Recent Grades</CardTitle>
              <CardDescription>Summary of your academic performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                <p className="font-medium">Overall GPA</p>
                <p className="text-xl font-semibold text-primary">3.75</p> {/* Mock GPA */}
              </div>
              <p className="text-sm text-muted-foreground">Detailed results and transcripts are in "My Grades".</p>
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
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="md:col-span-2 lg:col-span-1 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/>Tuition Status</CardTitle>
              <CardDescription>Overview of your fee payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Due:</span>
                <span className="font-semibold">{tuitionStatus.currency} {tuitionStatus.totalDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">{tuitionStatus.currency} {tuitionStatus.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-semibold text-destructive">{tuitionStatus.currency} {tuitionStatus.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-semibold">{tuitionStatus.dueDate}</span>
              </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/student/payments">Make a Payment</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 pt-2">
                <Smartphone className="h-3 w-3" /> Supports MTN Mobile Money & Orange Money.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <Card className="lg:col-span-2 h-full">
            <CardHeader>
              <CardTitle>Announcements &amp; Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x200.png" alt="University Event" width={600} height={200} className="rounded-md mb-4" data-ai-hint="university campus event" />
              <p className="text-muted-foreground">Stay updated with the latest news and events from the university.</p>
              <ul className="space-y-2 mt-3">
                <li className="text-sm p-2 bg-secondary/30 rounded-md">Mid-term exams start next week!</li>
                <li className="text-sm p-2 bg-secondary/30 rounded-md">Guest lecture on AI in Education - Oct 25th.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

    