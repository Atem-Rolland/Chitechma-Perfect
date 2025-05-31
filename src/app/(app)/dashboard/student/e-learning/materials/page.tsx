
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderArchive, FileText, Video, Download, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface CourseMaterial {
  id: string;
  name: string;
  type: "pdf" | "docx" | "video" | "zip" | "link";
  url?: string; // For actual download/link
  size?: string; // e.g., "2.5 MB"
  uploadDate?: string; // e.g., "2024-07-15"
}

interface MockCourse {
  id: string;
  name: string;
  materials: CourseMaterial[];
}

const mockEnrolledCourses: MockCourse[] = [
  {
    id: "CSE301",
    name: "Introduction to Algorithms (CSE301)",
    materials: [
      { id: "m1", name: "Syllabus_CSE301.pdf", type: "pdf", size: "1.2 MB", uploadDate: "2024-09-01" },
      { id: "m2", name: "Lecture Notes - Week 1.pdf", type: "pdf", size: "3.5 MB", uploadDate: "2024-09-05" },
      { id: "m3", name: "Introductory Video Lecture.mp4", type: "video", url: "#", size: "150 MB", uploadDate: "2024-09-06" },
      { id: "m4", name: "Problem Set 1.docx", type: "docx", size: "0.5 MB", uploadDate: "2024-09-10" },
    ],
  },
  {
    id: "MTH201",
    name: "Calculus I (MTH201)",
    materials: [
      { id: "m5", name: "Course Outline_MTH201.pdf", type: "pdf", size: "0.8 MB", uploadDate: "2024-09-02" },
      { id: "m6", name: "Chapter 1 - Limits.pdf", type: "pdf", size: "4.1 MB", uploadDate: "2024-09-08" },
      { id: "m7", name: "Practice Exercises.zip", type: "zip", size: "10.2 MB", uploadDate: "2024-09-15" },
    ],
  },
  {
    id: "PHY205",
    name: "General Physics I (PHY205)",
    materials: [], // No materials for this course yet
  },
   {
    id: "CSE401",
    name: "Mobile Application Development (CSE401)",
    materials: [
      { id: "m8", name: "MAD_Syllabus_2024.pdf", type: "pdf", size: "1.5 MB", uploadDate: "2024-09-01" },
      { id: "m9", name: "Lecture 1 - Intro to Android.pdf", type: "pdf", size: "5.2 MB", uploadDate: "2024-09-07" },
      { id: "m10", name: "Setup Guide for Android Studio.docx", type: "docx", size: "0.7 MB", uploadDate: "2024-09-07" },
      { id: "m11", name: "Useful Links and Resources.link", type: "link", url: "https://developer.android.com/docs", uploadDate: "2024-09-08" },
    ],
  },
];

function getFileIcon(type: CourseMaterial["type"]) {
  switch (type) {
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "docx": return <FileText className="h-5 w-5 text-blue-500" />;
    case "video": return <Video className="h-5 w-5 text-purple-500" />;
    case "zip": return <FolderArchive className="h-5 w-5 text-yellow-500" />;
    case "link": return <FileText className="h-5 w-5 text-green-500" />; // Or a Link icon if available
    default: return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function CourseMaterialsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { toast } = useToast();

  const selectedCourse = useMemo(() => {
    return mockEnrolledCourses.find(course => course.id === selectedCourseId);
  }, [selectedCourseId]);

  const handleDownload = (material: CourseMaterial) => {
    toast({
      title: "Download Started (Simulated)",
      description: `Downloading ${material.name}... (This is a placeholder action)`,
    });
    // In a real app, you'd trigger a download here, e.g. window.open(material.url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FolderArchive className="h-6 w-6 text-primary" />
            Course Materials
          </CardTitle>
          <CardDescription>Select a course to view and download its materials. In a real application, these files would be sourced from Firebase Storage or a similar backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="course-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Course</label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger id="course-select" aria-label="Select course">
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {mockEnrolledCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourseId && selectedCourse ? (
            selectedCourse.materials.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Size</TableHead>
                      <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCourse.materials.map(material => (
                      <TableRow key={material.id}>
                        <TableCell className="text-center">{getFileIcon(material.type)}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{material.size || "N/A"}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{material.uploadDate || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          {material.type === 'link' && material.url ? (
                             <Button variant="outline" size="sm" asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  Open Link <Download className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleDownload(material)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <Image src="https://placehold.co/300x200.png" alt="No materials" width={150} height={100} className="mx-auto mb-4 rounded-lg opacity-70" data-ai-hint="empty state folder" />
                <h3 className="text-xl font-semibold text-muted-foreground">No Materials Available</h3>
                <p className="text-muted-foreground mt-1">There are no materials uploaded for {selectedCourse.name} yet.</p>
              </div>
            )
          ) : selectedCourseId ? (
             <div className="text-center py-10 px-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground">Course Not Found</h3>
                <p className="text-muted-foreground mt-1">The selected course details could not be loaded. Please try again.</p>
              </div>
          ) : (
            <div className="text-center py-10 px-4">
                <Image src="https://placehold.co/300x200.png" alt="Select a course" width={150} height={100} className="mx-auto mb-4 rounded-lg opacity-70" data-ai-hint="education select" />
                <h3 className="text-xl font-semibold text-muted-foreground">Select a Course</h3>
                <p className="text-muted-foreground mt-1">Please choose a course from the dropdown to view its materials.</p>
              </div>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: Download functionality is simulated. Files are mock data for demonstration.
            </p>
         </CardFooter>
      </Card>
    </motion.div>
  );
}

    