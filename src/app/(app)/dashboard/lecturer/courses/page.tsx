
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
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES } from "@/config/data";


interface AssignedCourse extends Course {
  enrolledStudents: number;
  status: "Active" | "Completed";
}

export default function LecturerCoursesPage() {
  const { user, profile, loading: authLoading } = useAuth(); 
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "all", 
    semester: "all",     
    level: "all",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // Removed artificial delay: const universityCourses = await fetchAllUniversityCourses();
      const universityCourses = ALL_UNIVERSITY_COURSES; // Use direct data

      let filteredForLecturer: Course[];

      if (profile?.uid) { 
        filteredForLecturer = universityCourses.filter(
          course => course.lecturerId === profile.uid
        );
        
        if (filteredForLecturer.length === 0 && profile.displayName) {
            filteredForLecturer = universityCourses.filter(
                course => course.lecturerName === profile.displayName
            );
        }

        if (filteredForLecturer.length === 0 && profile.uid !== "lect001") {
          filteredForLecturer = universityCourses.filter(
            course => course.lecturerId === "lect001"
          );
        }
      } else {
        filteredForLecturer = universityCourses.filter(
          course => course.lecturerId === "lect001"
        );
      }

      const enrichedCourses = filteredForLecturer.map(course => ({
        ...course,
        enrolledStudents: Math.floor(Math.random() * 50) + 10, 
        status: course.academicYear === ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1] ? "Active" : "Completed", 
      }));
      
      setAssignedCourses(enrichedCourses);
      setIsLoading(false);
    }
    
    if (!authLoading) {
      loadData();
    }

  }, [profile, authLoading]); 

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

  if (authLoading && isLoading) { 
    return (
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
    );
  }

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
    
