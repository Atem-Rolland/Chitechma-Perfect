
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Course } from "@/types";
import { BookOpen, Search, Filter, Tag, ArrowRight, School, Info, CalendarDays, BookUser, PlusCircle, MinusCircle, Download, AlertCircle, XCircle, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const MIN_CREDITS = 18;
const MAX_CREDITS = 24;

// Mock data fetching function - replace with actual Firestore query
async function fetchCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: "CSE101", title: "Introduction to Computer Science", code: "CSE 101", description: "Fundamental concepts of computer science and programming. Topics include algorithms, data structures, problem-solving, and programming in Python.", department: "Computer Science", lecturerId: "lecturer1", lecturerName: "Dr. Ada Lovelace", credits: 3, type: "Compulsory", level: 100, schedule: "Mon, Wed 9:00-10:30", prerequisites: [] },
    { id: "MTH101", title: "Calculus I", code: "MTH 101", description: "Differential calculus, limits, continuity, and applications of derivatives. Introduction to integration.", department: "Mathematics", lecturerId: "lecturer2", lecturerName: "Prof. Isaac Newton", credits: 4, type: "Compulsory", level: 100, schedule: "Tue, Thu 11:00-12:30", prerequisites: [] },
    { id: "PHY101", title: "University Physics I", code: "PHY 101", description: "Mechanics, heat, and sound. Principles of classical physics with problem-solving.", department: "Physics", lecturerId: "lecturer3", lecturerName: "Dr. Albert Einstein", credits: 4, type: "Compulsory", level: 100, schedule: "Mon, Fri 13:00-14:30", prerequisites: [] },
    { id: "ENG101", title: "Academic Writing", code: "ENG 101", description: "Developing skills in academic reading, critical thinking, and effective writing for university-level coursework.", department: "English", lecturerId: "lecturer4", lecturerName: "Prof. Jane Austen", credits: 3, type: "General", level: 100, schedule: "Wed, Fri 10:00-11:30", prerequisites: [] },
    { id: "CSE201", title: "Data Structures and Algorithms", code: "CSE 201", description: "Study of fundamental data structures (arrays, linked lists, trees, graphs) and algorithm analysis.", department: "Computer Science", lecturerId: "lecturer1", lecturerName: "Dr. Ada Lovelace", credits: 4, type: "Compulsory", level: 200, schedule: "Mon, Wed 11:00-12:30", prerequisites: ["CSE101"] },
    { id: "MTH202", title: "Linear Algebra", code: "MTH 202", description: "Vectors, matrices, determinants, systems of linear equations, vector spaces, and eigenvalues.", department: "Mathematics", lecturerId: "lecturer2", lecturerName: "Prof. Isaac Newton", credits: 3, type: "Compulsory", level: 200, schedule: "Tue, Thu 14:00-15:30", prerequisites: ["MTH101"] },
    { id: "STT100", title: "Introduction to Statistics", code: "STT 100", description: "Basic statistical concepts and methods including descriptive statistics, probability, and inference.", department: "Statistics", lecturerId: "lecturer5", lecturerName: "Dr. Florence Nightingale", credits: 3, type: "Elective", level: 100, schedule: "Fri 14:00-17:00", prerequisites: [] },
    { id: "FRN101", title: "French Language I", code: "FRN 101", description: "Introduction to French language and culture. Focus on basic communication skills.", department: "Languages", lecturerId: "lecturer6", lecturerName: "Mme. Simone de Beauvoir", credits: 2, type: "General", level: 100, schedule: "Tue 08:00-10:00", prerequisites: [] },
  ];
}

// Mock registration status
const registrationMeta = {
  isOpen: true,
  deadline: "2024-09-15",
  academicYear: "2024/2025",
  semester: "First Semester",
};

