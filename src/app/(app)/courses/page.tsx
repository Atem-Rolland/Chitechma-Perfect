
"use client";

import React from 'react'; // Ensured React is imported for React.memo
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog as ShadDialog, DialogTrigger } from "@/components/ui/dialog"; // Renamed to avoid conflict
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Course, UserProfile } from "@/types";
import { BookOpen, Search, Filter, Tag, School, Info, CalendarDays, BookUser, PlusCircle, MinusCircle, Download, AlertCircle, XCircle, CheckCircle, Eye, Clock, AlertTriangle, GraduationCap, Printer } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES } from "@/config/data";
import { PrintPreviewDialog } from "@/components/layout/PrintPreviewDialog";

const CourseDetailDialog = dynamic(() => import('@/components/courses/CourseDetailDialog'), {
  suspense: true,
  loading: () => <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><p className="text-white bg-background p-4 rounded-md">Loading details...</p></div>
});

const MIN_CREDITS = 1;
const MAX_CREDITS = 100;

const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};

interface FormBDocumentProps {
  studentProfile: UserProfile | null;
  courses: Course[];
  academicYear: string;
  semester: string;
  totalCredits: number;
}

function FormBDocument({ studentProfile, courses, academicYear, semester, totalCredits }: FormBDocumentProps) {
  return (
    <div className="form-b-preview p-4 md:p-6 font-serif text-sm">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase">Chitechma University</h1>
        <p className="text-sm">P.O. Box XXX, City, Region</p>
        <h2 className="text-xl font-semibold mt-4 underline uppercase">Course Registration Form (Form B)</h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <p><strong>Student Name:</strong> {studentProfile?.displayName || "N/A"}</p>
        <p><strong>Matricule No:</strong> {studentProfile?.matricule || "N/A"}</p>
        <p><strong>Department:</strong> {studentProfile?.department || "N/A"}</p>
        <p><strong>Level:</strong> {studentProfile?.level || "N/A"}</p>
        <p><strong>Academic Year:</strong> {academicYear}</p>
        <p><strong>Semester:</strong> {semester}</p>
        <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
      </section>

      <h3 className="text-base font-semibold mb-2 text-center">Registered Courses</h3>
      {courses.length > 0 ? (
        <table className="w-full border-collapse border border-gray-400 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1">S/N</th>
              <th className="border border-gray-300 p-1">Course Code</th>
              <th className="border border-gray-300 p-1">Course Title</th>
              <th className="border border-gray-300 p-1 text-center">Credits</th>
              <th className="border border-gray-300 p-1 text-center">Type</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={course.id}>
                <td className="border border-gray-300 p-1 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-1">{course.code}</td>
                <td className="border border-gray-300 p-1">{course.title}</td>
                <td className="border border-gray-300 p-1 text-center">{course.credits}</td>
                <td className="border border-gray-300 p-1 text-center">{course.type}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-50">
              <td colSpan={3} className="border border-gray-300 p-1 text-right">Total Credits Registered:</td>
              <td className="border border-gray-300 p-1 text-center">{totalCredits}</td>
              <td className="border border-gray-300 p-1"></td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <p className="text-center text-muted-foreground">No courses registered for this period.</p>
      )}

      <section className="mt-10 text-xs grid grid-cols-2 gap-8">
        <div>
          <p className="mb-10">_________________________</p>
          <p>Student's Signature & Date</p>
        </div>
        <div className="text-right">
          <p className="mb-10">_________________________</p>
          <p>Head of Department's Signature & Stamp</p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-gray-400 text-center text-xs">
        <p><em>This form is an official record of course registration for the specified academic period.</em></p>
      </footer>
    </div>
  );
}

interface CourseRowProps {
  course: Course;
  isRegisteredInFilteredView: boolean;
  isRegisteredForThisPeriod: boolean;
  canRegisterThisCourse: boolean;
  canDropThisCourse: boolean;
  isSavingRegistration: boolean;
  authLoading: boolean;
  onViewDetails: (course: Course) => void;
  onDropCourse: (courseId: string) => void;
  onRegisterCourse: (course: Course) => void;
}

