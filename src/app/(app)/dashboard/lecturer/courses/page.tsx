
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";
import { BookOpen, Search, Filter, Tag, School, Info, CalendarDays, BookUser, Users, FileText, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from "@/config/data";

// Expanded Mock Courses (simulating all available courses in the university system)
// This should be consistent with the main course list in courses/page.tsx
async function fetchAllUniversityCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // This data should ideally be fetched or imported from a central place
  // For now, copying a subset from the main courses page for consistency
  const mockCourses: Course[] = [
    { id: "CSE301_CESM_Y2324_S1", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" },
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10-12, Wed 10-11, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-16, Fri 8-9", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Research methods and academic writing.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", description: "Design and programming of embedded systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Thu 8-11", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Techniques for system modeling.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11-13, CR10", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LAW101_CESM_Y2223_S1", title: "Introduction to Law", code: "LAW101", description: "Basic legal principles.", department: DEPARTMENTS.CESM, lecturerId: "lect_law", lecturerName: "Barr. Tabi", credits: 1, type: "General", level: 200, schedule: "Mon 8-9, AMPHI100", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE111_CESM_Y2223_S1", title: "Introduction to Software Eng", code: "SWE111", description: "Foundations of software engineering.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 200, schedule: "Mon 14-17, AMPHI300", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT116_CPT_Y2223_S1", title: "Soil and Fertilization", code: "CPT116", description: "Soil science and fertilization techniques.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt1", lecturerName: "Dr. Soil", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
  ];
  return mockCourses;
}

interface AssignedCourse extends Course {
  enrolledStudents: number;
  status: "Active" | "Completed";
}

export default function LecturerCoursesPage() {
  const { user, profile } = useAuth(); 
  const [allUniversityCourses, setAllUniversityCourses] = useState<Course[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "all", 
    semester: "all",     
    level: "all",
  });

  const MOCK_LECTURER_ID = profile?.uid || "lect001"; 
  const MOCK_LECTURER_NAME = profile?.displayName || "Dr. Eno"; 

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const universityCourses = await fetchAllUniversityCourses();
      setAllUniversityCourses(universityCourses);

      const lecturerSpecificCourses = universityCourses
        .filter(course => course.lecturerId === MOCK_LECTURER_ID || course.lecturerName === MOCK_LECTURER_NAME) 
        .map(course => ({
          ...course,
          enrolledStudents: Math.floor(Math.random() * 50) + 10, 
          status: course.academicYear === ACADEMIC_YEARS[ACADEMIC_YEARS.length-1] ? "Active" : "Completed", 
        }));
      
      setAssignedCourses(lecturerSpecificCourses);
      setIsLoading(false);
    }
    loadData();
  }, [MOCK_LECTURER_ID, MOCK_LECTURER_NAME]);

  const academicYearsForFilter = useMemo(() => ["all", ...ACADEMIC_YEARS], []);
  const semestersForFilter = useMemo(() => ["all", ...SEMESTERS], []);
  const levelsForFilter = useMemo(() => ["all", ...VALID_LEVELS.map(l => l.toString())], []);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredCoursesToDisplay = useMemo(() => {
    return assignedCourses
      .filter(course => filters.academicYear === "all" || course.academicYear === filters.academicYear)
      .filter(course => filters.semester === "all" || course.semester === filters.semester)
      .filter(course => filters.level === "all" || course.level.toString() === filters.level)
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [assignedCourses, searchTerm, filters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-bold flex items-center gap-2"><BookOpen className="text-primary"/>My Assigned Courses</h1>
        <p className="text-lg text-muted-foreground">
          Manage your courses, view class lists, enter grades, and post materials.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="text-primary"/>Filter Courses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}>
            <SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Academic Year</SelectTrigger>
            <SelectContent>
              {academicYearsForFilter.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><BookUser className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Semester</SelectTrigger>
            <SelectContent>
              {semestersForFilter.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={filters.level} onValueChange={(value) => handleFilterChange("level", value)}>
            <SelectTrigger><School className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Level</SelectTrigger>
            <SelectContent>
              {levelsForFilter.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl === "all" ? "All Levels" : lvl}</SelectItem>)}
            </SelectContent>
          </Select>
           <div className="relative md:col-span-1"> 
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title or code..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCoursesToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoursesToDisplay.map(course => (
            <Card key={course.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{course.title} ({course.code})</CardTitle>
                <CardDescription>
                  {course.department} <br />
                  Level {course.level} - {course.semester}, {course.academicYear}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground"/> {course.enrolledStudents} Students Enrolled</p>
                <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground"/> Credits: {course.credits}</p>
                <p><Badge variant={course.status === "Active" ? "default" : "secondary"}>{course.status}</Badge></p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/dashboard/lecturer/courses/${course.id}/students`}><Users className="mr-1 h-4 w-4"/>Class List</Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/dashboard/lecturer/courses/${course.id}/grades`}><FileText className="mr-1 h-4 w-4"/>Gradebook</Link>
                </Button>
                 <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/dashboard/lecturer/courses/${course.id}/manage`}><Edit className="mr-1 h-4 w-4"/>Manage</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image src="https://placehold.co/300x200.png" alt="No courses found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education" />
          <h3 className="text-xl font-semibold">No Courses Found</h3>
          <p className="text-muted-foreground mt-1">
            No courses match your current filter criteria or you have no courses assigned for the selected period.
          </p>
        </div>
      )}
    </motion.div>
  );
}
