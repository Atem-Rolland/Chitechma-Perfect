
"use client";

import type { Grade } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface GradeDetailDialogContentProps {
  selectedGrade: Grade;
}

export default function GradeDetailDialogContent({ selectedGrade }: GradeDetailDialogContentProps) {
  if (!selectedGrade) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-xl">{selectedGrade.courseCode} - {selectedGrade.courseName}</DialogTitle>
        <DialogDescription>
          {selectedGrade.isPublished
            ? `Detailed score breakdown for ${selectedGrade.semester}, ${selectedGrade.academicYear}`
            : "Results for this course are pending publication."}
        </DialogDescription>
      </DialogHeader>
      {selectedGrade.isPublished ? (
        <div className="space-y-3 py-2 text-sm">
          <h4 className="font-semibold text-md text-primary border-b pb-1 mb-2">Continuous Assessment (CA) - Max 30</h4>
          {selectedGrade.caDetails ? (
            <>
              <div className="flex justify-between"><span>Assignments:</span> <span>{selectedGrade.caDetails.assignments ?? 'N/A'} / 5</span></div>
              <div className="flex justify-between"><span>Group Work:</span> <span>{selectedGrade.caDetails.groupWork ?? 'N/A'} / 5</span></div>
              <div className="flex justify-between"><span>Attendance:</span> <span>{selectedGrade.caDetails.attendance ?? 'N/A'} / 5</span></div>
              <div className="flex justify-between"><span>Written CA:</span> <span>{selectedGrade.caDetails.writtenCA ?? 'N/A'} / 15</span></div>
              <div className="flex justify-between font-semibold pt-1 border-t mt-1"><span>Total CA Score:</span> <span>{selectedGrade.caDetails.totalCaScore ?? 'N/A'} / 30</span></div>
            </>
          ) : <p className="text-muted-foreground">No detailed CA marks available.</p>}

          <h4 className="font-semibold text-md text-primary border-b pb-1 mt-4 mb-2">Examination - Max 70</h4>
          <div className="flex justify-between"><span>Exam Score:</span> <span>{selectedGrade.examScore ?? 'N/A'} / 70</span></div>

          <div className="border-t pt-3 mt-3 space-y-1">
            <div className="flex justify-between text-md font-bold"><span className="text-foreground">Final Score:</span> <span>{selectedGrade.score} / 100</span></div>
            <div className="flex justify-between text-md font-bold"><span className="text-foreground">Grade Awarded:</span> <span className={!selectedGrade.isPass ? "text-destructive" : "text-green-600"}>{selectedGrade.gradeLetter} ({selectedGrade.remark})</span></div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-muted-foreground">
          <HelpCircle className="mx-auto h-10 w-10 mb-2" />
          Detailed scores are not available as results are pending publication.
        </div>
      )}
      <DialogClose asChild>
        <Button type="button" variant="outline">
          Close
        </Button>
      </DialogClose>
    </>
  );
}
