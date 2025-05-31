
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Send, Paperclip, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Grade, CaDetails } from "@/types"; // Ensure Grade type is available
import { Skeleton } from "@/components/ui/skeleton";

// Copied and adapted from ViewGradesPage for fetching mock grades
const GRADE_POINTS_APPEAL: Record<string, number> = {
  "A+": 4.0, "A": 4.0, 
  "B+": 3.5, "B": 3.0, 
  "C+": 2.5, "C": 2.0, 
  "D+": 0.0, "D": 0.0, "F": 0.0,   
};

function getGradeLetterFromScoreAppeal(score: number): string {
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

async function fetchStudentGradesForAppeal(studentId: string): Promise<Grade[]> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Using the same mock data structure as ViewGradesPage
  const mockRawScores: { 
    studentId: string, courseId: string, courseCode: string, courseName: string, credits: number, 
    caDetails: CaDetails, examScore: number, academicYear: string, semester: string 
  }[] = [
    { studentId, courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms", credits: 3, caDetails: { assignments: 5, groupWork: 4, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 58, academicYear: "2023/2024", semester: "First Semester" },
    { studentId, courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I", credits: 4, caDetails: { assignments: 4, groupWork: 3, attendance: 4, writtenCA: 12, totalCaScore: 23 }, examScore: 55, academicYear: "2023/2024", semester: "First Semester" },
    { studentId, courseId: "PHY205", courseCode: "PHY205", courseName: "General Physics I", credits: 3, caDetails: { assignments: 3, groupWork: 4, attendance: 5, writtenCA: 10, totalCaScore: 22 }, examScore: 46, academicYear: "2023/2024", semester: "First Semester" },
    { studentId, courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development", credits: 3, caDetails: { assignments: 4, groupWork: 4, attendance: 5, writtenCA: 14, totalCaScore: 27 }, examScore: 61, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "MGT403", courseCode: "MGT403", courseName: "Research Methodology", credits: 3, caDetails: { assignments: 4, groupWork: 5, attendance: 5, writtenCA: 13, totalCaScore: 27 }, examScore: 54, academicYear: "2024/2025", semester: "First Semester" },
    { studentId, courseId: "NES403", courseCode: "NES403", courseName: "Modeling in Information System", credits: 3, caDetails: { assignments: 1, groupWork: 2, attendance: 2, writtenCA: 5, totalCaScore: 10 }, examScore: 35, academicYear: "2024/2025", semester: "First Semester" }, // F Grade
  ];

  return mockRawScores.map((gradeData, index) => {
    const totalScore = (gradeData.caDetails?.totalCaScore || 0) + (gradeData.examScore || 0);
    const gradeLetter = getGradeLetterFromScoreAppeal(totalScore);
    return {
      id: `G${String(index + 1).padStart(3, '0')}`,
      studentId: studentId,
      courseId: gradeData.courseId,
      courseCode: gradeData.courseCode,
      courseName: gradeData.courseName,
      credits: gradeData.credits,
      score: totalScore,
      gradeLetter: gradeLetter,
      gradePoint: GRADE_POINTS_APPEAL[gradeLetter] !== undefined ? GRADE_POINTS_APPEAL[gradeLetter] : 0.0,
      academicYear: gradeData.academicYear,
      semester: gradeData.semester,
      caDetails: gradeData.caDetails,
      examScore: gradeData.examScore,
      isPass: GRADE_POINTS_APPEAL[gradeLetter] >= 2.0,
    };
  });
}


export default function GradeAppealsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [appealReason, setAppealReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState<boolean>(true);
  const [appealableCourses, setAppealableCourses] = useState<Grade[]>([]);


  useEffect(() => {
    async function loadAppealableCourses() {
      if (!user?.uid) {
        setIsLoadingGrades(false);
        return;
      }
      setIsLoadingGrades(true);
      const fetchedGrades = await fetchStudentGradesForAppeal(user.uid);
      // Only include courses with actual grades (not "NG" or similar if that were a concept)
      const coursesWithGrades = fetchedGrades.filter(g => g.gradeLetter); 
      setAppealableCourses(coursesWithGrades);
      setIsLoadingGrades(false);
    }
    loadAppealableCourses();
  }, [user?.uid]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
        });
        setSelectedFile(null);
        event.target.value = ""; 
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!selectedCourse || !appealReason) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a course and provide a reason for your appeal.",
      });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const appealedCourseDetails = appealableCourses.find(c => c.courseId === selectedCourse);
    toast({
      title: "Appeal Submitted (Simulated)",
      description: `Your grade appeal for ${appealedCourseDetails?.courseCode || 'the selected course'} - ${appealedCourseDetails?.courseName || ''} has been notionally submitted.`,
    });
    
    setSelectedCourse("");
    setAppealReason("");
    setSelectedFile(null);
    const fileInput = document.getElementById("supporting-documents") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setIsSubmitting(false);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FileWarning className="h-6 w-6 text-primary" />
            Submit Grade Appeal
          </CardTitle>
          <CardDescription>
            If you believe there is an error in your grade for a specific course you completed, you can submit an appeal here.
            Please provide clear and concise reasons, along with any supporting evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="course-select">Select Course to Appeal</Label>
            {isLoadingGrades ? (
              <Skeleton className="h-10 w-full" />
            ) : (
            <Select 
              value={selectedCourse} 
              onValueChange={setSelectedCourse}
              disabled={appealableCourses.length === 0}
            >
              <SelectTrigger id="course-select" aria-label="Select course to appeal">
                <SelectValue placeholder={appealableCourses.length === 0 ? "No graded courses available" : "Select a graded course..."} />
              </SelectTrigger>
              <SelectContent>
                {appealableCourses.length > 0 ? (
                  appealableCourses.map(course => (
                    <SelectItem key={course.id} value={course.courseId}>
                      {course.courseCode} - {course.courseName} (Grade: {course.gradeLetter}, Score: {course.score})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-courses" disabled>No graded courses found</SelectItem>
                )}
              </SelectContent>
            </Select>
            )}
            <p className="text-xs text-muted-foreground mt-1">Select the course for which you want to appeal the grade.</p>
          </div>

          <div>
            <Label htmlFor="appeal-reason">Reason for Appeal</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Clearly explain the reason for your grade appeal. Provide specific details and refer to course materials, assignments, or grading criteria if necessary."
              rows={6}
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="supporting-documents">Attach Supporting Document (Optional)</Label>
            <Input 
              id="supporting-documents" 
              type="file" 
              onChange={handleFileChange}
              accept="image/*,application/pdf,.doc,.docx" 
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 p-2 border rounded-md bg-secondary/50">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Attach documents like graded papers, screenshots, etc. (Max 5MB. PDF, DOC, DOCX, JPG, PNG accepted).
            </p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSubmitAppeal}
            disabled={isSubmitting || isLoadingGrades || !selectedCourse || !appealReason}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Appeal
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Note: The grade appeal submission system is currently for UI demonstration. 
            Backend processing is under development.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
    