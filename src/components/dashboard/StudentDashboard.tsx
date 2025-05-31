
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, GraduationCap, CreditCard, FileText, Download, User, Edit3, Settings, LogOut, HelpCircle, History, ChevronDown, Info, Phone, Mail, MapPin, Smartphone, Building, Users as GuardianIcon, Briefcase, CalendarDays, ShieldAlert, Award, Globe, School, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { Course } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from "@/config/data";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for tuition status - this can remain as is or be fetched if needed
const tuitionStatus = {
  totalDue: 1250000, 
  paid: 1000000,  
  balance: 250000, 
  currency: 'XAF',
  dueDate: '2024-09-15',
};

const studentMockPersonalData = { // For details not yet in UserProfile
  matricule: "CUSMS/S00123",
  gender: "Female",
  dateOfBirth: "1999-08-25",
  placeOfBirth: "Douala, Cameroon",
  regionOfOrigin: "Littoral",
  maritalStatus: "Single",
  nidOrPassport: "123456789CM",
  nationality: "Cameroonian",
  admissionDate: "2022-09-01",
  studentStatus: "Cameroonian (National)", 
  address: "123 University Avenue, Buea, SW Region",
  emergencyContactName: "John Doe (Father)",
  emergencyContactPhone: "+237 6XX XXX XXX",
  guardianName: "John Doe",
  guardianAddress: "BP 456, Douala",
  guardianPhone: "+237 6XX XXX XXX",
  phone: "+237 6YY YYY YYY"
};

