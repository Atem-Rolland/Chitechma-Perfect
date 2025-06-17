
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { Course, UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES } from "@/config/data";

interface StudentEnrolled extends Pick<UserProfile, 'uid' | 'displayName' | 'email' | 'level' | 'matricule'> {}

function generateMockStudentsForCourse(courseLevel: number, count: number = 15): StudentEnrolled[] {
  const students: StudentEnrolled[] = [];
  const firstNames = ["Atem", "Bih", "Chenwi", "Divine", "Emelda", "Fongoh", "Gael", "Hassan", "Ibrahim", "Joy"];
  const lastNames = ["Rolland", "Ndi", "Fon", "Njie", "Etta", "Abang", "Kamga", "Musa", "Ali", "Ngwa"];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const matriculeYear = new Date().getFullYear().toString().slice(-2);
    const studentIdSuffix = String(Math.floor(1000 + Math.random() * 9000));

    students.push({
      uid: `student${i + 1}`,
      displayName: `${firstName} ${lastName}`,
      matricule: `CUSMS/S/${matriculeYear}${courseLevel.toString()[0]}${studentIdSuffix}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      level: courseLevel,
    });
  }
  return students;
}


export default function ClassListPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null | undefined>(undefined); 
  const [students, setStudents] = useState<StudentEnrolled[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundCourse = ALL_UNIVERSITY_COURSES.find(c => c.id === courseId);
    
    // Removed artificial setTimeout for faster loading
    if (foundCourse) {
      setCourse(foundCourse);
      setStudents(generateMockStudentsForCourse(foundCourse.level, Math.floor(Math.random() * 15) + 10));
    } else {
      setCourse(null);
    }
    setIsLoading(false);
  }, [courseId]);

  const handleExport = (format: "CSV" | "Excel") => {
    toast({
      title: `Exporting Class List (${format}) - Simulation`,
      description: `This is a placeholder action. Actual ${format} export for the student list of ${course?.code} is under development.`,
      duration: 5000,
    });
  };

  const handlePrintRegister = () => {
    toast({
      title: "Printing Register - Simulation",
      description: `This is a placeholder action. Actual register printing for ${course?.code} is under development.`,
      duration: 5000,
    });
    // window.print(); // Basic browser print for the whole page
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (course === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-10"
      >
        <Image src="https://placehold.co/300x200.png" alt="Course not found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="error document" />
        <h2 className="text-2xl font-semibold text-destructive">Course Not Found</h2>
        <p className="text-muted-foreground">The course you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </motion.div>
    );
  }
  
  if (!course) return null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
      </Button>

      <header className="space-y-1">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Class List
        </h1>
        <p className="text-muted-foreground text-lg">
          Students registered for: <strong>{course.title} ({course.code})</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Level: {course.level} | Semester: {course.semester}, {course.academicYear} | Department: {course.department}
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle>Enrolled Students ({students.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleExport("CSV")}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("Excel")} disabled>
                <Download className="mr-2 h-4 w-4" /> Export Excel (Soon)
              </Button>
              <Button variant="default" onClick={handlePrintRegister}>
                <Printer className="mr-2 h-4 w-4" /> Print Register
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Matricule No.</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.uid}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.displayName}</TableCell>
                      <TableCell>{student.matricule}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-center">{student.level}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
                <Image src="https://placehold.co/300x200.png" alt="No students enrolled" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty classroom students" />
                <h3 className="text-xl font-semibold">No Students Enrolled</h3>
                <p className="text-muted-foreground mt-1">
                  There are currently no students registered for this course.
                </p>
              </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This list reflects students officially registered for {course.code}. For attendance, use the printed register.
            </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

