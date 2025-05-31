
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Grade } from "@/types";
import { BookCheck, CalendarDays, BookOpen as SemesterIcon, BarChart3, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

// Simplified Grade Point mapping (Example)
const GRADE_POINTS: Record<string, number> = {
  "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0,
  "F": 0.0,
};

// Mock data fetching function
async function fetchMockGrades(studentId: string): Promise<Grade[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, studentId would be used to fetch specific student's grades
  const mockGrades: Grade[] = [
    // 2023/2024 - First Semester
    { id: "G001", studentId, courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms", credits: 3, score: 85, gradeLetter: "A", gradePoint: GRADE_POINTS["A"], academicYear: "2023/2024", semester: "First Semester" },
    { id: "G002", studentId, courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I", credits: 4, score: 78, gradeLetter: "B+", gradePoint: GRADE_POINTS["B+"], academicYear: "2023/2024", semester: "First Semester" },
    { id: "G003", studentId, courseId: "PHY205", courseCode: "PHY205", courseName: "General Physics I", credits: 3, score: 68, gradeLetter: "C+", gradePoint: GRADE_POINTS["C+"], academicYear: "2023/2024", semester: "First Semester" },

    // 2023/2024 - Second Semester
    { id: "G004", studentId, courseId: "CSE302", courseCode: "CSE302", courseName: "Database Systems", credits: 3, score: 92, gradeLetter: "A", gradePoint: GRADE_POINTS["A"], academicYear: "2023/2024", semester: "Second Semester" },
    { id: "G005", studentId, courseId: "ENG202", courseCode: "ENG202", courseName: "Communication Skills II", credits: 2, score: 75, gradeLetter: "B", gradePoint: GRADE_POINTS["B"], academicYear: "2023/2024", semester: "Second Semester" },
    
    // 2024/2025 - First Semester
    { id: "G006", studentId, courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development", credits: 3, score: 88, gradeLetter: "A", gradePoint: GRADE_POINTS["A"], academicYear: "2024/2025", semester: "First Semester" },
    { id: "G007", studentId, courseId: "CSE409", courseCode: "CSE409", courseName: "Software Development and OOP", credits: 3, score: 72, gradeLetter: "B-", gradePoint: GRADE_POINTS["B-"], academicYear: "2024/2025", semester: "First Semester" },
    { id: "G008", studentId, courseId: "MGT403", courseCode: "MGT403", courseName: "Research Methodology", credits: 3, score: 81, gradeLetter: "A-", gradePoint: GRADE_POINTS["A-"], academicYear: "2024/2025", semester: "First Semester" },
    { id: "G009", studentId, courseId: "CSE405", courseCode: "CSE405", courseName: "Embedded Systems", credits: 3, score: 65, gradeLetter: "C", gradePoint: GRADE_POINTS["C"], academicYear: "2024/2025", semester: "First Semester" },
    
    // Example for a course not yet graded or in progress for the current semester
    // { id: "G010", studentId, courseId: "NES403", courseCode: "NES403", courseName: "Modeling in Information System", credits: 3, score: 0, gradeLetter: "NG", gradePoint: 0, academicYear: "2024/2025", semester: "First Semester" },
  ];
  return mockGrades;
}

export default function ViewGradesPage() {
  const { user } = useAuth();
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: "2024/2025", // Default to a recent year
    semester: "First Semester",  // Default to a recent semester
  });

  const academicYears = useMemo(() => {
    const years = new Set(allGrades.map(grade => grade.academicYear));
    return ["all", ...Array.from(years).sort((a, b) => b.localeCompare(a))]; // Sort descending
  }, [allGrades]);

  const semesters = useMemo(() => {
    const semSet = new Set(allGrades.map(grade => grade.semester));
    return ["all", ...Array.from(semSet)];
  }, [allGrades]);

  useEffect(() => {
    async function loadGrades() {
      if (!user?.uid) {
        setIsLoading(false); // Stop loading if no user
        return;
      }
      setIsLoading(true);
      const fetchedGrades = await fetchMockGrades(user.uid); // Pass studentId
      setAllGrades(fetchedGrades);

      // Set initial filters to the most recent available if data exists
      if (fetchedGrades.length > 0) {
        const latestYear = fetchedGrades.reduce((latest, grade) => grade.academicYear > latest ? grade.academicYear : latest, "");
        const gradesInLatestYear = fetchedGrades.filter(g => g.academicYear === latestYear);
        const latestSemester = gradesInLatestYear.reduce((latest, grade) => {
            // Simple semester preference: First > Second > Resit
            const order = {"First Semester": 3, "Second Semester": 2, "Resit Semester": 1};
            return (order[grade.semester as keyof typeof order] || 0) > (order[latest as keyof typeof order] || 0) ? grade.semester : latest;
        }, "");
        
        if (latestYear && latestSemester) {
             setFilters({ academicYear: latestYear, semester: latestSemester });
        } else if (latestYear) {
             setFilters({ academicYear: latestYear, semester: "all" });
        }
      }
      setIsLoading(false);
    }
    loadGrades();
  }, [user?.uid]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredGrades = useMemo(() => {
    return allGrades.filter(grade => 
      (filters.academicYear === "all" || grade.academicYear === filters.academicYear) &&
      (filters.semester === "all" || grade.semester === filters.semester)
    );
  }, [allGrades, filters]);

  const calculateGpa = (gradesList: Grade[]): number => {
    if (!gradesList || gradesList.length === 0) return 0;
    const totalQualityPoints = gradesList.reduce((sum, grade) => sum + (grade.gradePoint * grade.credits), 0);
    const totalCreditsAttempted = gradesList.reduce((sum, grade) => sum + grade.credits, 0);
    return totalCreditsAttempted > 0 ? parseFloat((totalQualityPoints / totalCreditsAttempted).toFixed(2)) : 0;
  };

  const semesterGpa = useMemo(() => {
    if (filters.academicYear === "all" || filters.semester === "all") return null;
    const currentSemesterGrades = allGrades.filter(
      grade => grade.academicYear === filters.academicYear && grade.semester === filters.semester
    );
    return calculateGpa(currentSemesterGrades);
  }, [allGrades, filters]);

  const cumulativeGpa = useMemo(() => calculateGpa(allGrades), [allGrades]);

  const getGpaAlert = (gpa: number | null) => {
    if (gpa === null) return null;
    if (gpa >= 3.5) return { variant: "success", title: "Excellent Standing", icon: <TrendingUp className="h-5 w-5 text-green-500" /> };
    if (gpa >= 2.5) return { variant: "default", title: "Good Standing", icon: <CheckCircle className="h-5 w-5 text-primary" /> };
    if (gpa >= 2.0) return { variant: "warning", title: "Academic Probation Watch", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> };
    return { variant: "destructive", title: "Academic Warning", icon: <TrendingDown className="h-5 w-5 text-destructive" /> };
  };

  const semesterGpaAlert = getGpaAlert(semesterGpa);
  const cumulativeGpaAlert = getGpaAlert(cumulativeGpa);


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
          View your grades by academic year and semester.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filter Grades</CardTitle>
          <CardDescription>Select academic year and semester to view specific results.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}>
            <SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />Academic Year</SelectTrigger>
            <SelectContent>
              {academicYears.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><SemesterIcon className="mr-2 h-4 w-4 text-muted-foreground" />Semester</SelectTrigger>
            <SelectContent>
              {semesters.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}
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
                    ? "Showing all recorded grades."
                    : `Showing grades for ${filters.semester}, ${filters.academicYear}.`}
                </CardDescription>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : filteredGrades.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Score (/100)</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Grade Point</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGrades.map(grade => (
                        <TableRow key={grade.id}>
                            <TableCell className="font-medium">{grade.courseCode}</TableCell>
                            <TableCell>{grade.courseName}</TableCell>
                            <TableCell className="text-center">{grade.credits}</TableCell>
                            <TableCell className="text-center">{grade.score !== null ? grade.score : "NG"}</TableCell>
                            <TableCell className="text-center font-semibold">{grade.gradeLetter}</TableCell>
                            <TableCell className="text-center">{grade.gradePoint.toFixed(1)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-10">
                    <Image src="https://placehold.co/300x200.png" alt="No grades found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education"/>
                    <h3 className="text-xl font-semibold">No Grades Found</h3>
                    <p className="text-muted-foreground mt-1">
                        No grades available for the selected academic period. Please check back later or adjust your filters.
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
                  {filters.academicYear === "all" || filters.semester === "all" 
                    ? "Cumulative GPA (CGPA)" 
                    : `Semester GPA (SGPA) - ${filters.semester}, ${filters.academicYear}`}
                </h3>
                <p className={`text-3xl font-bold ${semesterGpaAlert?.variant === 'destructive' ? 'text-destructive' : semesterGpaAlert?.variant === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>
                  {semesterGpa !== null ? semesterGpa.toFixed(2) : cumulativeGpa.toFixed(2)}
                </p>
                {semesterGpa !== null && semesterGpaAlert && (
                  <Alert variant={semesterGpaAlert.variant === "success" ? "default" : semesterGpaAlert.variant} className="mt-2">
                    {semesterGpaAlert.icon}
                    <AlertTitle>{semesterGpaAlert.title}</AlertTitle>
                  </Alert>
                )}
                 {semesterGpa === null && cumulativeGpaAlert && (
                   <Alert variant={cumulativeGpaAlert.variant === "success" ? "default" : cumulativeGpaAlert.variant} className="mt-2">
                    {cumulativeGpaAlert.icon}
                    <AlertTitle>{cumulativeGpaAlert.title} (Overall)</AlertTitle>
                  </Alert>
                )}
              </div>
              {semesterGpa !== null && ( // Show CGPA separately if a specific semester is selected
                <div className="pt-3 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground">Cumulative GPA (CGPA)</h3>
                    <p className={`text-2xl font-bold ${cumulativeGpaAlert?.variant === 'destructive' ? 'text-destructive' : cumulativeGpaAlert?.variant === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>{cumulativeGpa.toFixed(2)}</p>
                     {cumulativeGpaAlert && (
                        <Alert variant={cumulativeGpaAlert.variant === "success" ? "default" : cumulativeGpaAlert.variant} className="mt-1">
                            {cumulativeGpaAlert.icon}
                            <AlertTitle>{cumulativeGpaAlert.title} (Overall)</AlertTitle>
                        </Alert>
                    )}
                </div>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    GPA calculations are based on the CHITECHMA University grading scale. Contact administration for discrepancies.
                </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
