
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, UserCircle, BookOpen, Info, Download, PresentationIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import type { Course, TimetableEntry } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES } from "@/config/data"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function parseScheduleToTimetableEntries(course: Course): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  if (!course.schedule) return entries;

  // Improved parsing: DayOfWeek StartTime-EndTime, Venue (optional)
  // Example: "Mon 10:00-12:00 Lab Hall 1, Wed 10:00-11:00 Lab Hall 1"
  // Example: "Tue 14:00-16:00, Fri 8:00-9:00, AMPHI200"
  // Example: "Wed 14:00-17:00 AMPHI200" (Venue applies to all if at the end)
  
  const scheduleParts = course.schedule.split(',').map(s => s.trim());
  let commonVenue = "TBD";

  // Check if the last part is likely a venue applying to all previous time slots
  const lastPart = scheduleParts[scheduleParts.length - 1];
  if (lastPart && !lastPart.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat)\b/i) && !lastPart.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)) {
    commonVenue = scheduleParts.pop() || "TBD";
  }

  scheduleParts.forEach((part, index) => {
    const dayMatch = part.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
    const timeMatch = part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    
    if (dayMatch && timeMatch) {
      const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' } as const;
      const dayOfWeek = dayMap[dayMatch[1] as keyof typeof dayMap];
      
      // Extract venue specific to this part, if any, otherwise use commonVenue
      let specificVenue = commonVenue;
      const venuePartMatch = part.substring(timeMatch[0].length + dayMatch[0].length).trim();
      if (venuePartMatch) {
        specificVenue = venuePartMatch;
      }

      if (dayOfWeek) {
        entries.push({
          id: `${course.id}-slot${index + 1}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          dayOfWeek: dayOfWeek,
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          venue: specificVenue,
          lecturerName: course.lecturerName,
          semester: course.semester,
          academicYear: course.academicYear,
        });
      }
    } else if (part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/) && entries.length > 0) {
        // Handle cases like "Mon 8:00-9:00, 10:00-11:00 CR10"
        // This implies the same day and potentially same venue for the subsequent time slot
        const previousEntry = entries[entries.length - 1];
        const subsequentTimeMatch = part.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        const venuePartMatch = part.substring(subsequentTimeMatch ? subsequentTimeMatch[0].length : 0).trim();
        
        if (subsequentTimeMatch) {
             entries.push({
                ...previousEntry,
                id: `${course.id}-slot${index + 1}`,
                startTime: subsequentTimeMatch[1],
                endTime: subsequentTimeMatch[2],
                venue: venuePartMatch || previousEntry.venue // Use new venue if specified, else previous
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
  const { toast } = useToast();

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
      
      const studentCurrentYear = profile.currentAcademicYear || ACADEMIC_YEARS[2]; 
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
      
      const registeredCoursesFull = ALL_UNIVERSITY_COURSES.filter(course => 
          studentRegisteredCourseIds.includes(course.id)
      );
      
      const relevantRegisteredCourses = registeredCoursesFull.filter(course => 
        course.academicYear === studentCurrentYear &&
        course.semester === studentCurrentSemester &&
        course.department === profile.department && 
        course.level === profile.level
      );

      const generatedEntries: TimetableEntry[] = [];
      relevantRegisteredCourses.forEach(course => {
        generatedEntries.push(...parseScheduleToTimetableEntries(course));
      });

      generatedEntries.sort((a, b) => {
        if (DAYS_OF_WEEK.indexOf(a.dayOfWeek) !== DAYS_OF_WEEK.indexOf(b.dayOfWeek)) return DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek);
        return a.startTime.localeCompare(b.startTime);
      });
      
      setTimetableEntries(generatedEntries);
      setIsLoading(false);
    }

    loadTimetable();
  }, [user?.uid, profile, authLoading]);

  const groupedTimetable = useMemo(() => {
    const groups: Record<string, TimetableEntry[]> = {};
    DAYS_OF_WEEK.forEach(day => groups[day] = []); 

    timetableEntries.forEach(entry => {
      if (!groups[entry.dayOfWeek]) {
        groups[entry.dayOfWeek] = [];
      }
      groups[entry.dayOfWeek].push(entry);
    });
    return groups;
  }, [timetableEntries]);

  const handleDownloadSchedule = () => {
    const coursesForSchedule = timetableEntries.map(entry => `${entry.courseCode}: ${entry.dayOfWeek} ${entry.startTime}-${entry.endTime} at ${entry.venue}`).join('\n');
    toast({
      title: "Download Schedule (Simulated)",
      description: `PDF generation for your timetable (${currentPeriodDisplay}) is under development. Courses on schedule: ${timetableEntries.length > 0 ? timetableEntries.map(e => e.courseCode).join(', ') : 'None'}.`,
      duration: 7000,
    });
  };

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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <CalendarDays className="h-7 w-7 text-primary" />
                    My Timetable
                </CardTitle>
                <CardDescription>
                    Your class schedule for {currentPeriodDisplay}. 
                    This timetable is based on your registered courses for the current academic period.
                </CardDescription>
            </div>
            <Button onClick={handleDownloadSchedule} className="mt-4 sm:mt-0 w-full sm:w-auto" disabled={timetableEntries.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Download Schedule (PDF)
            </Button>
        </CardHeader>
        <CardContent>
          {timetableEntries.length === 0 && !isLoading ? (
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">No Classes Scheduled</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                There are no classes found in your timetable for the current academic period ({currentPeriodDisplay}). 
                This could be because you haven't registered for courses, the timetable for your registered courses hasn't been published yet, or courses have no schedule information.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-8">
              {DAYS_OF_WEEK.map(day => {
                const dayEntries = groupedTimetable[day];
                if (!dayEntries || dayEntries.length === 0) return null;

                return (
                  <div key={day}>
                    <h3 className="font-semibold text-xl md:text-2xl mb-4 text-foreground/90 border-b-2 border-primary pb-2">{day}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      {dayEntries.map(entry => (
                        <Card key={entry.id} className="shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                <PresentationIcon className="h-5 w-5 text-primary" />
                                {entry.courseCode}
                                </CardTitle>
                                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                                    {entry.startTime} - {entry.endTime}
                                </span>
                            </div>
                            <CardDescription className="text-sm">{entry.courseTitle}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-muted-foreground flex-grow">
                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {entry.venue}</p>
                            {entry.lecturerName && <p className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-accent" /> {entry.lecturerName}</p>}
                          </CardContent>
                           {/* Optional Footer for links or actions per entry */}
                           {/* <CardFooter className="pt-3">
                                <Button variant="link" size="sm" className="p-0 h-auto">View Details</Button>
                           </CardFooter> */}
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

