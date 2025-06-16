
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import type { Grade, CaDetails, Course } from "@/types";
import { BookCheck, CalendarDays, BookOpen as SemesterIcon, BarChart3, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Eye, Info, HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react"; 
import dynamic from 'next/dynamic'; 
import { motion } from "framer-motion";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS, getGradeDetailsFromScore } from "@/config/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GradeDetailDialogContent = dynamic(() => import('@/components/grades/GradeDetailDialogContent'), {
  suspense: true,
  loading: () => <div className="p-6 text-center">Loading details...</div>,
});

async function fetchAllCoursesMock(): Promise<Course[]> {
  return [
    { id: "LAW101_CESM_Y2223_S1", title: "Introduction to Law", code: "LAW101", department: DEPARTMENTS.CESM, credits: 1, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "" , type: "General"},
    { id: "ENG102_CESM_Y2223_S1", title: "English Language", code: "ENG102", department: DEPARTMENTS.CESM, credits: 1, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "" , type: "General"},
    { id: "SWE111_CESM_Y2223_S1", title: "Introduction to Software Eng", code: "SWE111", department: DEPARTMENTS.CESM, credits: 3, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "SWE92_CESM_Y2223_S2", title: "Computer Programming I", code: "SWE92", department: DEPARTMENTS.CESM, credits: 3, level: 200, semester: "Second Semester", academicYear: "2022/2023", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "SWE94_CESM_Y2223_S2", title: "Data Structures and Algorithms", code: "SWE94", department: DEPARTMENTS.CESM, credits: 3, level: 200, semester: "Second Semester", academicYear: "2022/2023", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE301_CESM_Y2324_S1", title: "Introduction to Algorithms", code: "CSE301", department: DEPARTMENTS.CESM, credits: 3, level: 300, semester: "First Semester", academicYear: "2023/2024", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE303_CESM_Y2324_S1", title: "Web Technologies", code: "CSE303", department: DEPARTMENTS.CESM, credits: 3, level: 300, semester: "First Semester", academicYear: "2023/2024", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE302_CESM_Y2324_S2", title: "Database Systems", code: "CSE302", department: DEPARTMENTS.CESM, credits: 3, level: 300, semester: "Second Semester", academicYear: "2023/2024", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE308_CESM_Y2324_S2", title: "Operating Systems II", code: "CSE308", department: DEPARTMENTS.CESM, credits: 3, level: 300, semester: "Second Semester", academicYear: "2023/2024", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", department: DEPARTMENTS.CESM, credits: 3, level: 400, semester: "First Semester", academicYear: "2024/2025", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", department: DEPARTMENTS.CESM, credits: 3, level: 400, semester: "First Semester", academicYear: "2024/2025", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", department: DEPARTMENTS.CESM, credits: 3, level: 400, semester: "First Semester", academicYear: "2024/2025", description: "", lecturerId: "" , type: "General"},
    { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", department: DEPARTMENTS.CESM, credits: 3, level: 400, semester: "First Semester", academicYear: "2024/2025", description: "", lecturerId: "" , type: "Compulsory"},
    { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", department: DEPARTMENTS.CESM, credits: 3, level: 400, semester: "First Semester", academicYear: "2024/2025", description: "", lecturerId: "" , type: "Elective"},
  ];
}

async function fetchMockGrades(studentId: string, allCourses: Course[]): Promise<Grade[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const studentProfile = { department: DEPARTMENTS.CESM, level: 400 }; 
  const grades: Grade[] = [];
  let gradeIdCounter = 1;

  const academicPeriods = [
    { year: "2022/2023", semester: "First Semester", level: 200 },
    { year: "2022/2023", semester: "Second Semester", level: 200 },
    { year: "2023/2024", semester: "First Semester", level: 300 },
    { year: "2023/2024", semester: "Second Semester", level: 300 },
    { year: "2024/2025", semester: "First Semester", level: 400 },
  ];

  for (const period of academicPeriods) {
    if (period.level > studentProfile.level) continue; 
    const coursesForPeriod = allCourses.filter(
      c => c.level === period.level && c.department === studentProfile.department && c.semester === period.semester
    );

    for (const course of coursesForPeriod) {
      const totalCaScore = Math.floor(Math.random() * 15) + 15; 
      const examScore = Math.floor(Math.random() * (period.level === 200 ? 30 : 40)) + (period.level === 200 ? 30 : 30) ; 
      const finalScore = totalCaScore + examScore;
      const gradeDetails = getGradeDetailsFromScore(finalScore);
      const isPublished = Math.random() > 0.2; 

      grades.push({
        id: `G${String(gradeIdCounter++).padStart(3, '0')}`,
        studentId: studentId,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.title,
        credits: course.credits,
        score: isPublished ? finalScore : null,
        gradeLetter: isPublished ? gradeDetails.gradeLetter : null,
        gradePoint: isPublished ? gradeDetails.points : null,
        remark: isPublished ? gradeDetails.remark : "Pending Publication",
        academicYear: period.year,
        semester: period.semester,
        caDetails: {
          assignments: Math.floor(totalCaScore * 0.2), 
          groupWork: Math.floor(totalCaScore * 0.2),
          attendance: Math.floor(totalCaScore * 0.1),
          writtenCA: Math.floor(totalCaScore * 0.5),
          totalCaScore: totalCaScore,
        },
        examScore: isPublished ? examScore : null,
        isPass: isPublished ? gradeDetails.isPass : false,
        isPublished: isPublished,
      });
    }
  }
  return grades;
}

// Standardized localStorage key function
const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};

export default function ViewGradesPage() {
  const { user } = useAuth();
  const [allFetchedGrades, setAllFetchedGrades] = useState<Grade[]>([]); // Stores all grades from mock fetch
  const [displayedGrades, setDisplayedGrades] = useState<Grade[]>([]); // Grades filtered by registration & period
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: "2024/2025",
    semester: "First Semester",
  });
  const [selectedGradeForDetails, setSelectedGradeForDetails] = useState<Grade | null>(null);

  const academicYearsForFilter = useMemo(() => ["all", ...ACADEMIC_YEARS], []);
  const semestersForFilter = useMemo(() => ["all", ...SEMESTERS], []);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const courses = await fetchAllCoursesMock(); 
      const fetchedGrades = await fetchMockGrades(user.uid, courses);
      setAllFetchedGrades(fetchedGrades);

      if (fetchedGrades.length > 0) {
        const latestGrade = fetchedGrades.sort((a,b) => {
            if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
            const semOrder = {"First Semester": 1, "Second Semester": 2, "Resit Semester": 3};
            return (semOrder[b.semester as keyof typeof semOrder] || 0) - (semOrder[a.semester as keyof typeof semOrder] || 0);
        })[0];
        setFilters({ academicYear: latestGrade.academicYear, semester: latestGrade.semester });
      } else {
        setFilters({ academicYear: ACADEMIC_YEARS[ACADEMIC_YEARS.length-1], semester: SEMESTERS[0] });
      }
      setIsLoading(false);
    }
    loadData();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || allFetchedGrades.length === 0) {
        setDisplayedGrades([]);
        return;
    }

    const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
    let studentRegisteredCourseIds: string[] = [];
    if (storageKey && typeof window !== 'undefined') {
        const storedIdsString = localStorage.getItem(storageKey);
        if (storedIdsString) {
            try {
                const parsedIds = JSON.parse(storedIdsString);
                if (Array.isArray(parsedIds)) {
                    studentRegisteredCourseIds = parsedIds;
                }
            } catch (e) {
                console.error("Failed to parse registered courses from localStorage for grades:", e);
            }
        }
    }
    
    const gradesForRegisteredCourses = allFetchedGrades.filter(grade => 
        studentRegisteredCourseIds.includes(grade.courseId)
    );

    const gradesForPeriod = gradesForRegisteredCourses.filter(grade =>
        (filters.academicYear === "all" || grade.academicYear === filters.academicYear) &&
        (filters.semester === "all" || grade.semester === filters.semester)
    );
    setDisplayedGrades(gradesForPeriod);

  }, [allFetchedGrades, filters, user?.uid]);


  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const calculateGpa = (gradesList: Grade[]): { gpa: number, totalCreditsAttempted: number, totalCreditsEarned: number, remarks: string[] } => {
    if (!gradesList || gradesList.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, remarks: [] };
    const publishedGradedCourses = gradesList.filter(
        grade => grade.isPublished && grade.gradePoint !== null && grade.gradeLetter !== "NG"
    );
    if (publishedGradedCourses.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, remarks: ["No published grades for GPA calculation."] };
    const totalQualityPoints = publishedGradedCourses.reduce((sum, grade) => sum + (grade.gradePoint! * grade.credits), 0);
    const totalCreditsAttempted = publishedGradedCourses.reduce((sum, grade) => sum + grade.credits, 0);
    const totalCreditsEarned = publishedGradedCourses.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
    const gpa = totalCreditsAttempted > 0 ? parseFloat((totalQualityPoints / totalCreditsAttempted).toFixed(2)) : 0;
    const remarks = [];
    if (gpa >= 3.5) remarks.push("Excellent Standing");
    else if (gpa >= 3.0) remarks.push("Very Good Standing");
    else if (gpa >= 2.5) remarks.push("Good Standing");
    else if (gpa >= 2.0) remarks.push("Satisfactory Standing");
    else if (gpa > 0) remarks.push("Academic Warning");
    else remarks.push("Poor Standing");
    return { gpa, totalCreditsAttempted, totalCreditsEarned, remarks };
  };

  const semesterGpaStats = useMemo(() => {
    if (filters.academicYear === "all" || filters.semester === "all") return null;
    // GPA for semester should use displayedGrades as it's already filtered by period and registration
    return calculateGpa(displayedGrades);
  }, [displayedGrades, filters]);

  const cumulativeGpaStats = useMemo(() => {
    // CGPA should be based on ALL registered and published grades across all periods.
    const storageKey = getLocalStorageKeyForAllRegistrations(user?.uid);
    let studentRegisteredCourseIds: string[] = [];
    if (storageKey && typeof window !== 'undefined') {
        const storedIdsString = localStorage.getItem(storageKey);
        if (storedIdsString) {
            try {
                const parsedIds = JSON.parse(storedIdsString);
                if (Array.isArray(parsedIds)) studentRegisteredCourseIds = parsedIds;
            } catch (e) { console.error("CGPA localStorage parse error:", e); }
        }
    }
    const allRegisteredAndPublishedGrades = allFetchedGrades.filter(g => 
        studentRegisteredCourseIds.includes(g.courseId) && g.isPublished
    );
    return calculateGpa(allRegisteredAndPublishedGrades);
  }, [allFetchedGrades, user?.uid]);


  const getGpaAlertInfo = (gpa: number | undefined | null) => {
    if (gpa === null || gpa === undefined) return null;
    if (gpa >= 3.5) return { variant: "success", title: "Excellent Standing", icon: <TrendingUp className="h-5 w-5 text-green-500" /> };
    if (gpa >= 3.0) return { variant: "default", title: "Very Good Standing", icon: <CheckCircle className="h-5 w-5 text-primary" /> };
    if (gpa >= 2.5) return { variant: "default", title: "Good Standing", icon: <CheckCircle className="h-5 w-5 text-primary" /> };
    if (gpa >= 2.0) return { variant: "warning", title: "Satisfactory Standing", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> };
    return { variant: "destructive", title: "Academic Warning", icon: <TrendingDown className="h-5 w-5 text-destructive" /> };
  };

  const currentGpaToDisplay = semesterGpaStats ? semesterGpaStats.gpa : cumulativeGpaStats.gpa;
  const gpaAlert = getGpaAlertInfo(currentGpaToDisplay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
          <BookCheck className="h-8 w-8 text-primary" />
          My Grades
        </h1>
        <p className="text-muted-foreground text-lg">
          View your grades by academic year and semester. A grade of 'C' (2.0 points) is the minimum pass mark.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filter Grades</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}>
            <SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />Academic Year</SelectTrigger>
            <SelectContent>
              {academicYearsForFilter.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><SemesterIcon className="mr-2 h-4 w-4 text-muted-foreground" />Semester</SelectTrigger>
            <SelectContent>
              {semestersForFilter.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Grade Details</CardTitle>
                <CardDescription>
                    {filters.academicYear === "all" || filters.semester === "all"
                    ? "Showing all recorded and registered grades."
                    : `Showing registered grades for ${filters.semester}, ${filters.academicYear}.`}
                </CardDescription>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : displayedGrades.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Final Score (/100)</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Remark</TableHead>
                        <TableHead className="text-center">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedGrades.map(grade => (
                        <TableRow key={grade.id} className={cn(grade.isPublished && !grade.isPass ? "bg-destructive/10 dark:bg-destructive/20" : "")}>
                            <TableCell className="font-medium">{grade.courseCode}</TableCell>
                            <TableCell>{grade.courseName}</TableCell>
                            <TableCell className="text-center">{grade.credits}</TableCell>
                            <TableCell className="text-center">{grade.isPublished ? (grade.score !== null ? grade.score : "N/A") : "Pending"}</TableCell>
                            <TableCell className={`text-center font-semibold ${grade.isPublished && !grade.isPass ? "text-destructive" : ""}`}>
                                {grade.isPublished ? grade.gradeLetter : "Pending"}
                            </TableCell>
                            <TableCell className="text-center text-xs">
                                {grade.isPublished ? grade.remark : <Badge variant="outline">Pending Publication</Badge>}
                            </TableCell>
                            <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedGradeForDetails(grade)} disabled={!grade.isPublished}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View Details</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-10">
                    <Image src="https://placehold.co/300x200.png" alt="No grades found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education"/>
                    <h3 className="text-xl font-semibold">No Grades Found</h3>
                    <p className="text-muted-foreground mt-1">
                        No grades available for the selected academic period, or you may not be registered for courses in this period.
                    </p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="text-primary"/>GPA Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {semesterGpaStats
                    ? `SGPA - ${filters.semester}, ${filters.academicYear}`
                    : `Cumulative GPA (CGPA) - All Semesters`}
                </h3>
                <p className={`text-3xl font-bold ${gpaAlert?.variant === 'destructive' ? 'text-destructive' : gpaAlert?.variant === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>
                  {currentGpaToDisplay !== null && currentGpaToDisplay !== undefined ? currentGpaToDisplay.toFixed(2) : "N/A"}
                </p>
                {gpaAlert && (
                  <Alert variant={gpaAlert.variant === "success" ? "default" : gpaAlert.variant} className="mt-2">
                    {gpaAlert.icon}
                    <AlertTitle>{gpaAlert.title}</AlertTitle>
                     <AlertDescription>
                        {semesterGpaStats ? `Based on ${semesterGpaStats.totalCreditsAttempted} credits attempted this semester.` : `Based on ${cumulativeGpaStats.totalCreditsAttempted} total credits attempted.`}
                    </AlertDescription>
                  </Alert>
                )}
                {!gpaAlert && currentGpaToDisplay === 0 && <Alert variant="info" className="mt-2"><Info className="h-4 w-4"/><AlertDescription>GPA is 0.00 or no published grades available for calculation.</AlertDescription></Alert>}
              </div>
              {semesterGpaStats && (
                <div className="pt-3 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground">Cumulative GPA (CGPA)</h3>
                    <p className={`text-2xl font-bold ${getGpaAlertInfo(cumulativeGpaStats.gpa)?.variant === 'destructive' ? 'text-destructive' : getGpaAlertInfo(cumulativeGpaStats.gpa)?.variant === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>{cumulativeGpaStats.gpa.toFixed(2)}</p>
                     {getGpaAlertInfo(cumulativeGpaStats.gpa) && (
                        <Alert variant={getGpaAlertInfo(cumulativeGpaStats.gpa)?.variant  === "success" ? "default" : getGpaAlertInfo(cumulativeGpaStats.gpa)?.variant } className="mt-1">
                            {getGpaAlertInfo(cumulativeGpaStats.gpa)?.icon}
                            <AlertTitle>{getGpaAlertInfo(cumulativeGpaStats.gpa)?.title} (Overall)</AlertTitle>
                        </Alert>
                    )}
                </div>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    GPA calculations exclude courses with pending results or 'NG' grades.
                </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {selectedGradeForDetails && (
        <Dialog open={!!selectedGradeForDetails} onOpenChange={(isOpen) => !isOpen && setSelectedGradeForDetails(null)}>
          <DialogContent className="sm:max-w-md">
            <Suspense fallback={<div className="p-6 text-center">Loading details...</div>}>
              <GradeDetailDialogContent selectedGrade={selectedGradeForDetails} />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}

