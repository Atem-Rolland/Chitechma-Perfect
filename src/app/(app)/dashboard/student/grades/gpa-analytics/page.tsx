
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Grade, Course } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Info, LineChart as LineChartIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS, getGradeDetailsFromScore } from "@/config/data";


// Fetch mock courses to get course details like name and credits
async function fetchAllCoursesMockAnalytics(): Promise<Course[]> {
    // In a real app, this would fetch from your actual course data source
    // For now, using a simplified version of the mock data from courses/page.tsx
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
  
// Mock data fetching function - adapted from ViewGradesPage
async function fetchMockGradesForAnalytics(studentId: string, allCourses: Course[]): Promise<Grade[]> {
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
        const examScore = Math.floor(Math.random() * (period.level === 200 ? 30 : 40)) + (period.level === 200 ? 30 : 30);
        const finalScore = totalCaScore + examScore;
        const gradeDetails = getGradeDetailsFromScore(finalScore);
        const isPublished = Math.random() > 0.1; // Higher chance of being published for analytics
  
        grades.push({
          id: `G_Analytics_${String(gradeIdCounter++).padStart(3, '0')}`,
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
          caDetails: { totalCaScore }, 
          examScore: isPublished ? examScore : null,
          isPass: isPublished ? gradeDetails.isPass : false,
          isPublished: isPublished,
        });
      }
    }
    return grades;
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
    color: "hsl(var(--chart-1))", 
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
      const courses = await fetchAllCoursesMockAnalytics();
      const fetchedGrades = await fetchMockGradesForAnalytics(user.uid, courses);
      setAllGrades(fetchedGrades);
      setIsLoading(false);
    }
    loadGrades();
  }, [user?.uid]);

  const gpaData = useMemo((): SemesterGpaData[] => {
    const publishedGrades = allGrades.filter(g => g.isPublished && g.gradePoint !== null);
    if (publishedGrades.length === 0) return [];

    const semesterOrderMap = { "First Semester": 1, "Second Semester": 2, "Resit Semester": 3 };

    const groupedGrades: Record<string, Record<string, Grade[]>> = {};
    publishedGrades.forEach(grade => {
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
        (a, b) => (semesterOrderMap[a as keyof typeof semesterOrderMap] || 99) - (semesterOrderMap[b as keyof typeof semesterOrderMap] || 99)
      );

      sortedSemestersInYear.forEach(semester => {
        const semesterGrades = groupedGrades[year][semester];
        if (semesterGrades.length === 0) return;

        const semesterQualityPoints = semesterGrades.reduce((sum, grade) => sum + (grade.gradePoint! * grade.credits), 0);
        const semesterCreditsAttempted = semesterGrades.reduce((sum, grade) => sum + grade.credits, 0);
        const semesterCreditsEarned = semesterGrades.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
        
        const sgpa = semesterCreditsAttempted > 0 ? parseFloat((semesterQualityPoints / semesterCreditsAttempted).toFixed(2)) : 0;
        
        cumulativeQualityPoints += semesterQualityPoints;
        cumulativeCreditsAttempted += semesterCreditsAttempted;
        cumulativeCreditsEarned += semesterCreditsEarned;
        
        const cgpa = cumulativeCreditsAttempted > 0 ? parseFloat((cumulativeQualityPoints / cumulativeCreditsAttempted).toFixed(2)) : 0;

        processedData.push({
          semesterLabel: `${year.slice(2,4)}/${year.slice(7,9)}-${semester.substring(0,1)}${semesterOrderMap[semester as keyof typeof semesterOrderMap]}`, // e.g., 22/23-S1
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

  const totalCreditsAttemptedOverall = useMemo(() => {
    return allGrades.filter(g => g.isPublished).reduce((sum, grade) => sum + grade.credits, 0);
  }, [allGrades]);

  const totalCreditsEarnedOverall = useMemo(() => {
    return allGrades.filter(g => g.isPublished && g.isPass).reduce((sum, grade) => sum + grade.credits, 0);
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

  if (allGrades.filter(g => g.isPublished).length === 0 && !isLoading) {
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
            <h3 className="text-xl font-semibold">No Published Grade Data Available</h3>
            <p className="text-muted-foreground mt-1">
              There is no published grade information to analyze yet. Your GPA trends will appear here once grades are released.
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
          Track your academic performance and GPA trends over time. Calculations based on published results only.
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
                {overallCgpa >= 3.5 ? <TrendingUp className="inline mr-1 h-4 w-4 text-green-500"/> : overallCgpa < 2.0 && overallCgpa > 0 ? <TrendingDown className="inline mr-1 h-4 w-4 text-destructive"/> : <Info className="inline mr-1 h-4 w-4 text-blue-500"/>}
                Based on all published semesters.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits Attempted (Published)</CardDescription>
            <CardTitle className="text-4xl">{totalCreditsAttemptedOverall}</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-xs text-muted-foreground">Across all published results.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits Earned (Published)</CardDescription>
            <CardTitle className="text-4xl">{totalCreditsEarnedOverall}</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-xs text-muted-foreground">Courses with a pass grade (C or better).</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChartIcon className="text-primary"/>GPA Trend (SGPA vs CGPA)</CardTitle>
          <CardDescription>Semester GPA (SGPA) and Cumulative GPA (CGPA) over time for published results.</CardDescription>
        </CardHeader>
        <CardContent>
          {gpaData.length > 1 ? ( // Ensure there's enough data for a trend line
            <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gpaData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: -10, 
                    bottom: 50, // Increased bottom margin for angled labels
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="semesterLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    angle={-45} // Angle labels for better fit
                    textAnchor="end"
                    interval={0} // Show all labels
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    domain={[0, 4]} 
                    ticks={[0, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]} 
                    style={{ fontSize: '0.75rem' }}
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
            <p className="text-muted-foreground text-center py-8">Not enough published semester data to display GPA trends. At least two semesters with published results are needed.</p>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                This chart visualizes your academic progress. Contact your academic advisor for detailed guidance.
            </p>
         </CardFooter>
      </Card>
    </motion.div>
  );
}
