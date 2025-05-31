
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Grade, CaDetails } from "@/types";
import { BookCheck, CalendarDays, BookOpen as SemesterIcon, BarChart3, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, 
  "B+": 3.5, "B": 3.0, 
  "C+": 2.5, "C": 2.0, 
  "D+": 0.0, "D": 0.0, "F": 0.0,   
};

function getGradeLetterFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "C+";
  if (score >= 60) return "C"; 
  if (score >= 55) return "D+"; 
  if (score >= 50) return "D";  
  return "F"; 
}

// Mock data fetching function
async function fetchMockGrades(studentId: string): Promise<Grade[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockRawScores: { 
    studentId: string, courseId: string, courseCode: string, courseName: string, credits: number, 
    caDetails: CaDetails, examScore: number, academicYear: string, semester: string 
  }[] = [
    // 2023/2024 - First Semester
    { studentId, courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms", credits: 3, caDetails: { assignments: 5, groupWork: 4, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 58, academicYear: "2023/2024", semester: "First Semester" }, // 27+58 = 85 (A)
    { studentId, courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I", credits: 4, caDetails: { assignments: 4, groupWork: 3, attendance: 4, writtenCA: 12, totalCaScore: 23 }, examScore: 55, academicYear: "2023/2024", semester: "First Semester" }, // 23+55 = 78 (B+)
    { studentId, courseId: "PHY205", courseCode: "PHY205", courseName: "General Physics I", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 5, writtenCA: 10, totalCaScore: 22 }, examScore: 46, academicYear: "2023/2024", semester: "First Semester" }, // 22+46 = 68 (C+)

    // 2023/2024 - Second Semester
    { studentId, courseId: "CSE302", courseCode: "CSE302", courseName: "Database Systems", credits: 3, caDetails: { assignments: 5, groupWork: 5, attendance: 5, writtenCA: 15, totalCaScore: 30 }, examScore: 62, academicYear: "2023/2024", semester: "Second Semester" }, // 30+62 = 92 (A+)
    { studentId, courseId: "ENG202", courseCode: "ENG202", courseName: "Communication Skills II", credits: 2, caDetails: { assignments: 3, groupWork: 3, attendance: 4, writtenCA: 11, totalCaScore: 21 }, examScore: 51, academicYear: "2023/2024", semester: "Second Semester" }, // 21+51 = 72 (B)
    { studentId, courseId: "CSE308", courseCode: "CSE308", courseName: "Operating Systems", credits: 3, caDetails: { assignments: 2, groupWork: 3, attendance: 3, writtenCA: 8, totalCaScore: 16 }, examScore: 42, academicYear: "2023/2024", semester: "Second Semester" }, // 16+42 = 58 (D+)

    // 2024/2025 - First Semester
    { studentId, courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development", credits: 3, caDetails: { assignments: 4, groupWork: 4, attendance: 5, writtenCA: 14, totalCaScore: 27 }, examScore: 61, academicYear: "2024/2025", semester: "First Semester" }, // 27+61 = 88 (A)
    { studentId, courseId: "CSE409", courseCode: "CSE409", courseName: "Software Development and OOP", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 4, writtenCA: 11, totalCaScore: 22 }, examScore: 50, academicYear: "2024/2025", semester: "First Semester" }, // 22+50 = 72 (B)
    { studentId, courseId: "MGT403", courseCode: "MGT403", courseName: "Research Methodology", credits: 3, caDetails: { assignments: 4, groupWork: 5, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 54, academicYear: "2024/2025", semester: "First Semester" }, // 27+54 = 81 (A)
    { studentId, courseId: "CSE405", courseCode: "CSE405", courseName: "Embedded Systems", credits: 3, caDetails: { assignments: 3, groupWork: 3, attendance: 3, writtenCA: 9, totalCaScore: 18 }, examScore: 44, academicYear: "2024/2025", semester: "First Semester" }, // 18+44 = 62 (C)
    { studentId, courseId: "NES403", courseCode: "NES403", courseName: "Modeling in Information System", credits: 3, caDetails: { assignments: 1, groupWork: 2, attendance: 2, writtenCA: 5, totalCaScore: 10 }, examScore: 35, academicYear: "2024/2025", semester: "First Semester" }, // 10+35 = 45 (F)
  ];

  return mockRawScores.map((gradeData, index) => {
    const totalScore = (gradeData.caDetails?.totalCaScore || 0) + (gradeData.examScore || 0);
    const gradeLetter = getGradeLetterFromScore(totalScore);
    return {
      id: `G${String(index + 1).padStart(3, '0')}`,
      studentId: studentId,
      courseId: gradeData.courseId,
      courseCode: gradeData.courseCode,
      courseName: gradeData.courseName,
      credits: gradeData.credits,
      score: totalScore,
      gradeLetter: gradeLetter,
      gradePoint: GRADE_POINTS[gradeLetter] !== undefined ? GRADE_POINTS[gradeLetter] : 0.0,
      academicYear: gradeData.academicYear,
      semester: gradeData.semester,
      caDetails: gradeData.caDetails,
      examScore: gradeData.examScore,
    };
  });
}

export default function ViewGradesPage() {
  const { user } = useAuth();
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: "2024/2025", 
    semester: "First Semester",  
  });
  const [selectedGradeForDetails, setSelectedGradeForDetails] = useState<Grade | null>(null);

  const academicYears = useMemo(() => {
    const years = new Set(allGrades.map(grade => grade.academicYear));
    return ["all", ...Array.from(years).sort((a, b) => b.localeCompare(a))]; 
  }, [allGrades]);

  const semesters = useMemo(() => {
    const semSet = new Set(allGrades.map(grade => grade.semester));
    return ["all", "First Semester", "Second Semester", "Resit Semester"].filter(s => s === "all" || semSet.has(s)); // Ensure order and availability
  }, [allGrades]);

  useEffect(() => {
    async function loadGrades() {
      if (!user?.uid) {
        setIsLoading(false); 
        return;
      }
      setIsLoading(true);
      const fetchedGrades = await fetchMockGrades(user.uid); 
      setAllGrades(fetchedGrades);

      if (fetchedGrades.length > 0) {
        const latestYear = fetchedGrades.reduce((latest, grade) => grade.academicYear > latest ? grade.academicYear : latest, "");
        const gradesInLatestYear = fetchedGrades.filter(g => g.academicYear === latestYear);
        const latestSemesterInYear = gradesInLatestYear.reduce((latest, grade) => {
            const order = {"First Semester": 3, "Second Semester": 2, "Resit Semester": 1}; // Higher number = more recent for sorting
            return (order[grade.semester as keyof typeof order] || 0) > (order[latest as keyof typeof order] || 0) ? grade.semester : latest;
        }, "");
        
        if (latestYear && latestSemesterInYear) {
             setFilters({ academicYear: latestYear, semester: latestSemesterInYear });
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
    const gradedCourses = gradesList.filter(grade => grade.gradeLetter && grade.gradeLetter !== "NG" && grade.gradePoint !== undefined);
    if (gradedCourses.length === 0) return 0;

    const totalQualityPoints = gradedCourses.reduce((sum, grade) => sum + (grade.gradePoint * grade.credits), 0);
    const totalCreditsAttempted = gradedCourses.reduce((sum, grade) => sum + grade.credits, 0);
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
    if (gpa >= 2.0) return { variant: "warning", title: "Satisfactory Standing", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> };
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
          View your grades by academic year and semester. Score (/100) includes CA and Exam marks.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filter Grades</CardTitle>
          <CardDescription>Select academic year and semester. A pass grade starts from 'C'.</CardDescription>
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
                        <TableHead className="text-center">Final Score (/100)</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGrades.map(grade => (
                        <TableRow key={grade.id} className={GRADE_POINTS[grade.gradeLetter] === 0.0 ? "bg-destructive/10 dark:bg-destructive/20" : ""}>
                            <TableCell className="font-medium">{grade.courseCode}</TableCell>
                            <TableCell>{grade.courseName}</TableCell>
                            <TableCell className="text-center">{grade.credits}</TableCell>
                            <TableCell className="text-center">{grade.score !== null ? grade.score : "NG"}</TableCell>
                            <TableCell className={`text-center font-semibold ${GRADE_POINTS[grade.gradeLetter] === 0.0 ? "text-destructive" : ""}`}>{grade.gradeLetter}</TableCell>
                            <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedGradeForDetails(grade)}>
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
                        No grades available for the selected academic period.
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
              {semesterGpa !== null && ( 
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
                    GPA calculations are based on the CHITECHMA University grading scale. 'C' is the minimum pass grade.
                </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {selectedGradeForDetails && (
        <Dialog open={!!selectedGradeForDetails} onOpenChange={(isOpen) => !isOpen && setSelectedGradeForDetails(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">{selectedGradeForDetails.courseCode} - {selectedGradeForDetails.courseName}</DialogTitle>
              <DialogDescription>
                Detailed score breakdown for {selectedGradeForDetails.semester}, {selectedGradeForDetails.academicYear}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <h4 className="font-semibold text-md text-primary border-b pb-1 mb-2">Continuous Assessment (CA) - Max 30</h4>
              {selectedGradeForDetails.caDetails ? (
                <>
                  <div className="flex justify-between"><span>Assignments:</span> <span>{selectedGradeForDetails.caDetails.assignments ?? 'N/A'} / 5</span></div>
                  <div className="flex justify-between"><span>Group Work:</span> <span>{selectedGradeForDetails.caDetails.groupWork ?? 'N/A'} / 5</span></div>
                  <div className="flex justify-between"><span>Attendance:</span> <span>{selectedGradeForDetails.caDetails.attendance ?? 'N/A'} / 5</span></div>
                  <div className="flex justify-between"><span>Written CA:</span> <span>{selectedGradeForDetails.caDetails.writtenCA ?? 'N/A'} / 15</span></div>
                  <div className="flex justify-between font-semibold pt-1 border-t mt-1"><span>Total CA Score:</span> <span>{selectedGradeForDetails.caDetails.totalCaScore ?? 'N/A'} / 30</span></div>
                </>
              ) : <p className="text-muted-foreground">No detailed CA marks available.</p>}
              
              <h4 className="font-semibold text-md text-primary border-b pb-1 mt-4 mb-2">Examination - Max 70</h4>
              <div className="flex justify-between"><span>Exam Score:</span> <span>{selectedGradeForDetails.examScore ?? 'N/A'} / 70</span></div>

              <div className="border-t pt-3 mt-3 space-y-1">
                <div className="flex justify-between text-md font-bold"><span className="text-foreground">Final Score:</span> <span>{selectedGradeForDetails.score} / 100</span></div>
                <div className="flex justify-between text-md font-bold"><span className="text-foreground">Grade Awarded:</span> <span className={GRADE_POINTS[selectedGradeForDetails.gradeLetter] === 0.0 ? "text-destructive" : "text-green-600"}>{selectedGradeForDetails.gradeLetter}</span></div>
              </div>
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
