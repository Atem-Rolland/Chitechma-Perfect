
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Grade } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Info, LineChart as LineChartIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

// Mock data fetching function - adapted from ViewGradesPage
async function fetchMockGrades(studentId: string): Promise<Grade[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockRawScores: { 
    studentId: string, courseId: string, courseCode: string, courseName: string, credits: number, 
    caDetails: { assignments: number, groupWork: number, attendance: number, writtenCA: number, totalCaScore: number }, 
    examScore: number, academicYear: string, semester: string 
  }[] = [
    // 2023/2024 - First Semester
    { studentId, courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms", credits: 3, caDetails: { assignments: 5, groupWork: 4, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 58, academicYear: "2023/2024", semester: "First Semester" }, // 85 (A)
    { studentId, courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I", credits: 4, caDetails: { assignments: 4, groupWork: 3, attendance: 4, writtenCA: 12, totalCaScore: 23 }, examScore: 55, academicYear: "2023/2024", semester: "First Semester" }, // 78 (B+)
    { studentId, courseId: "PHY205", courseCode: "PHY205", courseName: "General Physics I", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 5, writtenCA: 10, totalCaScore: 22 }, examScore: 46, academicYear: "2023/2024", semester: "First Semester" }, // 68 (C+)

    // 2023/2024 - Second Semester
    { studentId, courseId: "CSE302", courseCode: "CSE302", courseName: "Database Systems", credits: 3, caDetails: { assignments: 5, groupWork: 5, attendance: 5, writtenCA: 15, totalCaScore: 30 }, examScore: 62, academicYear: "2023/2024", semester: "Second Semester" }, // 92 (A+)
    { studentId, courseId: "ENG202", courseCode: "ENG202", courseName: "Communication Skills II", credits: 2, caDetails: { assignments: 3, groupWork: 3, attendance: 4, writtenCA: 11, totalCaScore: 21 }, examScore: 51, academicYear: "2023/2024", semester: "Second Semester" }, // 72 (B)
    { studentId, courseId: "CSE308", courseCode: "CSE308", courseName: "Operating Systems", credits: 3, caDetails: { assignments: 2, groupWork: 3, attendance: 3, writtenCA: 8, totalCaScore: 16 }, examScore: 42, academicYear: "2023/2024", semester: "Second Semester" }, // 58 (D+) => GPA 0

    // 2024/2025 - First Semester
    { studentId, courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development", credits: 3, caDetails: { assignments: 4, groupWork: 4, attendance: 5, writtenCA: 14, totalCaScore: 27 }, examScore: 61, academicYear: "2024/2025", semester: "First Semester" }, // 88 (A)
    { studentId, courseId: "CSE409", courseCode: "CSE409", courseName: "Software Development and OOP", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 4, writtenCA: 11, totalCaScore: 22 }, examScore: 50, academicYear: "2024/2025", semester: "First Semester" }, // 72 (B)
    { studentId, courseId: "MGT403", courseCode: "MGT403", courseName: "Research Methodology", credits: 3, caDetails: { assignments: 4, groupWork: 5, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 54, academicYear: "2024/2025", semester: "First Semester" }, // 81 (A)
    { studentId, courseId: "CSE405", courseCode: "CSE405", courseName: "Embedded Systems", credits: 3, caDetails: { assignments: 3, groupWork: 3, attendance: 3, writtenCA: 9, totalCaScore: 18 }, examScore: 44, academicYear: "2024/2025", semester: "First Semester" }, // 62 (C)
    { studentId, courseId: "NES403", courseCode: "NES403", courseName: "Modeling in Information System", credits: 3, caDetails: { assignments: 1, groupWork: 2, attendance: 2, writtenCA: 5, totalCaScore: 10 }, examScore: 35, academicYear: "2024/2025", semester: "First Semester" }, // 45 (F) => GPA 0
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
      isPass: gradePoint >= 2.0, // C or better
    };
  });
}

interface SemesterGpaData {
  semesterLabel: string;
  academicYear: string;
  semester: string;
  sgpa: number;
  cgpa: number;
  creditsAttempted: number;
  creditsEarned: number;
}

