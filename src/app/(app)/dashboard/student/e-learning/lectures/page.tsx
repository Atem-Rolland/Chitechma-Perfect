
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video as VideoIconLucide, PlayCircle, Clock, Search, Filter, Download, AlertTriangle, ExternalLink, Globe } from "lucide-react"; // Renamed to avoid conflict
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";

interface VideoLecture {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; 
  duration: string; 
  uploadDate: string; 
  sourceType?: "Google Classroom" | "CUSMS Platform";
  sourceDetails?: string; // e.g., "GC: Intro to CS - Section A" or a direct link
  classroomLink?: string; // Specific link for "Open in Classroom" button
}

const MOCK_ENROLLED_COURSES_LECTURES = [
  { id: "CSE301", name: "Introduction to Algorithms (CSE301)" },
  { id: "MTH201", name: "Calculus I (MTH201)" },
  { id: "CSE401", name: "Mobile Application Development (CSE401)" },
  { id: "GCL001", name: "Google Classroom Integrated Course (GCL001)"}
];

const MOCK_VIDEO_LECTURES: VideoLecture[] = [
  {
    id: "lec1_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Lecture 1: Asymptotic Notation & Analysis",
    description: "A deep dive into Big O, Big Omega, and Big Theta notations. Understanding how to analyze algorithm efficiency and compare different approaches. Includes examples with common sorting algorithms.",
    thumbnailUrl: "https://placehold.co/600x400.png",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
    duration: "55:10", uploadDate: "2024-09-05",
    sourceType: "CUSMS Platform",
  },
  {
    id: "lec2_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Lecture 2: Divide and Conquer",
    description: "Exploring the divide and conquer paradigm with examples like Merge Sort and Quick Sort. Discussion on recurrence relations.",
    thumbnailUrl: "https://placehold.co/600x400.png",
    videoUrl: "https://www.youtube.com/embed/rokGy0huYEA", 
    duration: "48:30", uploadDate: "2024-09-12",
    sourceType: "CUSMS Platform",
  },
  {
    id: "lec1_gcl001", courseId: "GCL001", courseCode: "GCL001", courseName: "Google Classroom Integrated Course",
    title: "Intro to AI Ethics (from Google Classroom)",
    description: "An introductory lecture on AI Ethics, sourced from Google Classroom. Covers key concepts and case studies provided in the linked Classroom material.",
    thumbnailUrl: "https://placehold.co/600x400.png?text=GC+Lecture",
    videoUrl: "https://placehold.co/1280x720.png?text=Video+from+Google+Classroom", // Placeholder for actual classroom video/resource
    duration: "42:15", uploadDate: "2024-09-10",
    sourceType: "Google Classroom",
    sourceDetails: "AI Ethics - Fall 2024 (Section B)",
    classroomLink: "https://classroom.google.com/c/YOUR_CLASS_ID/m/YOUR_MATERIAL_ID" // Example placeholder link
  },
  {
    id: "lec1_mth201", courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I",
    title: "Lecture 1: Introduction to Limits",
    description: "Understanding the concept of limits, limit laws, and evaluating limits graphically and algebraically.",
    thumbnailUrl: "https://placehold.co/600x400.png",
    videoUrl: "https://www.youtube.com/embed/jcKxX3k9q9k", 
    duration: "01:02:15", uploadDate: "2024-09-06",
    sourceType: "CUSMS Platform",
  },
  {
    id: "lec1_cse401", courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development",
    title: "Lecture 1: Android Development Setup",
    description: "Setting up Android Studio, understanding project structure, and building your first 'Hello World' app.",
    thumbnailUrl: "https://placehold.co/600x400.png",
    videoUrl: "https://www.youtube.com/embed/fis26HvvDII", 
    duration: "35:50", uploadDate: "2024-09-10",
    sourceType: "CUSMS Platform",
  },
   {
    id: "lec3_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Lecture 3: Dynamic Programming Basics",
    description: "Introduction to dynamic programming concepts, memoization, and tabulation. Example: Fibonacci sequence.",
    thumbnailUrl: "https://placehold.co/600x400.png",
    videoUrl: "https://www.youtube.com/embed/oBt53YbR9Kk", 
    duration: "01:10:00", uploadDate: "2024-09-19",
    sourceType: "CUSMS Platform",
  },
];

