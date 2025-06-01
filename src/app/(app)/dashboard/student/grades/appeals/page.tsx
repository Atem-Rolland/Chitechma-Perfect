
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
import type { Grade, CaDetails, Course } from "@/types"; 
import { Skeleton } from "@/components/ui/skeleton";
import { DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS, getGradeDetailsFromScore } from "@/config/data";

async function fetchAllCoursesMockAppeals(): Promise<Course[]> {
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

// Copied and adapted from ViewGradesPage for fetching mock grades
async function fetchStudentGradesForAppeal(studentId: string, allCourses: Course[]): Promise<Grade[]> {
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
      const examScore = Math.floor(Math.random() * (period.level === 200 ? 30:40)) + (period.level === 200 ? 30:30);
      const finalScore = totalCaScore + examScore;
      const gradeDetails = getGradeDetailsFromScore(finalScore);
      const isPublished = Math.random() > 0.2; // 80% chance of being published

      grades.push({
        id: `G_Appeal_${String(gradeIdCounter++).padStart(3, '0')}`,
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
      const courses = await fetchAllCoursesMockAppeals();
      const fetchedGrades = await fetchStudentGradesForAppeal(user.uid, courses);
      // Only include published courses for appeal
      const coursesWithPublishedGrades = fetchedGrades.filter(g => g.isPublished && g.gradeLetter); 
      setAppealableCourses(coursesWithPublishedGrades);
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
            If you believe there is an error in your grade for a specific course with published results, you can submit an appeal here.
            Please provide clear and concise reasons, along with any supporting evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="course-select">Select Course to Appeal (Published Grades Only)</Label>
            {isLoadingGrades ? (
              <Skeleton className="h-10 w-full" />
            ) : (
            <Select 
              value={selectedCourse} 
              onValueChange={setSelectedCourse}
              disabled={appealableCourses.length === 0}
            >
              <SelectTrigger id="course-select" aria-label="Select course to appeal">
                <SelectValue placeholder={appealableCourses.length === 0 ? "No appealable courses found" : "Select a course..."} />
              </SelectTrigger>
              <SelectContent>
                {appealableCourses.length > 0 ? (
                  appealableCourses.map(course => (
                    <SelectItem key={course.id} value={course.courseId}>
                      {course.courseCode} - {course.courseName} (Grade: {course.gradeLetter}, Score: {course.score})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-courses" disabled>No published grades available for appeal</SelectItem>
                )}
              </SelectContent>
            </Select>
            )}
            <p className="text-xs text-muted-foreground mt-1">Select the course with a published grade you wish to appeal.</p>
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
