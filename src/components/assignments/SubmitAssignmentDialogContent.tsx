
"use client";

import type { Assignment } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface SubmitAssignmentDialogContentProps {
  currentAssignment: Assignment;
  submissionText: string;
  setSubmissionText: (text: string) => void;
  submissionFile: File | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitAssignment: () => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export default function SubmitAssignmentDialogContent({
  currentAssignment,
  submissionText,
  setSubmissionText,
  submissionFile,
  handleFileChange,
  handleSubmitAssignment,
  isLoading,
  onClose
}: SubmitAssignmentDialogContentProps) {
  if (!currentAssignment) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Submit: {currentAssignment.title}</DialogTitle>
        <DialogDescription>
          For {currentAssignment.courseName}. Due: {format(parseISO(currentAssignment.dueDate), "PPP p")}
          {currentAssignment.status === "Submitted" && <span className="block text-amber-600 dark:text-amber-400 text-xs mt-1">You are resubmitting this assignment. The previous submission will be overwritten.</span>}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div>
          <Label htmlFor="submission-text">Your Response (Optional)</Label>
          <Textarea
            id="submission-text"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Type any comments or your text-based submission here..."
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="submission-file">Attach File (Optional)</Label>
          <Input
            id="submission-file"
            type="file"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {submissionFile && <p className="text-xs text-muted-foreground mt-1">Selected: {submissionFile.name}</p>}
          <p className="text-xs text-muted-foreground mt-1">Max file size: 10MB. Allowed types: {currentAssignment.allowedFileTypes || "Any"}</p>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={handleSubmitAssignment} disabled={isLoading}>
          {isLoading ? <UploadCloud className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {currentAssignment.status === "Submitted" ? "Resubmit Assignment" : "Submit Assignment"}
        </Button>
      </DialogFooter>
    </>
  );
}
