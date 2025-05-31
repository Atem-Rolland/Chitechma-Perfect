"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Course } from "@/types";
import { BookOpen, Search, Filter, Tag, ArrowRight, School } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Mock data fetching function - replace with actual Firestore query
async function fetchCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: "CSE101", title: "Introduction to Computer Science", code: "CSE 101", description: "Fundamental concepts of computer science and programming.", department: "Computer Science", lecturerId: "lecturer1", lecturerName: "Dr. Ada Lovelace", credits: 3, schedule: "Mon, Wed 9:00-10:30" },
    { id: "MTH201", title: "Calculus I", code: "MTH 201", description: "Differential calculus, limits, continuity, and applications.", department: "Mathematics", lecturerId: "lecturer2", lecturerName: "Prof. Isaac Newton", credits: 4, schedule: "Tue, Thu 11:00-12:30" },
    { id: "PHY201", title: "University Physics I", code: "PHY 201", description: "Mechanics, heat, and sound.", department: "Physics", lecturerId: "lecturer3", lecturerName: "Dr. Albert Einstein", credits: 4, schedule: "Mon, Fri 13:00-14:30" },
    { id: "ENG101", title: "Academic Writing", code: "ENG 101", description: "Developing skills in academic reading and writing.", department: "English", lecturerId: "lecturer4", lecturerName: "Prof. Jane Austen", credits: 3, schedule: "Wed, Fri 10:00-11:30" },
    { id: "HIS105", title: "World History", code: "HIS 105", description: "A survey of major global historical events and civilizations.", department: "History", lecturerId: "lecturer5", lecturerName: "Dr. Herodotus", credits: 3, schedule: "Tue 14:00-17:00" },
  ];
}


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      const fetchedCourses = await fetchCourses();
      setCourses(fetchedCourses);
      setIsLoading(false);
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(course => 
    departmentFilter === "all" || course.department === departmentFilter
  );

  const uniqueDepartments = ["all", ...new Set(courses.map(c => c.department))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-bold">Course Catalog</h1>
        <p className="text-lg text-muted-foreground">Explore available courses and find your next learning adventure.</p>
      </header>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search courses by title or code..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground inline-block" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-4 w-1/4 mt-2" />
                 <Skeleton className="h-4 w-1/3 mt-1" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <motion.div key={course.id} layout>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-10 w-10 text-primary mb-2" />
                     <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{course.credits} Credits</span>
                  </div>
                  <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-accent" /> 
                      Department: <span className="font-medium">{course.department}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <School className="h-4 w-4 text-accent" />
                      Lecturer: <span className="font-medium">{course.lecturerName || 'N/A'}</span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}> {/* Placeholder, implement course detail page */}
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
           <Image src="https://placehold.co/300x300.png" alt="No courses found" width={200} height={200} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education" />
          <h3 className="text-2xl font-semibold">No Courses Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </motion.div>
  );
}
