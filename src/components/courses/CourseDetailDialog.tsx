
"use client";

import type { Course } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CourseDetailDialogProps {
  course: Course | null;
  allCourses: Course[]; // For resolving prerequisite names
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CourseDetailDialog({ course, allCourses, open, onOpenChange }: CourseDetailDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{course.code} - {course.title}</DialogTitle>
          <DialogDescription>Level {course.level} - {course.credits} Credits - {course.type}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-sm">
          <p><strong>Department:</strong> {course.department}</p>
          <p><strong>Lecturer:</strong> {course.lecturerName || "N/A"}</p>
          <p><strong>Description:</strong> {course.description}</p>
          <p><strong>Semester:</strong> {course.semester}, {course.academicYear}</p>
          {course.schedule && <p><strong>Schedule:</strong> {course.schedule}</p>}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <strong>Prerequisites:</strong>
              <ul className="list-disc list-inside ml-4">
                {course.prerequisites.map(prereqCode => {
                  const prereqCourse = allCourses.find(c => c.code === prereqCode);
                  return <li key={prereqCode}>{prereqCourse ? `${prereqCourse.code} - ${prereqCourse.title}` : prereqCode}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
