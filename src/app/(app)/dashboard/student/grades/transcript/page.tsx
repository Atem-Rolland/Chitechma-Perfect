
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadCloud, BookCheck, BarChart3, Info, Printer } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Grade, CaDetails, Course, UserProfile } from "@/types";
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS, getGradeDetailsFromScore, ALL_UNIVERSITY_COURSES } from "@/config/data";
import { PrintPreviewDialog } from "@/components/layout/PrintPreviewDialog"; // Import the new dialog

async function fetchMockGradesForTranscript(studentId: string, allCourses: Course[]): Promise<Grade[]> {
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
      const examScore = Math.floor(Math.random() * (period.level === 200 ? 30: 40)) + (period.level === 200 ? 30: 30);
      const finalScore = totalCaScore + examScore;
      const gradeDetails = getGradeDetailsFromScore(finalScore);
      const isPublished = true; 

      grades.push({
        id: `G_Transcript_${String(gradeIdCounter++).padStart(3, '0')}`,
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

interface GroupedGrades {
  [academicYear: string]: {
    [semester: string]: Grade[];
  };
}

interface TranscriptDocumentProps {
  studentProfile: UserProfile | null;
  groupedGrades: GroupedGrades;
  overallGpaStats: ReturnType<typeof calculateGpaStats>;
}

function TranscriptDocument({ studentProfile, groupedGrades, overallGpaStats }: TranscriptDocumentProps) {
  // This component renders the actual content for the transcript preview
  return (
    <div className="transcript-preview p-4 md:p-6 font-serif text-sm">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">CHITECHMA UNIVERSITY</h1>
        <p>P.O. Box XXX, City, Region</p>
        <h2 className="text-xl font-semibold mt-4 underline">ACADEMIC TRANSCRIPT</h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <p><strong>Student Name:</strong> {studentProfile?.displayName || "N/A"}</p>
        <p><strong>Matricule No:</strong> {studentProfile?.matricule || "N/A"}</p>
        <p><strong>Program:</strong> {studentProfile?.program || "N/A"}</p>
        <p><strong>Department:</strong> {studentProfile?.department || "N/A"}</p>
        <p><strong>Date of Birth:</strong> {studentProfile?.dateOfBirth || "N/A"}</p>
        <p><strong>Nationality:</strong> {studentProfile?.nationality || "N/A"}</p>
        <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
      </section>

      {Object.keys(groupedGrades).map(year => (
        <div key={year} className="mb-6 avoid-break">
          <h3 className="section-title text-center text-base font-semibold mb-2">ACADEMIC YEAR: {year}</h3>
          {Object.keys(groupedGrades[year]).map(semester => {
            const semesterGrades = groupedGrades[year][semester];
            const semesterGpaStats = calculateGpaStats(semesterGrades);
            return (
              <div key={semester} className="mb-4 avoid-break">
                <h4 className="semester-title text-sm font-semibold mb-1">{semester}</h4>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1">Course Code</th>
                      <th className="border border-gray-300 p-1">Course Title</th>
                      <th className="border border-gray-300 p-1 text-center">Credits</th>
                      <th className="border border-gray-300 p-1 text-center">Score</th>
                      <th className="border border-gray-300 p-1 text-center">Grade</th>
                      <th className="border border-gray-300 p-1 text-center">QP</th>
                      <th className="border border-gray-300 p-1">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterGrades.map(grade => (
                      <tr key={grade.id}>
                        <td className="border border-gray-300 p-1">{grade.courseCode}</td>
                        <td className="border border-gray-300 p-1">{grade.courseName}</td>
                        <td className="border border-gray-300 p-1 text-center">{grade.credits}</td>
                        <td className="border border-gray-300 p-1 text-center">{grade.score ?? 'NG'}</td>
                        <td className="border border-gray-300 p-1 text-center">{grade.gradeLetter ?? 'NG'}</td>
                        <td className="border border-gray-300 p-1 text-center">{grade.gradePoint !== null ? (grade.gradePoint * grade.credits).toFixed(1) : '-'}</td>
                        <td className="border border-gray-300 p-1">{grade.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-1 p-1 bg-gray-50 text-xs flex justify-end gap-x-3">
                  <span>Credits Attempted: {semesterGpaStats.totalCreditsAttempted}</span>
                  <span>Credits Earned: {semesterGpaStats.totalCreditsEarned}</span>
                  <span>Quality Points: {semesterGpaStats.totalQualityPoints.toFixed(1)}</span>
                  <span>SGPA: <strong>{semesterGpaStats.gpa.toFixed(2)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <section className="gpa-summary mt-8 pt-4 border-t border-gray-400 text-xs">
        <h3 className="text-sm font-semibold mb-2 text-center">OVERALL ACADEMIC SUMMARY</h3>
        <div className="grid grid-cols-2 gap-x-4">
            <p><strong>Total Credits Attempted:</strong> {overallGpaStats.totalCreditsAttempted}</p>
            <p><strong>Total Credits Earned:</strong> {overallGpaStats.totalCreditsEarned}</p>
            <p><strong>Total Quality Points:</strong> {overallGpaStats.totalQualityPoints.toFixed(1)}</p>
            <p><strong>Cumulative GPA (CGPA):</strong> <strong className="text-base">{overallGpaStats.gpa.toFixed(2)}</strong></p>
        </div>
      </section>
      
      <footer className="mt-12 pt-6 border-t border-gray-400 text-center text-xs">
        <p className="mb-6">KEY: QP = Quality Points, NG = Not Graded</p>
        <p>_________________________</p>
        <p>Registrar's Signature & Stamp</p>
        <p className="mt-4"><em>This transcript is not official unless signed and stamped by the University Registrar.</em></p>
      </footer>
    </div>
  );
}

// Memoized calculation function
const calculateGpaStats = (gradesList: Grade[]): { gpa: number; totalCreditsAttempted: number; totalCreditsEarned: number; totalQualityPoints: number } => {
  if (!gradesList || gradesList.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, totalQualityPoints: 0 };
  
  const validGrades = gradesList.filter(grade => grade.isPublished && grade.gradePoint !== null);
  if (validGrades.length === 0) return { gpa: 0, totalCreditsAttempted: 0, totalCreditsEarned: 0, totalQualityPoints: 0 };

  const totalQualityPoints = validGrades.reduce((sum, grade) => sum + (grade.gradePoint! * grade.credits), 0);
  const totalCreditsAttempted = validGrades.reduce((sum, grade) => sum + grade.credits, 0); 
  const totalCreditsEarned = validGrades.reduce((sum, grade) => sum + (grade.isPass ? grade.credits : 0), 0);
  
  const gpa = totalCreditsAttempted > 0 ? parseFloat((totalQualityPoints / totalCreditsAttempted).toFixed(2)) : 0;
  return { gpa, totalCreditsAttempted, totalCreditsEarned, totalQualityPoints };
};


export default function TranscriptPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadGrades() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const courses = ALL_UNIVERSITY_COURSES;
      const fetchedGrades = await fetchMockGradesForTranscript(user.uid, courses);
      setAllGrades(fetchedGrades);
      setIsLoading(false);
    }
    loadGrades();
  }, [user?.uid]);

  const groupedGrades = useMemo((): GroupedGrades => {
    const publishedGrades = allGrades.filter(g => g.isPublished);
    const semesterOrder = { "First Semester": 1, "Second Semester": 2, "Resit Semester": 3 };
    const groups: GroupedGrades = {};
    
    const sortedGrades = [...publishedGrades].sort((a, b) => {
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
  
  const overallGpaStats = useMemo(() => calculateGpaStats(allGrades.filter(g => g.isPublished)), [allGrades]);

  const handleOpenPrintPreview = () => {
    if (allGrades.filter(g => g.isPublished).length === 0) {
      toast({
        title: "No Data to Preview",
        description: "There are no published grades to generate a transcript.",
        variant: "default"
      });
      return;
    }
    setIsPreviewOpen(true);
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

  if (allGrades.filter(g=>g.isPublished).length === 0 && !isLoading) {
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
            <h3 className="text-xl font-semibold">No Published Grade Data Available</h3>
            <p className="text-muted-foreground mt-1">
              There is no published grade information to display on your transcript yet.
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
          Official record of your academic performance. Only published results are shown.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>
                This information appears on your official transcript.
            </CardDescription>
          </div>
          <Button onClick={handleOpenPrintPreview} className="mt-4 sm:mt-0">
            <Printer className="mr-2 h-4 w-4" />
            Preview & Print/Save Transcript
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm border-t pt-6">
            <p><strong>Student Name:</strong> {profile?.displayName || "N/A"}</p>
            <p><strong>Student ID/Matricule:</strong> {profile?.matricule || "N/A"}</p>
            <p><strong>Program:</strong> {profile?.program || "N/A"}</p>
            <p><strong>Department:</strong> {profile?.department || "N/A"}</p>
            <p><strong>Level at Last Record:</strong> {profile?.level || "N/A"}</p>
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
              const semesterGpaStats = calculateGpaStats(semesterGrades);
              return (
                <div key={semester}>
                  <h3 className="font-semibold text-lg mb-2 text-primary">{semester}</h3>
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead className="text-center">Credits</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                            <TableHead className="text-center">QP</TableHead>
                            <TableHead>Remark</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {semesterGrades.map(grade => (
                            <TableRow key={grade.id} className={!grade.isPass ? "bg-destructive/5 dark:bg-destructive/15" : ""}>
                            <TableCell className="font-medium">{grade.courseCode}</TableCell>
                            <TableCell>{grade.courseName}</TableCell>
                            <TableCell className="text-center">{grade.credits}</TableCell>
                            <TableCell className="text-center">{grade.score ?? 'NG'}</TableCell>
                            <TableCell className={`text-center font-semibold ${!grade.isPass ? "text-destructive" : ""}`}>{grade.gradeLetter ?? 'NG'}</TableCell>
                            <TableCell className="text-center">{grade.gradePoint !== null ? (grade.gradePoint * grade.credits).toFixed(1) : '-'}</TableCell>
                            <TableCell className="text-xs">{grade.remark}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
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
            <CardTitle className="flex items-center gap-2"><BarChart3 className="text-primary"/>Overall Academic Summary (Based on Published Results)</CardTitle>
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
                Pass mark is 'C' (2.0 GPA points). 'NG' denotes 'Not Graded' or 'Pending Publication'.
            </p>
        </CardFooter>
      </Card>

      {isPreviewOpen && (
        <PrintPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          title="Academic Transcript Preview"
        >
          <TranscriptDocument 
            studentProfile={profile} 
            groupedGrades={groupedGrades} 
            overallGpaStats={overallGpaStats} 
          />
        </PrintPreviewDialog>
      )}

    </motion.div>
  );
}