export default function VideoLecturesPage() {
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<VideoLecture | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setLectures(MOCK_VIDEO_LECTURES);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredLectures = useMemo(() => {
    return lectures
      .filter(lecture => selectedCourseId === "all" || lecture.courseId === selectedCourseId)
      .filter(lecture => lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) || lecture.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [lectures, selectedCourseId, searchTerm]);

  const handleOpenViewDialog = (lecture: VideoLecture) => {
    setSelectedLecture(lecture);
    setIsViewDialogOpen(true);
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
                        <Skeleton className="h-40 w-full" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6 mt-1" />
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
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <VideoIconLucide className="h-6 w-6 text-primary" />
            Video Lectures
          </CardTitle>
          <CardDescription>Watch recorded lectures and online classes. Filter by course or search by title/description. Some lectures may be sourced from Google Classroom.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow sm:max-w-xs">
                    <label htmlFor="course-filter-lectures" className="sr-only">Filter by Course</label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger id="course-filter-lectures">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Filter by course..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {MOCK_ENROLLED_COURSES_LECTURES.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search lectures by title or description..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

          {filteredLectures.length === 0 ? (
             <div className="text-center py-10">
                <Image src="https://placehold.co/300x200.png" alt="No lectures found" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state video education" />
                <h3 className="text-xl font-semibold">No Lectures Found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search term.
                </p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLectures.map(lecture => (
                <Card key={lecture.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <Image 
                        src={lecture.thumbnailUrl} 
                        alt={lecture.title} 
                        width={400} 
                        height={225} 
                        className="object-cover w-full h-48" 
                        data-ai-hint="lecture video thumbnail" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">{lecture.courseCode}</Badge>
                    {lecture.sourceType === "Google Classroom" && (
                       <Badge variant="secondary" className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs">
                         <Globe className="h-3 w-3 mr-1"/> Google Classroom
                       </Badge>
                    )}
                  </div>
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg leading-tight">{lecture.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground pt-1">
                      {lecture.courseName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                     <p className="flex items-center gap-1"><Clock className="h-3 w-3"/>Duration: {lecture.duration}</p>
                     <p className="flex items-center gap-1 mt-1">Uploaded: {lecture.uploadDate}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleOpenViewDialog(lecture)}>
                      <PlayCircle className="mr-2 h-5 w-5" /> Watch Lecture
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLecture && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedLecture.title}</DialogTitle>
              <DialogDescription>
                {selectedLecture.courseName} - {selectedLecture.duration}
                {selectedLecture.sourceType === "Google Classroom" && (
                  <span className="block text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Sourced from Google Classroom: {selectedLecture.sourceDetails || "N/A"}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedLecture.videoUrl.includes("youtube.com/embed") ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={selectedLecture.videoUrl} 
                        title={selectedLecture.title} 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        className="border-0"
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white">
                        {selectedLecture.sourceType === "Google Classroom" ? (
                             <p className="text-center p-4">
                                <Globe className="h-12 w-12 mx-auto mb-2 text-yellow-400"/>
                                This content is from Google Classroom.<br/>
                                <Button 
                                    variant="outline" 
                                    className="mt-4 text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                                    onClick={() => {
                                        if (selectedLecture.classroomLink && selectedLecture.classroomLink !== "#") {
                                            window.open(selectedLecture.classroomLink, '_blank', 'noopener,noreferrer');
                                        } else {
                                            toast({ title: "Link Unavailable", description: "The direct link to this Google Classroom resource is not available in this demo."})
                                        }
                                    }}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4"/> Open in Google Classroom
                                </Button>
                             </p>
                        ) : (
                           <Image src={selectedLecture.videoUrl || "https://placehold.co/1280x720.png"} alt="Video placeholder" width={1280} height={720} className="w-full h-full object-cover" data-ai-hint="video player placeholder"/>
                        )}
                    </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mt-2 mb-1 text-lg">Lecture Description:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedLecture.description}</p>
              </div>
               <p className="text-xs text-muted-foreground">Uploaded on: {selectedLecture.uploadDate}</p>
            </div>
            <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
               <div className="flex gap-2 flex-wrap">
                {selectedLecture.sourceType === "Google Classroom" && selectedLecture.classroomLink && selectedLecture.classroomLink !== "#" && (
                    <Button 
                        variant="outline"
                        onClick={() => window.open(selectedLecture.classroomLink!, '_blank', 'noopener,noreferrer')}
                    >
                        <ExternalLink className="mr-2 h-4 w-4"/> Open in Google Classroom
                    </Button>
                )}
                 <Button variant="outline" onClick={() => toast({ title: "Simulated Download", description: `Preparing to download ${selectedLecture.title}... (Feature under development)`})}>
                    <Download className="mr-2 h-4 w-4" /> Download Lecture (Simulated)
                </Button>
               </div>
              <DialogClose asChild>
                <Button type="button" variant="default">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}

    