// Copied and adapted from courses/page.tsx for mock course data source
const MOCK_ALL_COURSES_SOURCE: Course[] = [
  { id: "CSE301_CESM_Y2324_S1", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures. Prerequisite course.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" },
  { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Detailed course description for Mobile Application Development. Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10-12, Wed 10-11, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
  { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Detailed course description for Software Development and OOP. Focuses on object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-16, Fri 8-9", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology. Introduction to research methods and academic writing.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", description: "Detailed course description for Embedded Systems. Design and programming of embedded systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Thu 8-11", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System. Techniques for system modeling.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11-13, CR10", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  { id: "CSE406_CESM_Y2425_S2", title: "Algorithm and Data Structure", code: "CSE406", description: "In-depth study of algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 8-10, CR1", prerequisites: ["CSE301", "CSE401"], semester: "Second Semester", academicYear: "2024/2025" },
  { id: "CSE402_CESM_Y2425_S2", title: "Distributed Programming", code: "CSE402", description: "Concepts and practices in distributed programming.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 10-12, CR1", prerequisites: ["CSE409"], semester: "Second Semester", academicYear: "2024/2025" },
];

const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};

export function StudentDashboard() {
  const { user, profile, logout } = useAuth();
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [displayedEnrolledCourses, setDisplayedEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function loadRegisteredCoursesForDashboard() {
      setIsLoadingCourses(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate some delay

      if (profile && user?.uid && typeof window !== 'undefined') {
        const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
        let studentRegisteredIds: string[] = [];
        if (storageKey) {
            const storedIds = localStorage.getItem(storageKey);
            if (storedIds) {
                studentRegisteredIds = JSON.parse(storedIds);
            }
        }
        
        const studentCurrentYear = profile.currentAcademicYear || ACADEMIC_YEARS[1];
        const studentCurrentSemester = profile.currentSemester || SEMESTERS[0];

        const filtered = MOCK_ALL_COURSES_SOURCE.filter(course => 
            studentRegisteredIds.includes(course.id) &&
            course.academicYear === studentCurrentYear &&
            course.semester === studentCurrentSemester &&
            course.department === profile.department &&
            course.level === profile.level
        );
        setDisplayedEnrolledCourses(filtered);
      } else {
        setDisplayedEnrolledCourses([]);
      }
      setIsLoadingCourses(false);
    }
    loadRegisteredCoursesForDashboard();
  }, [profile, user?.uid]);


  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const academicProgram = profile?.program || "Program Not Set"; 
  const studentDepartment = profile?.department || "Department Not Set";
  const studentLevel = profile?.level ? `Level ${profile.level}` : "Level Not Set";
  const currentAcademicYear = profile?.currentAcademicYear || "Academic Year Not Set";
  const currentSemester = profile?.currentSemester || "Semester Not Set";


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-card to-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/profile" className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-primary ring-offset-background ring-offset-2 group-hover:ring-accent transition-all duration-300">
                <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || "User"} data-ai-hint="user avatar" />
                <AvatarFallback className="text-4xl bg-muted">{getInitials(profile?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
            </Link>
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="font-headline text-4xl text-foreground">Hi, {profile?.displayName || "Student"}!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                {academicProgram} <br />
                {currentAcademicYear} &bull; {currentSemester}
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
                <Link href="/dashboard/student/payments/history" passHref> 
                   <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    View Transaction History
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/help" passHref> 
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contact Support (Placeholder)
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Info className="text-primary h-6 w-6"/>Personal & Academic Information</CardTitle>
          <CardDescription>
            Your registered details. Academic information (Department, Level) is used for course display. Contact administration for corrections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          
          <div>
            <h3 className="font-semibold text-lg text-foreground/90 mt-2 mb-3 border-b pb-2 flex items-center gap-2"><User className="h-5 w-5 text-accent"/>Identity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Full Name:</strong> <span className="text-foreground/90">{profile?.displayName || "N/A"}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Gender:</strong> <span className="text-foreground/90">{studentMockPersonalData.gender}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Date of Birth:</strong> <span className="text-foreground/90">{studentMockPersonalData.dateOfBirth}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Place of Birth:</strong> <span className="text-foreground/90">{studentMockPersonalData.placeOfBirth}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Region of Origin:</strong> <span className="text-foreground/90">{studentMockPersonalData.regionOfOrigin}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Marital Status:</strong> <span className="text-foreground/90">{studentMockPersonalData.maritalStatus}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">NID/Passport:</strong> <span className="text-foreground/90">{studentMockPersonalData.nidOrPassport}</span></div>
              <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Nationality:</strong> <span className="text-foreground/90">{studentMockPersonalData.nationality}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground/90 mt-6 mb-3 border-b pb-2 flex items-center gap-2"><School className="h-5 w-5 text-accent"/>Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Matricule:</strong> <span className="font-mono text-foreground/90">{(profile as any)?.matricule || studentMockPersonalData.matricule}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Degree Program:</strong> <span className="text-foreground/90">{academicProgram}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Department:</strong> <span className="text-foreground/90">{studentDepartment}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Current Level:</strong> <span className="text-foreground/90">{studentLevel}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Academic Year:</strong> <span className="text-foreground/90">{currentAcademicYear}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Current Semester:</strong> <span className="text-foreground/90">{currentSemester}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Admission Date:</strong> <span className="text-foreground/90">{studentMockPersonalData.admissionDate}</span></div>
                <div className="flex items-start gap-2"><strong className="w-32 text-muted-foreground">Student Status:</strong> <span className="text-foreground/90">{studentMockPersonalData.studentStatus}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground/90 mt-6 mb-3 border-b pb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-accent"/>Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-start gap-2"><Phone className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Phone:</strong> <span className="text-foreground/90">{(profile as any)?.phone || studentMockPersonalData.phone}</span></div>
              <div className="flex items-start gap-2"><Mail className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Email:</strong> <span className="text-foreground/90">{profile?.email || "N/A"}</span></div>
              <div className="md:col-span-2 flex items-start gap-2"><MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Address:</strong> <span className="text-foreground/90">{(profile as any)?.address || studentMockPersonalData.address}</span></div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground/90 mt-6 mb-3 border-b pb-2 flex items-center gap-2"><GuardianIcon className="h-5 w-5 text-accent"/>Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-start gap-2"><User className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-32 text-muted-foreground">Guardian Name:</strong> <span className="text-foreground/90">{(profile as any)?.guardianName || studentMockPersonalData.guardianName}</span></div>
              <div className="flex items-start gap-2"><Phone className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Phone:</strong> <span className="text-foreground/90">{(profile as any)?.guardianPhone || studentMockPersonalData.guardianPhone}</span></div>
              <div className="md:col-span-2 flex items-start gap-2"><MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground shrink-0"/><strong className="w-28 text-muted-foreground">Address:</strong> <span className="text-foreground/90">{(profile as any)?.guardianAddress || studentMockPersonalData.guardianAddress}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="lg:col-span-2 h-full shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Registered Courses</CardTitle>
              <CardDescription>Your courses for {currentSemester}, {currentAcademicYear}.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : displayedEnrolledCourses.length > 0 ? (
                <ul className="space-y-3">
                  {displayedEnrolledCourses.map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                      <div>
                        <h3 className="font-medium">{course.title} ({course.code})</h3>
                        <p className="text-sm text-muted-foreground">{course.credits} Credits</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300`}>Registered</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <div className="text-center py-6">
                    <Image src="https://placehold.co/200x150.png" alt="No courses registered" width={100} height={75} className="mx-auto mb-3 rounded-md opacity-70" data-ai-hint="empty list book" />
                    <p className="text-muted-foreground">No courses registered for the current period.</p>
                </div>
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
                <p className="text-xl font-semibold text-primary">3.15</p> {/* Mock GPA for Atem Rolland */}
              </div>
              <p className="text-sm text-muted-foreground">Detailed results and transcripts are in "Results".</p>
              <Button className="w-full" asChild>
                <Link href="/dashboard/student/grades">
                  <FileText className="mr-2 h-4 w-4"/> View My Results
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/student/grades/transcript"> 
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
                <li className="text-sm p-2 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-accent"/>Second semester registration deadline approaching!</li>
                <li className="text-sm p-2 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent"/>Career fair - Nov 15th.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