const chartConfig = {
  sgpa: {
    label: "SGPA",
    color: "hsl(var(--chart-1))", // Use theme colors
  },
  cgpa: {
    label: "CGPA",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function GpaAnalyticsPage() {
  const { user } = useAuth();
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

  const gpaData = useMemo((): SemesterGpaData[] => {
    if (allGrades.length === 0) return [];

    const semesterOrder = { "First Semester": 1, "Second Semester": 2, "Resit Semester": 3 };

    // Group grades by academic year and then by semester
    const groupedGrades: Record<string, Record<string, Grade[]>> = {};
    allGrades.forEach(grade => {
      if (!groupedGrades[grade.academicYear]) {
        groupedGrades[grade.academicYear] = {};
      }
      if (!groupedGrades[grade.academicYear][grade.semester]) {
        groupedGrades[grade.academicYear][grade.semester] = [];
      }
      groupedGrades[grade.academicYear][grade.semester].push(grade);
    });

    const sortedYears = Object.keys(groupedGrades).sort();
    
    const processedData: SemesterGpaData[] = [];
    let cumulativeQualityPoints = 0;
    let cumulativeCreditsAttempted = 0;
    let cumulativeCreditsEarned = 0;

    sortedYears.forEach(year => {
      const sortedSemestersInYear = Object.keys(groupedGrades[year]).sort(
        (a, b) => (semesterOrder[a as keyof typeof semesterOrder] || 99) - (semesterOrder[b as keyof typeof semesterOrder] || 99)
      );

      sortedSemestersInYear.forEach(semester => {
        const semesterGrades = groupedGrades[year][semester];
        if (semesterGrades.length === 0) return;

        const semesterQualityPoints = semesterGrades.reduce((sum, grade) => sum + (grade.gradePoint * grade.credits), 0);
        const semesterCreditsAttempted = semesterGrades.reduce((sum, grade) => sum + grade.credits, 0);
        const semesterCreditsEarned = semesterGrades.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
        
        const sgpa = semesterCreditsAttempted > 0 ? parseFloat((semesterQualityPoints / semesterCreditsAttempted).toFixed(2)) : 0;
        
        cumulativeQualityPoints += semesterQualityPoints;
        cumulativeCreditsAttempted += semesterCreditsAttempted;
        cumulativeCreditsEarned += semesterCreditsEarned;
        
        const cgpa = cumulativeCreditsAttempted > 0 ? parseFloat((cumulativeQualityPoints / cumulativeCreditsAttempted).toFixed(2)) : 0;

        processedData.push({
          semesterLabel: `${year} - ${semester.substring(0,1)}${semesterOrder[semester as keyof typeof semesterOrder]}`, // e.g., 2023/2024 - S1
          academicYear: year,
          semester: semester,
          sgpa,
          cgpa,
          creditsAttempted: semesterCreditsAttempted,
          creditsEarned: semesterCreditsEarned,
        });
      });
    });
    return processedData;
  }, [allGrades]);

  const overallCgpa = useMemo(() => {
    if (gpaData.length === 0) return 0;
    return gpaData[gpaData.length - 1].cgpa;
  }, [gpaData]);

  const totalCreditsAttempted = useMemo(() => {
    return allGrades.reduce((sum, grade) => sum + grade.credits, 0);
  }, [allGrades]);

  const totalCreditsEarned = useMemo(() => {
    return allGrades.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
  }, [allGrades]);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-1.5">
          <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            GPA Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your academic performance and GPA trends over time.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (!user) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please log in to view GPA analytics.</CardDescription>
        </CardHeader>
      </Card>
     );
  }

  if (allGrades.length === 0 && !isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="space-y-1.5 mb-6">
            <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                GPA Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
                Track your academic performance and GPA trends over time.
            </p>
        </header>
        <Card>
          <CardContent className="pt-6 text-center">
            <Image src="https://placehold.co/400x300.png" alt="No data" width={300} height={225} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state analytics" />
            <h3 className="text-xl font-semibold">No Grade Data Available</h3>
            <p className="text-muted-foreground mt-1">
              There is no grade information to analyze yet. Your GPA trends will appear here once grades are recorded.
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
          <BarChart3 className="h-8 w-8 text-primary" />
          GPA Analytics
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your academic performance and GPA trends over time.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall CGPA</CardDescription>
            <CardTitle className="text-4xl">{overallCgpa.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground">
                {overallCgpa >= 3.5 ? <TrendingUp className="inline mr-1 h-4 w-4 text-green-500"/> : overallCgpa < 2.0 ? <TrendingDown className="inline mr-1 h-4 w-4 text-destructive"/> : <Info className="inline mr-1 h-4 w-4 text-blue-500"/>}
                Based on all recorded semesters.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits Attempted</CardDescription>
            <CardTitle className="text-4xl">{totalCreditsAttempted}</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-xs text-muted-foreground">Across all semesters.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits Earned</CardDescription>
            <CardTitle className="text-4xl">{totalCreditsEarned}</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-xs text-muted-foreground">Courses with a pass grade (C or better).</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChartIcon className="text-primary"/>GPA Trend (SGPA vs CGPA)</CardTitle>
          <CardDescription>Semester GPA (SGPA) and Cumulative GPA (CGPA) over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {gpaData.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gpaData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: -10, // Adjust to make Y-axis labels visible
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="semesterLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    angle={-30}
                    textAnchor="end"
                    height={50} // Adjust height to accommodate angled labels
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    domain={[0, 4]} 
                    ticks={[0, 1, 2, 3, 4]} 
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="sgpa"
                    type="monotone"
                    stroke="var(--color-sgpa)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-sgpa)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="cgpa"
                    type="monotone"
                    stroke="var(--color-cgpa)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-cgpa)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Legend content={<ChartLegendContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground">Not enough data to display GPA trends.</p>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                This chart visualizes your academic progress. Contact your academic advisor for detailed guidance.
            </p>
         </CardFooter>
      </Card>

      {/* Placeholder for other potential charts like credits per semester */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Credits per Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bar chart for credits attempted vs. earned per semester coming soon.</p>
        </CardContent>
      </Card>
      */}
    </motion.div>
  );
}
