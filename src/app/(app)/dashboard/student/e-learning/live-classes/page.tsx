
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Presentation, CalendarDays, Clock, UserCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { LiveClass } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { format, parseISO, isPast, isFuture, formatDistanceToNowStrict } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const MOCK_ENROLLED_COURSES_LIVE = [
  { id: "CSE301", name: "Introduction to Algorithms (CSE301)" },
  { id: "MTH201", name: "Calculus I (MTH201)" },
  { id: "CSE401", name: "Mobile Application Development (CSE401)" },
];

const MOCK_LIVE_CLASSES: LiveClass[] = [
  {
    id: "live1_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Live Q&A: Recursion Deep Dive", lecturerName: "Dr. Ada Lovelace",
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    meetingLink: "https://meet.google.com/", durationMinutes: 60,
  },
  {
    id: "live2_cse401", courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development",
    title: "Workshop: Building Your First Android App", lecturerName: "Prof. Charles Babbage",
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    meetingLink: "https://meet.google.com/", durationMinutes: 90,
  },
  {
    id: "live3_mth201", courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I",
    title: "Problem Solving Session: Derivatives", lecturerName: "Dr. Alan Turing",
    dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (past)
    meetingLink: "https://meet.google.com/", durationMinutes: 75,
  },
  {
    id: "live4_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Guest Lecture: AI in Modern Algorithms", lecturerName: "Guest Speaker",
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    meetingLink: "https://meet.google.com/", durationMinutes: 60,
  },
];

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLiveClasses(MOCK_LIVE_CLASSES);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredAndSortedLiveClasses = useMemo(() => {
    return liveClasses
      .filter(lc => selectedCourseId === "all" || lc.courseId === selectedCourseId)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); // Sort by date
  }, [liveClasses, selectedCourseId]);

  const upcomingClasses = useMemo(() => {
    return filteredAndSortedLiveClasses.filter(lc => isFuture(parseISO(lc.dateTime)));
  }, [filteredAndSortedLiveClasses]);

  const pastClasses = useMemo(() => {
    return filteredAndSortedLiveClasses.filter(lc => isPast(parseISO(lc.dateTime))).reverse(); // Show most recent past first
  }, [filteredAndSortedLiveClasses]);

  const handleJoinClass = (meetingLink: string) => {
    window.open(meetingLink, '_blank', 'noopener,noreferrer');
    toast({
      title: "Joining Live Class...",
      description: "You are being redirected to the meeting.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
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
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Presentation className="h-6 w-6 text-primary" />
            Live Classes Schedule
          </CardTitle>
          <CardDescription>Join scheduled live lectures, Q&A sessions, and workshops. Links typically direct to Google Meet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-sm">
            <label htmlFor="course-filter-live-classes" className="sr-only">Filter by Course</label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger id="course-filter-live-classes">
                <SelectValue placeholder="Filter by course..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {MOCK_ENROLLED_COURSES_LIVE.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {upcomingClasses.length === 0 && pastClasses.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <Image src="https://placehold.co/300x200.png" alt="No live classes" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty calendar event" />
              <h3 className="text-xl font-semibold">No Live Classes Scheduled</h3>
              <p className="text-muted-foreground mt-1">
                {selectedCourseId === "all" ? "There are currently no live classes scheduled." : `No live classes found for ${MOCK_ENROLLED_COURSES_LIVE.find(c => c.id === selectedCourseId)?.name || 'the selected course'}.`}
              </p>
            </div>
          )}

          {upcomingClasses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Upcoming Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingClasses.map(lc => (
                  <Card key={lc.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">{lc.title}</CardTitle>
                      <CardDescription className="text-xs text-primary font-medium pt-0.5">{lc.courseName} ({lc.courseCode})</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1.5 flex-grow">
                      <p className="flex items-center gap-1.5 text-muted-foreground"><UserCircle className="h-4 w-4"/>Lecturer: {lc.lecturerName}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="h-4 w-4"/>Date: {format(parseISO(lc.dateTime), "EEEE, MMM dd, yyyy")}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4"/>Time: {format(parseISO(lc.dateTime), "p")} ({formatDistanceToNowStrict(parseISO(lc.dateTime), { addSuffix: true })})</p>
                      {lc.durationMinutes && <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4"/>Duration: {lc.durationMinutes} minutes</p>}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleJoinClass(lc.meetingLink)}>
                        <ExternalLink className="mr-2 h-4 w-4"/> Join Live Class
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pastClasses.length > 0 && (
             <div>
              <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground/90">Past Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastClasses.map(lc => (
                  <Card key={lc.id} className="opacity-70 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">{lc.title}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground pt-0.5">{lc.courseName} ({lc.courseCode})</CardDescription>
                    </CardHeader>
                     <CardContent className="text-sm space-y-1.5 flex-grow">
                      <p className="flex items-center gap-1.5 text-muted-foreground"><UserCircle className="h-4 w-4"/>Lecturer: {lc.lecturerName}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="h-4 w-4"/>Date: {format(parseISO(lc.dateTime), "EEEE, MMM dd, yyyy")}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4"/>Time: {format(parseISO(lc.dateTime), "p")}</p>
                      {lc.durationMinutes && <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4"/>Duration: {lc.durationMinutes} minutes</p>}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline" disabled>
                        Session Ended
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}
