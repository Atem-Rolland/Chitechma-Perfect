
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, UserCircle, BookOpen, Info } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import type { Course, TimetableEntry } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from "@/config/data"; // Import SEMESTERS
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Mock data for courses - should be consistent with other parts of the app
const MOCK_ALL_COURSES_TIMETABLE: Course[] = [
    // Copied from courses/page.tsx for consistency. A real app would fetch this.
    // Level 200 CESM - First Semester
    { id: "LAW101_CESM_Y2223_S1", title: "Introduction to Law", code: "LAW101", department: DEPARTMENTS.CESM, credits: 1, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "lect_law", lecturerName: "Barr. Tabi", type: "General", schedule: "Mon 8:00-9:00, AMPHI100" },
    { id: "ENG102_CESM_Y2223_S1", title: "English Language", code: "ENG102", department: DEPARTMENTS.CESM, credits: 1, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "lect_eng", lecturerName: "Ms. Anja", type: "General", schedule: "Tue 14:00-15:00, CR15" },
    { id: "SWE111_CESM_Y2223_S1", title: "Introduction to Software Eng", code: "SWE111", department: DEPARTMENTS.CESM, credits: 3, level: 200, semester: "First Semester", academicYear: "2022/2023", description: "", lecturerId: "lect002", lecturerName: "Prof. Besong", type: "Compulsory", schedule: "Mon 14:00-17:00, AMPHI300" },
    // Level 400 CESM - First Semester (for Atem Rolland)
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10:00-12:00, Wed 10:00-11:00, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 14:00-16:00, Fri 8:00-9:00, AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Research methods and academic writing.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "Wed 14:00-17:00, AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", description: "Design and programming of embedded systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "Thu 8:00-11:00, AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Techniques for system modeling.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11:00-13:00, CR10", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
];

// Helper function to parse schedule string (simplified)
// A robust parser would be more complex.
function parseScheduleToTimetableEntries(course: Course): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  if (!course.schedule) return entries;

  // Example schedule: "Mon 10:00-12:00, Wed 10:00-11:00, Lab Hall 1"
  // This simple parser assumes venue is last and applies to all listed slots.
  const parts = course.schedule.split(',').map(p => p.trim());
  const venue = parts.length > 1 && !parts[parts.length - 1].match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/) ? parts.pop() : "TBD";

  parts.forEach((part, index) => {
    const match = part.match(/(\w{3})\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/i);
    if (match) {
      const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' } as const;
      const dayOfWeek = dayMap[match[1] as keyof typeof dayMap];
      if (dayOfWeek) {
        entries.push({
          id: `${course.id}-slot${index + 1}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          dayOfWeek: dayOfWeek,
          startTime: match[2],
          endTime: match[3],
          venue: venue || "TBD",
          lecturerName: course.lecturerName,
          semester: course.semester,
          academicYear: course.academicYear,
        });
      }
    }
  });
  return entries;
}

const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};

const DAYS_OF_WEEK: TimetableEntry['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetablePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriodDisplay, setCurrentPeriodDisplay] = useState<string>("");

  useEffect(() => {
    async function loadTimetable() {
      if (authLoading) return;
      setIsLoading(true);

      if (!user?.uid || !profile) {
        setTimetableEntries([]);
        setIsLoading(false);
        setCurrentPeriodDisplay("Profile not available");
        return;
      }
      
      const studentCurrentYear = profile.currentAcademicYear || ACADEMIC_YEARS[ACADEMIC_YEARS.length-1];
      const studentCurrentSemester = profile.currentSemester || SEMESTERS[0];
      setCurrentPeriodDisplay(`${studentCurrentSemester}, ${studentCurrentYear}`);

      const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
      let studentRegisteredCourseIds: string[] = [];
      if (storageKey && typeof window !== 'undefined') {
        const storedIds = localStorage.getItem(storageKey);
        if (storedIds) {
          try {
            const parsedIds = JSON.parse(storedIds);
            if (Array.isArray(parsedIds)) studentRegisteredCourseIds = parsedIds;
          } catch (e) {
            console.error("Failed to parse registered courses from localStorage for timetable:", e);
          }
        }
      }
      
      // Find the full course objects for the registered IDs
      const registeredCoursesFull = MOCK_ALL_COURSES_TIMETABLE.filter(course => studentRegisteredCourseIds.includes(course.id));
      
      // Filter these for the student's current academic period
      const relevantRegisteredCourses = registeredCoursesFull.filter(course => 
        course.academicYear === studentCurrentYear &&
        course.semester === studentCurrentSemester &&
        course.department === profile.department && // Assuming timetable is department-specific
        course.level === profile.level
      );

      const generatedEntries: TimetableEntry[] = [];
      relevantRegisteredCourses.forEach(course => {
        generatedEntries.push(...parseScheduleToTimetableEntries(course));
      });

      // Sort entries by start time within each day (already grouped later)
      generatedEntries.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek);
        return a.startTime.localeCompare(b.startTime);
      });
      
      setTimetableEntries(generatedEntries);
      setIsLoading(false);
    }

    loadTimetable();
  }, [user?.uid, profile, authLoading]);

  const groupedTimetable = useMemo(() => {
    const groups: Record<string, TimetableEntry[]> = {};
    DAYS_OF_WEEK.forEach(day => groups[day] = []); // Initialize all days

    timetableEntries.forEach(entry => {
      if (!groups[entry.dayOfWeek]) {
        groups[entry.dayOfWeek] = [];
      }
      groups[entry.dayOfWeek].push(entry);
    });
    return groups;
  }, [timetableEntries]);


  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-4">
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <CalendarDays className="h-6 w-6 text-primary" />
            My Timetable
          </CardTitle>
          <CardDescription>
            Your class schedule for {currentPeriodDisplay}. 
            This timetable is based on your registered courses for the current academic period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timetableEntries.length === 0 && !isLoading ? (
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">No Classes Scheduled</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                There are no classes found in your timetable for the current academic period ({currentPeriodDisplay}). 
                This could be because you haven't registered for courses, or the timetable for your registered courses hasn't been published yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map(day => {
                const dayEntries = groupedTimetable[day];
                if (!dayEntries || dayEntries.length === 0) return null;

                return (
                  <div key={day}>
                    <h3 className="font-semibold text-xl mb-3 text-primary border-b pb-2">{day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayEntries.map(entry => (
                        <Card key={entry.id} className="shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-accent" />
                              {entry.courseCode}
                            </CardTitle>
                            <CardDescription>{entry.courseTitle}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-1 text-sm">
                            <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> {entry.startTime} - {entry.endTime}</p>
                            <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" /> {entry.venue}</p>
                            {entry.lecturerName && <p className="flex items-center gap-1.5 text-muted-foreground"><UserCircle className="h-4 w-4" /> {entry.lecturerName}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

```