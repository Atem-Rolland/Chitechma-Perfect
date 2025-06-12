
"use client";

import type { Assignment } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import type { useToast } from "@/hooks/use-toast"; // Import the hook type

interface ViewSubmissionDialogContentProps {
  currentAssignment: Assignment;
  toast: ReturnType<typeof useToast>['toast']; // Use the return type of the hook call
  onClose: () => void;
}

export default function ViewSubmissionDialogContent({
  currentAssignment,
  toast,
  onClose
}: ViewSubmissionDialogContentProps) {
  if (!currentAssignment) return null;

  const getStatusBadgeVariant = (status: Assignment["status"], dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status === "Pending Submission";
    if (status === "Graded") return "success";
    if (status === "Submitted") return "default";
    if (status === "Pending Submission" && isOverdue) return "destructive";
    if (status === "Late") return "destructive";
    return "outline";
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{currentAssignment.title}</DialogTitle>
        <DialogDescription>Details for your submission to {currentAssignment.courseName}.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3 max-h-[60vh] overflow-y-auto">
        <p><strong>Description:</strong> {currentAssignment.description}</p>
        <p><strong>Due Date:</strong> {format(parseISO(currentAssignment.dueDate), "PPP p")}</p>
        <p><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(currentAssignment.status, currentAssignment.dueDate)} className={cn(currentAssignment.status === "Graded" && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300", currentAssignment.status === "Submitted" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300")}>{currentAssignment.status}</Badge></p>

        {currentAssignment.submissionDate && (
          <p><strong>Submitted On:</strong> {format(parseISO(currentAssignment.submissionDate), "PPP p")}</p>
        )}

        {currentAssignment.submittedText && (
          <div>
            <h4 className="font-semibold mt-2">Your Text Submission:</h4>
            <p className="p-2 bg-muted rounded-md text-sm whitespace-pre-wrap">{currentAssignment.submittedText}</p>
          </div>
        )}
        {currentAssignment.submittedFile && (
           <div>
              <h4 className="font-semibold mt-2">Your Submitted File:</h4>
               <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Download className="h-5 w-5 text-primary"/>
                  <span>{currentAssignment.submittedFile.name} ({(currentAssignment.submittedFile.size / 1024).toFixed(1)} KB)</span>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toast({title: "Simulated Download", description: `Downloading ${currentAssignment.submittedFile?.name}...`})}>Download</Button>
              </div>
          </div>
        )}

        {currentAssignment.status === "Graded" && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="font-semibold text-lg text-primary">Feedback & Grade</h4>
            <p><strong>Grade:</strong> <span className="font-bold text-green-600 dark:text-green-400">{currentAssignment.grade}</span></p>
            {currentAssignment.feedback && (
              <div>
                <h5 className="font-semibold mt-1">Lecturer's Feedback:</h5>
                <p className="p-2 bg-secondary rounded-md text-sm whitespace-pre-wrap">{currentAssignment.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  );
}