export default function CoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: registrationMeta.academicYear,
    semester: registrationMeta.semester,
    department: "all",
    level: "all",
    courseType: "all",
  });
  const [registeredCourseIds, setRegisteredCourseIds] = useState<string[]>([]);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      const fetchedCourses = await fetchCourses();
      setAllCourses(fetchedCourses);
      setIsLoading(false);
    }
    loadCourses();
  }, []);

  const uniqueDepartments = useMemo(() => ["all", ...new Set(allCourses.map(c => c.department))], [allCourses]);
  const uniqueLevels = useMemo(() => ["all", ...new Set(allCourses.map(c => c.level.toString()))].sort((a,b) => a === "all" ? -1 : b === "all" ? 1 : parseInt(a) - parseInt(b)), [allCourses]);
  const courseTypes = ["all", "Compulsory", "Elective", "General"];
  const academicYears = ["2023/2024", "2024/2025"]; // Mock
  const semesters = ["First Semester", "Second Semester"]; // Mock

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredCourses = useMemo(() => {
    return allCourses
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(course => filters.department === "all" || course.department === filters.department)
      .filter(course => filters.level === "all" || course.level.toString() === filters.level)
      .filter(course => filters.courseType === "all" || course.type === filters.courseType);
      // Add filtering by academicYear and semester if course data includes it or if API supports it
  }, [allCourses, searchTerm, filters]);

  const registeredCoursesList = useMemo(() => {
    return allCourses.filter(course => registeredCourseIds.includes(course.id));
  }, [allCourses, registeredCourseIds]);

  const totalRegisteredCredits = useMemo(() => {
    return registeredCoursesList.reduce((sum, course) => sum + course.credits, 0);
  }, [registeredCoursesList]);

  const handleRegisterCourse = (course: Course) => {
    if (!registrationMeta.isOpen) {
      alert("Registration is currently closed."); // Replace with Toaster
      return;
    }
    if (totalRegisteredCredits + course.credits > MAX_CREDITS) {
      alert(`Cannot register. Exceeds maximum credit load of ${MAX_CREDITS}.`); // Replace with Toaster
      return;
    }
    if (!registeredCourseIds.includes(course.id)) {
      // Check prerequisites (basic check, can be made more robust)
      const unmetPrerequisites = course.prerequisites?.filter(prereqCode => 
        !registeredCourseIds.includes(allCourses.find(c => c.code === prereqCode)?.id || "") &&
        !allCourses.find(c => c.code === prereqCode && registeredCourseIds.includes(c.id)) // Already registered prereq
      );

      if (unmetPrerequisites && unmetPrerequisites.length > 0) {
        alert(`Cannot register ${course.code}. Missing prerequisites: ${unmetPrerequisites.join(', ')}.`);
        return;
      }
      setRegisteredCourseIds(prev => [...prev, course.id]);
    }
  };

  const handleDropCourse = (courseId: string) => {
     if (!registrationMeta.isOpen) {
      alert("Cannot drop courses, registration is closed."); // Replace with Toaster
      return;
    }
    setRegisteredCourseIds(prev => prev.filter(id => id !== courseId));
  };

  const getCreditStatus = () => {
    if (totalRegisteredCredits < MIN_CREDITS) return {
      message: `You are under the minimum credit load (${MIN_CREDITS} credits). Please register more courses.`,
      variant: "warning" as const
    };
    if (totalRegisteredCredits > MAX_CREDITS) return {
      message: `You are over the maximum credit load (${MAX_CREDITS} credits). Please drop some courses.`,
      variant: "destructive" as const
    };
    return {
      message: `Total credits within the allowed range (${MIN_CREDITS}-${MAX_CREDITS}).`,
      variant: "success" as const
    };
  };
  
  const creditStatus = getCreditStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-bold">Course Registration</h1>
        <p className="text-lg text-muted-foreground">
          Register for courses for {filters.semester}, {filters.academicYear}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Registration Status</CardTitle>
        </CardHeader>
        <CardContent>
          {registrationMeta.isOpen ? (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle>Registration is OPEN</AlertTitle>
              <AlertDescription>
                Deadline to register or drop courses: <strong>{new Date(registrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Registration is CLOSED</AlertTitle>
              <AlertDescription>
                The deadline for course registration has passed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="text-primary"/>Filter Courses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}>
            <SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Academic Year</SelectTrigger>
            <SelectContent>
              {academicYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><BookOpen className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Semester</SelectTrigger>
            <SelectContent>
              {semesters.map(sem => <SelectItem key={sem} value={sem}>{sem}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
            <SelectTrigger><School className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Department</SelectTrigger>
            <SelectContent>
              {uniqueDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.level} onValueChange={(value) => handleFilterChange("level", value)}>
            <SelectTrigger><BookUser className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Level</SelectTrigger>
            <SelectContent>
              {uniqueLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl === "all" ? "All Levels" : `${lvl} Level`}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.courseType} onValueChange={(value) => handleFilterChange("courseType", value)}>
            <SelectTrigger><Tag className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Course Type</SelectTrigger>
            <SelectContent>
              {courseTypes.map(type => <SelectItem key={type} value={type}>{type === "all" ? "All Types" : type}</SelectItem>)}
            </SelectContent>
          </Select>
           <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title or code..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Select courses to register for the current semester.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : filteredCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const isRegistered = registeredCourseIds.includes(course.id);
                    const canRegister = !isRegistered && registrationMeta.isOpen && (totalRegisteredCredits + course.credits <= MAX_CREDITS);
                    const canDrop = isRegistered && registrationMeta.isOpen;
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell><Badge variant={course.type === 'Compulsory' ? 'default' : course.type === 'Elective' ? 'secondary' : 'outline'}>{course.type}</Badge></TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.lecturerName}</TableCell>
                        <TableCell>
                          {isRegistered ? <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Registered</Badge> : <Badge variant="outline">Available</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedCourseForDetail(course)}>
                                <Eye className="h-4 w-4"/>
                                <span className="sr-only">View Details</span>
                              </Button>
                            </DialogTrigger>
                           </Dialog>
                          {isRegistered ? (
                            <Button variant="destructive" size="sm" onClick={() => handleDropCourse(course.id)} disabled={!canDrop}>
                              <MinusCircle className="mr-1 h-4 w-4"/> Drop
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleRegisterCourse(course)} disabled={!canRegister || !registrationMeta.isOpen}>
                              <PlusCircle className="mr-1 h-4 w-4"/> Register
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Image src="https://placehold.co/300x200.png" alt="No courses found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education" />
                <h3 className="text-xl font-semibold">No Courses Found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Registered Courses</CardTitle>
              <CardDescription>Courses you are registered for this semester.</CardDescription>
            </CardHeader>
            <CardContent>
              {registeredCoursesList.length > 0 ? (
                <ul className="space-y-2">
                  {registeredCoursesList.map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.credits} Credits</p>
                      </div>
                       {registrationMeta.isOpen && (
                        <Button variant="ghost" size="icon" onClick={() => handleDropCourse(course.id)} className="text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Drop {course.code}</span>
                        </Button>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No courses registered yet.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start space-y-3">
              <div className="w-full">
                <p className="text-lg font-semibold">Total Registered Credits: <span className={
                    totalRegisteredCredits < MIN_CREDITS || totalRegisteredCredits > MAX_CREDITS ? "text-destructive" : "text-green-600 dark:text-green-400"
                }>{totalRegisteredCredits}</span>
                </p>
                { (totalRegisteredCredits < MIN_CREDITS || totalRegisteredCredits > MAX_CREDITS) && registrationMeta.isOpen && (
                   <Alert variant={creditStatus.variant === "success" ? "default" : creditStatus.variant} className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{creditStatus.variant === "warning" ? "Warning" : "Error"}</AlertTitle>
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                )}
                 { totalRegisteredCredits >= MIN_CREDITS && totalRegisteredCredits <= MAX_CREDITS && (
                   <Alert variant="default" className="mt-2 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                 )}
              </div>
              <Button className="w-full" disabled={registeredCoursesList.length === 0}>
                <Download className="mr-2 h-4 w-4"/> Download Form B (PDF)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {selectedCourseForDetail && (
        <Dialog open={!!selectedCourseForDetail} onOpenChange={(isOpen) => !isOpen && setSelectedCourseForDetail(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedCourseForDetail.code} - {selectedCourseForDetail.title}</DialogTitle>
              <DialogDescription>Level {selectedCourseForDetail.level} - {selectedCourseForDetail.credits} Credits - {selectedCourseForDetail.type}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <p><strong>Department:</strong> {selectedCourseForDetail.department}</p>
              <p><strong>Lecturer:</strong> {selectedCourseForDetail.lecturerName || "N/A"}</p>
              <p><strong>Description:</strong> {selectedCourseForDetail.description}</p>
              {selectedCourseForDetail.schedule && <p><strong>Schedule:</strong> {selectedCourseForDetail.schedule}</p>}
              {selectedCourseForDetail.prerequisites && selectedCourseForDetail.prerequisites.length > 0 && (
                <p><strong>Prerequisites:</strong> {selectedCourseForDetail.prerequisites.join(', ')}</p>
              )}
            </div>
             <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}

    </motion.div>
  );
}