const CourseRow = React.memo(function CourseRow({
  course,
  isRegisteredInFilteredView,
  isRegisteredForThisPeriod,
  canRegisterThisCourse,
  canDropThisCourse,
  isSavingRegistration,
  authLoading,
  onViewDetails,
  onDropCourse,
  onRegisterCourse,
}: CourseRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{course.code}</TableCell>
      <TableCell>{course.title}</TableCell>
      <TableCell className="text-center">{course.credits}</TableCell>
      <TableCell>
        <Badge variant={course.type === 'Compulsory' ? 'default' : course.type === 'Elective' ? 'secondary' : 'outline'}>
          {course.type}
        </Badge>
      </TableCell>
      <TableCell className="text-center">{course.level}</TableCell>
      <TableCell>{course.lecturerName}</TableCell>
      <TableCell className="text-center">
        {isRegisteredInFilteredView ? (
          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
            Registered
          </Badge>
        ) : (
          <Badge variant="outline">Available</Badge>
        )}
      </TableCell>
      <TableCell className="text-right space-x-1">
        <ShadDialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(course)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View Details</span>
            </Button>
          </DialogTrigger>
        </ShadDialog>
        {isRegisteredForThisPeriod ? (
          <Button variant="destructive" size="sm" onClick={() => onDropCourse(course.id)} disabled={!canDropThisCourse || isSavingRegistration}>
            <MinusCircle className="mr-1 h-4 w-4" /> Drop
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={() => onRegisterCourse(course)} disabled={!canRegisterThisCourse || isSavingRegistration || authLoading}>
            <PlusCircle className="mr-1 h-4 w-4" /> Register
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
});
CourseRow.displayName = 'CourseRow';


export default function CoursesPage() {
  const { user, role, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isStudent = role === 'student';

  const [pageDataLoading, setPageDataLoading] = useState(true); 

  const [searchTerm, setSearchTerm] = useState("");
  const [allHistoricalRegistrations, setAllHistoricalRegistrations] = useState<string[]>([]);
  const [registeredCourseIdsForCurrentPeriod, setRegisteredCourseIdsForCurrentPeriod] = useState<string[]>([]);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);

  const [isFormBPreviewOpen, setIsFormBPreviewOpen] = useState(false);
  const [formBData, setFormBData] = useState<FormBDocumentProps | null>(null);


  const studentAcademicContext = useMemo(() => {
    if (isStudent && profile) {
      return {
        department: profile.department || DEPARTMENTS.CESM,
        level: profile.level || VALID_LEVELS[2],
        currentAcademicYear: profile.currentAcademicYear || ACADEMIC_YEARS[2],
        currentSemester: profile.currentSemester || SEMESTERS[0],
      };
    }
    return null;
  }, [isStudent, profile]);

  const defaultRegistrationMeta = useMemo(() => ({
    isOpen: true,
    deadline: "2024-09-15",
    academicYear: studentAcademicContext?.currentAcademicYear || ACADEMIC_YEARS[2],
    semester: studentAcademicContext?.currentSemester || SEMESTERS[0],
  }), [studentAcademicContext]);

  const initialFilters = useMemo(() => {
    if (isStudent && studentAcademicContext) {
      return {
        academicYear: studentAcademicContext.currentAcademicYear,
        semester: studentAcademicContext.currentSemester,
        department: studentAcademicContext.department,
        level: studentAcademicContext.level.toString(),
        courseType: "all",
      };
    }
    return {
      academicYear: defaultRegistrationMeta.academicYear,
      semester: defaultRegistrationMeta.semester,
      department: DEPARTMENTS.CESM,
      level: VALID_LEVELS[2].toString(),
      courseType: "all",
    };
  }, [isStudent, studentAcademicContext, defaultRegistrationMeta]);

  const [filters, setFilters] = useState(initialFilters);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [isDeadlineApproaching, setIsDeadlineApproaching] = useState(false);
  const [daysToDeadline, setDaysToDeadline] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading || !user?.uid || !ALL_UNIVERSITY_COURSES.length) {
      setPageDataLoading(true); 
      return;
    }
    
    if (role === 'student' && !studentAcademicContext) {
        setPageDataLoading(true); 
        return;
    }

    setPageDataLoading(true); 

    let historicalRegsFromStorage: string[] = [];
    const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
    if (storageKey && typeof window !== 'undefined') {
      const storedIdsString = localStorage.getItem(storageKey);
      if (storedIdsString) {
        try {
          const parsedIds = JSON.parse(storedIdsString);
          if (Array.isArray(parsedIds)) {
            historicalRegsFromStorage = parsedIds;
          }
        } catch (e) {
          console.error("Failed to parse all registered courses from localStorage:", e);
          if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
        }
      }
    }

    let finalCurrentPeriodIds: string[] = [];
    let finalHistoricalRegs = [...historicalRegsFromStorage];

    if (role === 'student' && studentAcademicContext) {
        const { department, level, currentAcademicYear, currentSemester } = studentAcademicContext;
        const currentPeriodRegisteredIdsFromHistorical = historicalRegsFromStorage.filter(courseId => {
          const course = ALL_UNIVERSITY_COURSES.find(c => c.id === courseId);
          return course && course.academicYear === currentAcademicYear && course.semester === currentSemester;
        });
        finalCurrentPeriodIds = [...currentPeriodRegisteredIdsFromHistorical];

        if (currentPeriodRegisteredIdsFromHistorical.length === 0 && storageKey) {
          const departmentalCourses = ALL_UNIVERSITY_COURSES.filter(c =>
            c.department === department && c.level === level &&
            c.academicYear === currentAcademicYear && c.semester === currentSemester &&
            (c.type === "Compulsory")
          );
          const generalCoursesForLevel = ALL_UNIVERSITY_COURSES.filter(c =>
            c.type === "General" && c.level === level &&
            c.academicYear === currentAcademicYear && c.semester === currentSemester
          );
          const autoRegisteredIds = [...new Set([...departmentalCourses.map(c => c.id), ...generalCoursesForLevel.map(c => c.id)])];

          if (autoRegisteredIds.length > 0) {
            finalHistoricalRegs = Array.from(new Set([...finalHistoricalRegs, ...autoRegisteredIds]));
            if (typeof window !== 'undefined') {
              localStorage.setItem(storageKey, JSON.stringify(finalHistoricalRegs));
            }
            finalCurrentPeriodIds = autoRegisteredIds;
            toast({ title: "Courses Auto-Registered", description: "Compulsory and general courses for your current level and semester have been pre-selected and saved.", variant: "default" });
          }
        }
    } else { 
         finalCurrentPeriodIds = historicalRegsFromStorage.filter(courseId => {
          const course = ALL_UNIVERSITY_COURSES.find(c => c.id === courseId);
          return course && course.academicYear === filters.academicYear && course.semester === filters.semester;
        });
    }

    setAllHistoricalRegistrations(finalHistoricalRegs);
    setRegisteredCourseIdsForCurrentPeriod(finalCurrentPeriodIds);
    setPageDataLoading(false); 

  }, [user?.uid, authLoading, studentAcademicContext, role, toast, filters.academicYear, filters.semester]); 

  useEffect(() => {
    if (isStudent && studentAcademicContext) {
      setFilters(prevFilters => ({
        ...prevFilters,
        department: studentAcademicContext.department,
        level: studentAcademicContext.level.toString(),
        academicYear: studentAcademicContext.currentAcademicYear,
        semester: studentAcademicContext.currentSemester,
      }));
    }
  }, [isStudent, studentAcademicContext]);

  const currentRegistrationMeta = useMemo(() => {
    const activeYear = filters.academicYear === "all" ? defaultRegistrationMeta.academicYear : filters.academicYear;
    const activeSemester = filters.semester === "all" ? defaultRegistrationMeta.semester : filters.semester;
    if (activeYear === "2024/2025" && activeSemester === "First Semester") return { isOpen: true, deadline: "2024-09-15", academicYear: activeYear, semester: activeSemester };
    if (activeYear === "2024/2025" && activeSemester === "Second Semester") return { isOpen: true, deadline: "2025-02-15", academicYear: activeYear, semester: activeSemester };
    return { isOpen: false, deadline: "N/A", academicYear: activeYear, semester: activeSemester, message: (filters.academicYear === "all" || filters.semester === "all") ? "Select specific year/semester for registration status." : undefined };
  }, [filters.academicYear, filters.semester, defaultRegistrationMeta]);

  useEffect(() => {
    if (currentRegistrationMeta.isOpen && currentRegistrationMeta.deadline && currentRegistrationMeta.deadline !== "N/A") {
      const deadlineDate = new Date(currentRegistrationMeta.deadline);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysToDeadline(diffDays);
      setIsDeadlineApproaching(diffDays >= 0 && diffDays <= 7);
    } else {
      setIsDeadlineApproaching(false); setDaysToDeadline(null);
    }
  }, [currentRegistrationMeta.isOpen, currentRegistrationMeta.deadline]);

  const staticDepartments = useMemo(() => ["all", ...Object.values(DEPARTMENTS)], []);
  const staticLevels = useMemo(() => ["all", ...VALID_LEVELS.map(l => l.toString())], []);
  const courseTypes = ["all", "Compulsory", "Elective", "General"];
  const academicYearsForFilter = useMemo(() => ["all", ...ACADEMIC_YEARS], []);
  const semestersForFilter = useMemo(() => ["all", ...SEMESTERS], []);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredCourses = useMemo(() => {
    return ALL_UNIVERSITY_COURSES
      .filter(course => filters.department === "all" || course.department === filters.department)
      .filter(course => filters.level === "all" || course.level.toString() === filters.level)
      .filter(course => filters.academicYear === "all" || course.academicYear === filters.academicYear)
      .filter(course => filters.semester === "all" || course.semester === filters.semester)
      .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(course => filters.courseType === "all" || course.type === filters.courseType);
  }, [searchTerm, filters]);

  const registeredCoursesListForDisplay = useMemo(() => {
    return ALL_UNIVERSITY_COURSES.filter(course =>
      allHistoricalRegistrations.includes(course.id) &&
      (filters.academicYear === "all" || course.academicYear === filters.academicYear) &&
      (filters.semester === "all" || course.semester === filters.semester)
    );
  }, [allHistoricalRegistrations, filters.academicYear, filters.semester]);

  const totalRegisteredCreditsForFilteredPeriod = useMemo(() => {
    if (filters.academicYear === "all" || filters.semester === "all") return 0;
    return registeredCoursesListForDisplay
      .filter(course => course.academicYear === filters.academicYear && course.semester === filters.semester)
      .reduce((sum, course) => sum + course.credits, 0);
  }, [registeredCoursesListForDisplay, filters.academicYear, filters.semester]);

  const handleRegisterCourse = useCallback((course: Course) => {
    setIsSavingRegistration(true);
    if (!user?.uid) { toast({ title: "Error", description: "User not identified.", variant: "destructive" }); setIsSavingRegistration(false); return; }
    if (!currentRegistrationMeta.isOpen) { toast({ title: "Registration Closed", description: `Course registration for ${currentRegistrationMeta.academicYear}, ${currentRegistrationMeta.semester} is currently closed.`, variant: "destructive" }); setIsSavingRegistration(false); return; }
    if (course.academicYear !== currentRegistrationMeta.academicYear || course.semester !== currentRegistrationMeta.semester) { toast({ title: "Registration Mismatch", description: `You can only register for courses in the currently open registration period: ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}. This course is for ${course.semester}, ${course.academicYear}.`, variant: "destructive" }); setIsSavingRegistration(false); return; }
    if (allHistoricalRegistrations.includes(course.id)) { toast({ title: "Already Registered", description: `You are already registered for ${course.code} - ${course.title}.`, variant: "default" }); setIsSavingRegistration(false); return; }

    const newHistoricalTotal = [...allHistoricalRegistrations, course.id];
    setAllHistoricalRegistrations(newHistoricalTotal);
    if (studentAcademicContext && course.academicYear === studentAcademicContext.currentAcademicYear && course.semester === studentAcademicContext.currentSemester) {
      setRegisteredCourseIdsForCurrentPeriod(prev => [...prev, course.id]);
    }
    if (typeof window !== 'undefined') { const storageKey = getLocalStorageKeyForAllRegistrations(user.uid); if (storageKey) localStorage.setItem(storageKey, JSON.stringify(newHistoricalTotal)); }
    toast({ title: "Course Registered", description: `${course.code} - ${course.title} successfully registered (localStorage).`, variant: "default" });
    setIsSavingRegistration(false);
  }, [user?.uid, currentRegistrationMeta, allHistoricalRegistrations, toast, studentAcademicContext]);

  const handleDropCourse = useCallback((courseIdToDrop: string) => {
    const courseToDrop = ALL_UNIVERSITY_COURSES.find(c => c.id === courseIdToDrop);
    if (!courseToDrop || !user?.uid) return; setIsSavingRegistration(true);
    if (!currentRegistrationMeta.isOpen) { toast({ title: "Registration Closed", description: `Cannot drop courses as registration is closed.`, variant: "destructive" }); setIsSavingRegistration(false); return; }
    if (courseToDrop.academicYear !== currentRegistrationMeta.academicYear || courseToDrop.semester !== currentRegistrationMeta.semester) { toast({ title: "Drop Mismatch", description: `Can only drop courses from the open registration period.`, variant: "destructive" }); setIsSavingRegistration(false); return; }

    const newHistoricalTotal = allHistoricalRegistrations.filter(id => id !== courseIdToDrop);
    setAllHistoricalRegistrations(newHistoricalTotal);
    setRegisteredCourseIdsForCurrentPeriod(prev => prev.filter(id => id !== courseIdToDrop));
    if (typeof window !== 'undefined') { const storageKey = getLocalStorageKeyForAllRegistrations(user.uid); if (storageKey) localStorage.setItem(storageKey, JSON.stringify(newHistoricalTotal)); }
    toast({ title: "Course Dropped", description: `${courseToDrop.code} - ${courseToDrop.title} has been dropped (localStorage).`, variant: "default" });
    setIsSavingRegistration(false);
  }, [user?.uid, currentRegistrationMeta, allHistoricalRegistrations, toast]);
  
  const handleDownloadFormB = useCallback(() => {
    if (filters.academicYear === "all" || filters.semester === "all") {
      toast({ title: "Select Period", description: "Please select a specific Academic Year and Semester to generate Form B.", variant: "info" });
      return;
    }
    const coursesForFormB = registeredCoursesListForDisplay.filter(c => c.academicYear === filters.academicYear && c.semester === filters.semester);
    if (coursesForFormB.length === 0) {
      toast({ title: "No Courses", description: `No courses registered in localStorage for ${filters.semester}, ${filters.academicYear}.`, variant: "info" });
      return;
    }
    const totalCreditsForFormB = coursesForFormB.reduce((sum, course) => sum + course.credits, 0);
    
    setFormBData({
      studentProfile: profile,
      courses: coursesForFormB,
      academicYear: filters.academicYear,
      semester: filters.semester,
      totalCredits: totalCreditsForFormB,
    });
    setIsFormBPreviewOpen(true);
  }, [filters.academicYear, filters.semester, registeredCoursesListForDisplay, toast, profile]);


  const handleSetSelectedCourseForDetail = useCallback((course: Course | null) => {
    setSelectedCourseForDetail(course);
  }, []);

  const getCreditStatus = () => {
    const periodYear = currentRegistrationMeta.isOpen ? currentRegistrationMeta.academicYear : filters.academicYear;
    const periodSemester = currentRegistrationMeta.isOpen ? currentRegistrationMeta.semester : filters.semester;
    if (periodYear === "all" || periodSemester === "all") return { message: `Select specific Year & Semester for credit status.`, variant: "info" as const, credits: 0 };
    const creditsForPeriod = allHistoricalRegistrations.map(id => ALL_UNIVERSITY_COURSES.find(c => c.id === id)).filter(c => c && c.academicYear === periodYear && c.semester === periodSemester).reduce((sum, c) => sum + (c?.credits || 0), 0);
    if (!currentRegistrationMeta.isOpen && (filters.academicYear !== "all" && filters.semester !== "all")) return { message: `Registration for ${filters.semester}, ${filters.academicYear} is closed. Credits: ${creditsForPeriod}.`, variant: "info" as const, credits: creditsForPeriod };
    if (currentRegistrationMeta.isOpen) {
      const creditsForOpenPeriod = allHistoricalRegistrations.map(id => ALL_UNIVERSITY_COURSES.find(c => c.id === id)).filter(c => c && c.academicYear === currentRegistrationMeta.academicYear && c.semester === currentRegistrationMeta.semester).reduce((sum, c) => sum + (c?.credits || 0), 0);
      if (creditsForOpenPeriod < MIN_CREDITS && creditsForOpenPeriod > 0) return { message: `Low credit load. Min ${MIN_CREDITS} (loosened check). Current: ${creditsForOpenPeriod}.`, variant: "warning" as const, credits: creditsForOpenPeriod };
      if (creditsForOpenPeriod > MAX_CREDITS) return { message: `Over max credit load. Max ${MAX_CREDITS} (loosened check). Current: ${creditsForOpenPeriod}.`, variant: "destructive" as const, credits: creditsForOpenPeriod };
      return { message: `Total credits for open period: ${creditsForOpenPeriod}. (Min/Max checks loosened)`, variant: "success" as const, credits: creditsForOpenPeriod };
    }
    return { message: `Credit load for ${periodSemester}, ${periodYear}: ${creditsForPeriod}.`, variant: "info" as const, credits: creditsForPeriod };
  };

  const creditStatus = getCreditStatus();

  const showSkeletons = authLoading || pageDataLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-8 pb-8"
    >
      <header className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2"><GraduationCap className="text-primary"/>Course Registration</h1>
        <p className="text-md md:text-lg text-muted-foreground">
          Explore courses and manage your registration. Your default department and level are pre-selected for filters.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Registration Status for {currentRegistrationMeta.academicYear}, {currentRegistrationMeta.semester}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentRegistrationMeta.message && (<Alert variant="info"><Info className="h-5 w-5" /><AlertTitle>Dynamic Info</AlertTitle><AlertDescription>{currentRegistrationMeta.message}</AlertDescription></Alert>)}
          {currentRegistrationMeta.isOpen ? (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" /><AlertTitle>Registration is OPEN</AlertTitle>
              <AlertDescription>Deadline: <strong>{currentRegistrationMeta.deadline === "N/A" ? "N/A" : new Date(currentRegistrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> for {currentRegistrationMeta.academicYear}, {currentRegistrationMeta.semester}.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" /><AlertTitle>Registration is CLOSED</AlertTitle>
              <AlertDescription>Registration for {currentRegistrationMeta.academicYear}, {currentRegistrationMeta.semester} is closed.</AlertDescription>
            </Alert>
          )}
          {isDeadlineApproaching && currentRegistrationMeta.isOpen && daysToDeadline !== null && (
            <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" /><AlertTitle>Deadline Approaching!</AlertTitle>
              <AlertDescription>{daysToDeadline === 0 ? "Today is the last day." : `${daysToDeadline} day${daysToDeadline > 1 ? 's' : ''} remaining.`} Deadline: <strong>{new Date(currentRegistrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="text-primary"/>Filter Courses</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}><SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Academic Year</SelectTrigger><SelectContent>{academicYearsForFilter.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}><SelectTrigger><BookOpen className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Semester</SelectTrigger><SelectContent>{semestersForFilter.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}><SelectTrigger><School className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Department</SelectTrigger><SelectContent>{staticDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.level} onValueChange={(value) => handleFilterChange("level", value)}><SelectTrigger><BookUser className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Level</SelectTrigger><SelectContent>{staticLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl === "all" ? "All Levels" : `${lvl} Level`}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.courseType} onValueChange={(value) => handleFilterChange("courseType", value)}><SelectTrigger><Tag className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Course Type</SelectTrigger><SelectContent>{courseTypes.map(type => <SelectItem key={type} value={type}>{type === "all" ? "All Types" : type}</SelectItem>)}</SelectContent></Select>
          <div className="relative lg:col-span-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Search..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>{`Showing courses for ${filters.department === "all" ? "all departments" : filters.department}, Level ${filters.level === "all" ? "all levels" : filters.level}, ${filters.semester}, ${filters.academicYear}.`}</CardDescription>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (<div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : ALL_UNIVERSITY_COURSES.length === 0 ? (
              <div className="text-center py-12"><Image src="https://placehold.co/300x200.png" alt="No courses available" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty bookshelf education" /><h3 className="text-xl font-semibold">No Courses Available</h3><p className="text-muted-foreground mt-1">Contact administration.</p></div>
            ) : filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead className="text-center">Credits</TableHead><TableHead>Type</TableHead><TableHead>Level</TableHead><TableHead>Lecturer</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredCourses.map(course => {
                      const isRegisteredForThisPeriod = allHistoricalRegistrations.includes(course.id) && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester;
                      const canRegisterThisCourse = currentRegistrationMeta.isOpen && !isRegisteredForThisPeriod && !isSavingRegistration && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester;
                      const canDropThisCourse = isRegisteredForThisPeriod && currentRegistrationMeta.isOpen && !isSavingRegistration && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester;
                      const isRegisteredInFilteredView = allHistoricalRegistrations.includes(course.id) && course.academicYear === filters.academicYear && course.semester === filters.semester;
                      return (
                        <CourseRow
                          key={course.id}
                          course={course}
                          isRegisteredInFilteredView={isRegisteredInFilteredView}
                          isRegisteredForThisPeriod={isRegisteredForThisPeriod}
                          canRegisterThisCourse={canRegisterThisCourse}
                          canDropThisCourse={canDropThisCourse}
                          isSavingRegistration={isSavingRegistration}
                          authLoading={authLoading}
                          onViewDetails={handleSetSelectedCourseForDetail}
                          onDropCourse={handleDropCourse}
                          onRegisterCourse={handleRegisterCourse}
                        />
                      );})}
                  </TableBody>
                </Table>
              </div>
            ) : (<div className="text-center py-12"><Image src="https://placehold.co/300x200.png" alt="No courses found for filters" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education" /><h3 className="text-xl font-semibold">No Courses Found</h3><p className="text-muted-foreground mt-1">Try adjusting search/filters.</p></div>)}
          </CardContent>
        </Card>

        <div className="space-y-6 md:space-y-8">
          <Card>
            <CardHeader><CardTitle>My Registered Courses</CardTitle><CardDescription>Courses for {filters.semester === "all" ? "selected period" : filters.semester}, {filters.academicYear === "all" ? "selected period" : filters.academicYear} (from localStorage).</CardDescription></CardHeader>
            <CardContent>
              {showSkeletons ? <Skeleton className="h-20 w-full" /> : registeredCoursesListForDisplay.length > 0 ? (
                <ul className="space-y-2">
                  {registeredCoursesListForDisplay.map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-muted rounded-md"><div><p className="font-medium">{course.code} - {course.title}</p><p className="text-xs text-muted-foreground">{course.credits} Credits ({course.semester}, {course.academicYear})</p></div>
                       {currentRegistrationMeta.isOpen && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester && (<Button variant="ghost" size="icon" onClick={() => handleDropCourse(course.id)} className="text-destructive hover:bg-destructive/10" disabled={isSavingRegistration}><XCircle className="h-4 w-4" /><span className="sr-only">Drop</span></Button>)}
                    </li>))}</ul>
              ) : (<p className="text-sm text-muted-foreground">No courses registered for the selected period.</p>)}
            </CardContent>
            <CardFooter className="flex-col items-start space-y-3">
              <div className="w-full">
                 <p className="text-lg font-semibold">{totalRegisteredCreditsForFilteredPeriod > 0 && (filters.academicYear !== "all" && filters.semester !== "all") ? `Total Credits for ${filters.semester}, ${filters.academicYear}: ` : currentRegistrationMeta.isOpen && currentRegistrationMeta.academicYear !== "all" ? `Total Credits for Current Registration Period: ` : "Total Registered Credits (filtered view):" } <span className={creditStatus.variant === "warning" || creditStatus.variant === "destructive" ? "text-destructive" : "text-green-600 dark:text-green-400"}>{totalRegisteredCreditsForFilteredPeriod}</span></p>
                {((currentRegistrationMeta.isOpen && currentRegistrationMeta.academicYear !== "all") || (totalRegisteredCreditsForFilteredPeriod > 0 && filters.academicYear !== "all" && filters.semester !== "all" )) && (
                   <Alert variant={creditStatus.variant === "success" ? "default" : creditStatus.variant} className="mt-2">{creditStatus.variant === "success" ? <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" /> : creditStatus.variant === "info" ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}<AlertTitle>{creditStatus.variant === "warning" ? "Warning" : creditStatus.variant === "destructive" ? "Error" : "Status"}</AlertTitle><AlertDescription>{creditStatus.message}</AlertDescription></Alert>)}
              </div>
              <Button className="w-full" onClick={handleDownloadFormB} disabled={filters.academicYear === "all" || filters.semester === "all" || registeredCoursesListForDisplay.filter(c => c.academicYear === filters.academicYear && c.semester === filters.semester).length === 0}>
                <Printer className="mr-2 h-4 w-4"/> Preview Form B
              </Button>
            </CardFooter>
          </Card>

           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="text-primary"/>My Schedule (Simulated)</CardTitle><CardDescription>Schedule for {filters.semester === "all" ? "selected period" : filters.semester}, {filters.academicYear === "all" ? "selected period" : filters.academicYear}.</CardDescription></CardHeader>
            <CardContent>
                {showSkeletons ? ( <Skeleton className="h-20 w-full" /> ) : registeredCoursesListForDisplay.filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester)).length > 0 ? (
                <ul className="space-y-3">
                  {registeredCoursesListForDisplay.filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester)).map(course => (
                    <li key={`${course.id}-schedule`} className="p-3 bg-muted rounded-md">
                      <p className="font-medium">{course.code} - {course.title}</p>
                      <p className="text-sm text-muted-foreground">Schedule: {course.schedule || "Not specified"}</p>
                    </li>
                  ))}
                </ul>
                ) : (<p className="text-sm text-muted-foreground">No courses registered to display schedule for the selected filter.</p>)}
                 <p className="text-xs text-muted-foreground mt-4">Note: Full timetable grid requires detailed day/time information from course data.</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled>
                 <Download className="mr-2 h-4 w-4"/> Download Schedule (PDF)
                </Button>
            </CardFooter>
           </Card>
        </div>
      </div>

      {selectedCourseForDetail && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><p className="text-white bg-background p-4 rounded-md">Loading details...</p></div>}>
            <CourseDetailDialog course={selectedCourseForDetail} allCourses={ALL_UNIVERSITY_COURSES} open={!!selectedCourseForDetail} onOpenChange={(isOpen) => !isOpen && handleSetSelectedCourseForDetail(null)} />
        </Suspense>
      )}

      {isFormBPreviewOpen && formBData && (
        <PrintPreviewDialog
          open={isFormBPreviewOpen}
          onOpenChange={setIsFormBPreviewOpen}
          title={`Course Registration Form B - ${formBData.semester}, ${formBData.academicYear}`}
        >
          <FormBDocument {...formBData} />
        </PrintPreviewDialog>
      )}
    </motion.div>
  );
}
      
