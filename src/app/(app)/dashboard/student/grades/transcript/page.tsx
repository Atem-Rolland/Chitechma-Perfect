
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadCloud, BookCheck, BarChart3 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Grade, CaDetails } from "@/types";

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

// Adapted mock data fetching function from ViewGradesPage
async function fetchMockGrades(studentId: string): Promise<Grade[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockRawScores: { 
    studentId: string, courseId: string, courseCode: string, courseName: string, credits: number, 
    caDetails: CaDetails, 
    examScore: number, academicYear: string, semester: string 
  }[] = [
    // 2023/2024 - First Semester
    { studentId, courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms", credits: 3, caDetails: { assignments: 5, groupWork: 4, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 58, academicYear: "2023/2024", semester: "First Semester" },
    { studentId, courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I", credits: 4, caDetails: { assignments: 4, groupWork: 3, attendance: 4, writtenCA: 12, totalCaScore: 23 }, examScore: 55, academicYear: "2023/2024", semester: "First Semester" },
    { studentId, courseId: "PHY205", courseCode: "PHY205", courseName: "General Physics I", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 5, writtenCA: 10, totalCaScore: 22 }, examScore: 46, academicYear: "2023/2024", semester: "First Semester" },

    // 2023/2024 - Second Semester
    { studentId, courseId: "CSE302", courseCode: "CSE302", courseName: "Database Systems", credits: 3, caDetails: { assignments: 5, groupWork: 5, attendance: 5, writtenCA: 15, totalCaScore: 30 }, examScore: 62, academicYear: "2023/2024", semester: "Second Semester" },
    { studentId, courseId: "ENG202", courseCode: "ENG202", courseName: "Communication Skills II", credits: 2, caDetails: { assignments: 3, groupWork: 3, attendance: 4, writtenCA: 11, totalCaScore: 21 }, examScore: 51, academicYear: "2023/2024", semester: "Second Semester" },
    { studentId, courseId: "CSE308", courseCode: "CSE308", courseName: "Operating Systems", credits: 3, caDetails: { assignments: 2, groupWork: 3, attendance: 3, writtenCA: 8, totalCaScore: 16 }, examScore: 42, academicYear: "2023/2024", semester: "Second Semester" },

    // 2024/2025 - First Semester
    { studentId, courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development", credits: 3, caDetails: { assignments: 4, groupWork: 4, attendance: 5, writtenCA: 14, totalCaScore: 27 }, examScore: 61, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "CSE409", courseCode: "CSE409", courseName: "Software Development and OOP", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 4, writtenCA: 11, totalCaScore: 22 }, examScore: 50, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "MGT403", courseCode: "MGT403", courseName: "Research Methodology", credits: 3, caDetails: { assignments: 4, groupWork: 5, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 54, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "CSE405", courseCode: "CSE405", courseName: "Embedded Systems", credits: 3, caDetails: { assignments: 3, groupWork: 3, attendance: 3, writtenCA: 9, totalCaScore: 18 }, examScore: 44, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "NES403", courseCode: "NES403", courseName: "Modeling in Information System", credits: 3, caDetails: { assignments: 1, groupWork: 2, attendance: 2, writtenCA: 5, totalCaScore: 10 }, examScore: 35, academicYear: "2024/2025", semester: "First Semester" },
  ];

  return mockRawScores.map((gradeData, index) => {
    const totalScore = (gradeData.caDetails?.totalCaScore || 0) + (gradeData.examScore || 0);
    const gradeLetter = getGradeLetterFromScore(totalScore);
    const gradePoint = GRADE_POINTS[gradeLetter] !== undefined ? GRADE_POINTS[gradeLetter] : 0.0;
    return {
      id: `G${String(index + 1).padStart(3, '0')}`,
      studentId: studentId,
      courseId: gradeData.courseId,
      courseCode: gradeData.courseCode,
      courseName: gradeData.courseName,
      credits: gradeData.credits,
      score: totalScore,
      gradeLetter: gradeLetter,
      gradePoint: gradePoint,
      academicYear: gradeData.academicYear,
      semester: gradeData.semester,
      caDetails: gradeData.caDetails,
      examScore: gradeData.examScore,
      isPass: gradePoint >= 2.0, 
    };
  });
}

interface GroupedGrades {
  [academicYear: string]: {
    [semester: string]: Grade[];
  };
}

export default function TranscriptPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedGrades = await fetchMockGrades(user.uid);
      setAllGrades(fetchedGrades);
      setIsLoading(false);
    }
    loadGrades();
  }, [user?.uid]);

  const groupedGrades = useMemo((): GroupedGrades => {
    const semesterOrder = { "First Semester": 1, "Second Semester": 2, "Resit Semester": 3 };
    const groups: GroupedGrades = {};
    
    const sortedGrades = [...allGrades].sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return a.academicYear.localeCompare(b.academicYear);
      }
      return (semesterOrder[a.semester as keyof typeof semesterOrder] || 99) - (semesterOrder[b.semester as keyof typeof semesterOrder] || 99);
    });

    sortedGrades.forEach(grade => {
      if (!groups[grade.academicYear]) {
        groups[grade.academicYear] = {};
      }
      if (!groups[grade.academicYear][grade.semester]) {
        groups[grade.academicYear][grade.semester] = [];
      }
      groups[grade.academicYear][grade.semester].push(grade);
    });
    return groups;
  }, [allGrades]);

  const calculateGpa = (gradesList: Grade[]): { gpa: number; totalCreditsAttempted: number; totalCreditsEarned: number; totalQualityPoints: number } => {
    if (!gradesList || gradesList.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, totalQualityPoints: 0 };
    
    const gradedCourses = gradesList.filter(grade => grade.gradeLetter && grade.gradeLetter !== "NG" && grade.gradePoint !== undefined);
    if (gradedCourses.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, totalQualityPoints: 0 };

    const totalQualityPoints = gradedCourses.reduce((sum, grade) => sum + (grade.gradePoint * grade.credits), 0);
    const totalCreditsAttempted = gradedCourses.reduce((sum, grade) => sum + grade.credits, 0);
    const totalCreditsEarned = gradedCourses.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
    
    const gpa = totalCreditsAttempted > 0 ? parseFloat((totalQualityPoints / totalCreditsAttempted).toFixed(2)) : 0;
    return { gpa, totalCreditsAttempted, totalCreditsEarned, totalQualityPoints };
  };
  
  const overallGpaStats = useMemo(() => calculateGpa(allGrades), [allGrades]);

  const handleDownloadTranscript = () => {
    toast({
      title: "Transcript Download (Simulated)",
      description: "Your academic transcript PDF generation is in progress. This is a simulated action.",
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-1.5">
           <Skeleton className="h-8 w-1/2" />
           <Skeleton className="h-5 w-3/4" />
        </header>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please log in to view your transcript.</CardDescription>
        </CardHeader>
      </Card>
     );
  }

  if (allGrades.length === 0 && !isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="space-y-1.5 mb-6">
            <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
                <DownloadCloud className="h-8 w-8 text-primary" />
                Academic Transcript
            </h1>
            <p className="text-muted-foreground text-lg">
                View and download your official academic record.
            </p>
        </header>
        <Card>
          <CardContent className="pt-6 text-center">
            <Image src="https://placehold.co/400x300.png" alt="No data" width={300} height={225} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state document"/>
            <h3 className="text-xl font-semibold">No Grade Data Available</h3>
            <p className="text-muted-foreground mt-1">
              There is no grade information to display on your transcript yet.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
          <DownloadCloud className="h-8 w-8 text-primary" />
          Academic Transcript
        </h1>
        <p className="text-muted-foreground text-lg">
          Official record of your academic performance.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>
                This information appears on your official transcript.
            </CardDescription>
          </div>
          <Button onClick={handleDownloadTranscript}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download Transcript (PDF)
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm border-t pt-6">
            <p><strong>Student Name:</strong> {profile?.displayName || "N/A"}</p>
            <p><strong>Student ID/Matricule:</strong> {(profile as any)?.matricule || "CUSMS/S00123"}</p> {/* Assume matricule is in profile or mock */}
            <p><strong>Program:</strong> {profile?.program || "B.Eng. Computer Engineering and System Maintenance"}</p>
            <p><strong>Department:</strong> {profile?.department || "Department of computer engineering and system maintenance"}</p>
        </CardContent>
      </Card>


      {Object.keys(groupedGrades).map(year => (
        <Card key={year}>
          <CardHeader>
            <CardTitle className="text-xl">Academic Year: {year}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(groupedGrades[year]).map(semester => {
              const semesterGrades = groupedGrades[year][semester];
              const semesterGpaStats = calculateGpa(semesterGrades);
              return (
                <div key={semester}>
                  <h3 className="font-semibold text-lg mb-2 text-primary">{semester}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {semesterGrades.map(grade => (
                        <TableRow key={grade.id} className={!grade.isPass ? "bg-destructive/10 dark:bg-destructive/20" : ""}>
                          <TableCell className="font-medium">{grade.courseCode}</TableCell>
                          <TableCell>{grade.courseName}</TableCell>
                          <TableCell className="text-center">{grade.credits}</TableCell>
                          <TableCell className="text-center">{grade.score}</TableCell>
                          <TableCell className={`text-center font-semibold ${!grade.isPass ? "text-destructive" : ""}`}>{grade.gradeLetter}</TableCell>
                          <TableCell className="text-center">{(grade.gradePoint * grade.credits).toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm flex flex-wrap justify-between items-center gap-2">
                    <div>
                        <strong>SGPA: {semesterGpaStats.gpa.toFixed(2)}</strong>
                    </div>
                    <div>Credits Attempted: {semesterGpaStats.totalCreditsAttempted}</div>
                    <div>Credits Earned: {semesterGpaStats.totalCreditsEarned}</div>
                    <div>Quality Points: {semesterGpaStats.totalQualityPoints.toFixed(1)}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="text-primary"/>Overall Academic Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Cumulative GPA (CGPA)</p>
                <p className="text-3xl font-bold text-primary">{overallGpaStats.gpa.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Total Credits Attempted</p>
                <p className="text-3xl font-bold">{overallGpaStats.totalCreditsAttempted}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Total Credits Earned</p>
                <p className="text-3xl font-bold">{overallGpaStats.totalCreditsEarned}</p>
            </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This is an unofficial transcript. Official transcripts can be requested from the university administration.
                Pass mark is 'C' (2.0 GPA points).
            </p>
        </CardFooter>
      </Card>

    </motion.div>
  );
}

    
