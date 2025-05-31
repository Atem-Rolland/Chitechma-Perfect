
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderArchive, FileText, Video as VideoIcon, Download, AlertTriangle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface CourseMaterial {
  id: string;
  name: string;
  type: "pdf" | "docx" | "video" | "zip" | "link";
  url?: string; // For actual download/link (especially for type 'link')
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
      { id: "m1", name: "Syllabus_CSE301.pdf", type: "pdf", size: "1.2 MB", uploadDate: "2024-09-01", url: "#simulated-download-syllabus" },
      { id: "m2", name: "Lecture Notes - Week 1.pdf", type: "pdf", size: "3.5 MB", uploadDate: "2024-09-05", url: "#simulated-download-week1-notes" },
      { id: "m3", name: "Introductory Video Lecture (External Link)", type: "link", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", uploadDate: "2024-09-06" },
      { id: "m4", name: "Problem Set 1.docx", type: "docx", size: "0.5 MB", uploadDate: "2024-09-10", url: "#simulated-download-pset1" },
      { id: "m12", name: "Course Project Files.zip", type: "zip", size: "12.7 MB", uploadDate: "2024-10-01", url: "#simulated-download-project-files"},
    ],
  },
  {
    id: "MTH201",
    name: "Calculus I (MTH201)",
    materials: [
      { id: "m5", name: "Course Outline_MTH201.pdf", type: "pdf", size: "0.8 MB", uploadDate: "2024-09-02", url: "#simulated-download-mth-outline" },
      { id: "m6", name: "Chapter 1 - Limits.pdf", type: "pdf", size: "4.1 MB", uploadDate: "2024-09-08", url: "#simulated-download-ch1-limits" },
      { id: "m7", name: "Practice Exercises.zip", type: "zip", size: "10.2 MB", uploadDate: "2024-09-15", url: "#simulated-download-mth-exercises" },
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
      { id: "m8", name: "MAD_Syllabus_2024.pdf", type: "pdf", size: "1.5 MB", uploadDate: "2024-09-01", url: "#simulated-download-mad-syllabus" },
      { id: "m9", name: "Lecture 1 - Intro to Android.pdf", type: "pdf", size: "5.2 MB", uploadDate: "2024-09-07", url: "#simulated-download-mad-lec1" },
      { id: "m10", name: "Setup Guide for Android Studio.docx", type: "docx", size: "0.7 MB", uploadDate: "2024-09-07", url: "#simulated-download-mad-setup" },
      { id: "m11", name: "Official Android Developer Docs", type: "link", url: "https://developer.android.com/docs", uploadDate: "2024-09-08" },
    ],
  },
];

function getFileIcon(type: CourseMaterial["type"]) {
  switch (type) {
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "docx": return <FileText className="h-5 w-5 text-blue-500" />;
    case "video": return <VideoIcon className="h-5 w-5 text-purple-500" />;
    case "zip": return <FolderArchive className="h-5 w-5 text-orange-500" />;
    case "link": return <ExternalLink className="h-5 w-5 text-green-500" />;
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
    if (material.type === 'link' && material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Download Started (Simulated)",
        description: `Downloading ${material.name}... (This is a placeholder action. Actual files would be served from Supabase Storage or similar).`,
      });
      // In a real app with Supabase:
      // const { data, error } = await supabase.storage.from('materials-bucket').download(material.url); // Assuming material.url is the path in bucket
      // if (error) throw error;
      // const blob = new Blob([data]);
      // const link = document.createElement('a');
      // link.href = URL.createObjectURL(blob);
      // link.download = material.name;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    }
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
          <CardDescription>Select a course to view and download its materials. In a real application, these files would be sourced from a secure storage like Supabase.</CardDescription>
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
                          <Button variant="outline" size="sm" onClick={() => handleDownload(material)}>
                            {material.type === 'link' ? <ExternalLink className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                            {material.type === 'link' ? 'Open Link' : 'Download'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <Image src="https://placehold.co/300x200.png" alt="No materials" width={150} height={100} className="mx-auto mb-4 rounded-lg opacity-70" data-ai-hint="empty folder education" />
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
                <Image src="https://placehold.co/300x200.png" alt="Select a course" width={150} height={100} className="mx-auto mb-4 rounded-lg opacity-70" data-ai-hint="education select course" />
                <h3 className="text-xl font-semibold text-muted-foreground">Select a Course</h3>
                <p className="text-muted-foreground mt-1">Please choose a course from the dropdown to view its materials.</p>
              </div>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: Download functionality is simulated for files. External links will open directly. In a production app, files would be securely served from cloud storage.
            </p>
         </CardFooter>
      </Card>
    </motion.div>
  );
}

    