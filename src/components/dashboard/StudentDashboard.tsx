
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, GraduationCap, CreditCard, FileText, Download, User, Edit3, Settings, LogOut, HelpCircle, History, ChevronDown, Info, Phone, Mail, MapPin, Smartphone, Building, Users as GuardianIcon, Briefcase, CalendarDays, ShieldAlert, Award, Globe } from "lucide-react";
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
  totalDue: 1250000, 
  paid: 1000000,  
  balance: 250000, 
  currency: 'XAF',
  dueDate: '2024-09-15',
};

const studentMockData = {
  semester: "Fall 2024",
  academicYear: "2024/2025",
  matricule: "CUSMS/S00123",
  program: "B.Sc. Computer Science",
  department: "Computer Science & Engineering",
  gender: "Female",
  dateOfBirth: "1999-08-25",
  placeOfBirth: "Douala, Cameroon",
  regionOfOrigin: "Littoral",
  maritalStatus: "Single",
  nidOrPassport: "123456789CM",
  nationality: "Cameroonian",
  admissionDate: "2022-09-01",
  studentStatus: "Cameroonian (National)", // e.g. Cameroonian/Foreign
  address: "123 University Avenue, Buea, SW Region",
  emergencyContactName: "John Doe (Father)",
  emergencyContactPhone: "+237 6XX XXX XXX",
  guardianName: "John Doe",
  guardianAddress: "BP 456, Douala",
  guardianPhone: "+237 6XX XXX XXX",
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
    <div className="space-y-8">
      {/* Student Identity Card & Profile Settings */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-card to-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/profile" className="relative group">
                <Avatar className="h-28 w-28 ring-4 ring-primary ring-offset-background ring-offset-2 group-hover:ring-accent transition-all duration-300">
                  <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || "User"} />
                  <AvatarFallback className="text-4xl bg-muted">{getInitials(profile?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Edit3 className="h-8 w-8 text-white" />
                </div>
              </Link>
              <div className="flex-grow text-center sm:text-left">
                <CardTitle className="font-headline text-4xl text-foreground">Hi, {profile?.displayName || "Student"}!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-1">
                  {studentMockData.program} <br />
                  {studentMockData.academicYear} &bull; {studentMockData.semester}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto shrink-0">
                    Profile & Settings <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Update Profile Photo
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/student/transactions" passHref> {/* Placeholder link */}
                     <DropdownMenuItem>
                      <History className="mr-2 h-4 w-4" />
                      View Transaction History
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/help" passHref> {/* Placeholder link */}
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Contact Support
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

      {/* Personal Info Section (Read-only) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Info className="text-primary h-6 w-6"/>Personal Information</CardTitle>
            <CardDescription>Your registered personal and academic details. Contact administration for corrections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            
            <div>
              <h3 className="font-semibold text-lg text-foreground/90 mb-3 border-b pb-2 flex items-center gap-2"><User className="h-5 w-5 text-accent"/>Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Full Name:</strong> <span className="text-foreground/90">{profile?.displayName || "N/A"}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Gender:</strong> <span className="text-foreground/90">{studentMockData.gender}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Date of Birth:</strong> <span className="text-foreground/90">{studentMockData.dateOfBirth}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Place of Birth:</strong> <span className="text-foreground/90">{studentMockData.placeOfBirth}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Region of Origin:</strong> <span className="text-foreground/90">{studentMockData.regionOfOrigin}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Marital Status:</strong> <span className="text-foreground/90">{studentMockData.maritalStatus}</span></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-foreground/90 mb-3 border-b pb-2 flex items-center gap-2"><Briefcase className="h-5 w-5 text-accent"/>Academic & Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Matricule:</strong> <span className="font-mono text-foreground/90">{studentMockData.matricule}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Degree Program:</strong> <span className="text-foreground/90">{studentMockData.program}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Department:</strong> <span className="text-foreground/90">{studentMockData.department}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">NID/Passport:</strong> <span className="text-foreground/90">{studentMockData.nidOrPassport}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Nationality:</strong> <span className="text-foreground/90">{studentMockData.nationality}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Admission Date:</strong> <span className="text-foreground/90">{studentMockData.admissionDate}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Student Status:</strong> <span className="text-foreground/90">{studentMockData.studentStatus}</span></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-foreground/90 mb-3 border-b pb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-accent"/>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><Phone className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Phone:</strong> <span className="text-foreground/90">(Placeholder)</span></div>
                <div className="flex items-start gap-2"><Mail className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Email:</strong> <span className="text-foreground/90">{profile?.email || "N/A"}</span></div>
                <div className="md:col-span-2 flex items-start gap-2"><MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Address:</strong> <span className="text-foreground/90">{studentMockData.address}</span></div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-foreground/90 mb-3 border-b pb-2 flex items-center gap-2"><GuardianIcon className="h-5 w-5 text-accent"/>Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Guardian Name:</strong> <span className="text-foreground/90">{studentMockData.guardianName}</span></div>
                <div className="flex items-start gap-2"><Phone className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Phone:</strong> <span className="text-foreground/90">{studentMockData.guardianPhone}</span></div>
                <div className="md:col-span-2 flex items-start gap-2"><MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Address:</strong> <span className="text-foreground/90">{studentMockData.guardianAddress}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Existing Modules - Retained for now, can be refactored into separate pages/components later */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="lg:col-span-2 h-full shadow-md hover:shadow-lg transition-shadow">
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
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
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
          <Card className="md:col-span-2 lg:col-span-1 h-full shadow-md hover:shadow-lg transition-shadow">
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
          <Card className="lg:col-span-2 h-full shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="text-primary"/>Announcements &amp; Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x200.png" alt="University Event" width={600} height={200} className="rounded-md mb-4" data-ai-hint="university campus event" />
              <p className="text-muted-foreground">Stay updated with the latest news and events from the university.</p>
              <ul className="space-y-2 mt-3">
                <li className="text-sm p-2 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-accent"/>Mid-term exams start next week!</li>
                <li className="text-sm p-2 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent"/>Guest lecture on AI in Education - Oct 25th.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

    