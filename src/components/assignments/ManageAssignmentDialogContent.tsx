
"use client";

import type { Assignment } from "@/types";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Edit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ManageAssignmentDialogContentProps {
  currentAssignmentToEdit: Assignment | null;
  newAssignmentTitle: string;
  setNewAssignmentTitle: (title: string) => void;
  newAssignmentInstructions: string;
  setNewAssignmentInstructions: (instructions: string) => void;
  newAssignmentDueDate: Date | undefined;
  setNewAssignmentDueDate: (date: Date | undefined) => void;
  newAssignmentMaxScore: number | string;
  setNewAssignmentMaxScore: (score: number | string) => void;
  newAssignmentFileTypes: string;
  setNewAssignmentFileTypes: (types: string) => void;
  newAssignmentResourceFile: File | null;
  handleAssignmentResourceFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSavingAssignment: boolean;
  handleSaveAssignment: () => Promise<void>;
  onClose: () => void;
}

function formatFileSize(bytes: number | undefined, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ManageAssignmentDialogContent({
  currentAssignmentToEdit, newAssignmentTitle, setNewAssignmentTitle,
  newAssignmentInstructions, setNewAssignmentInstructions, newAssignmentDueDate, setNewAssignmentDueDate,
  newAssignmentMaxScore, setNewAssignmentMaxScore, newAssignmentFileTypes, setNewAssignmentFileTypes,
  newAssignmentResourceFile, handleAssignmentResourceFileChange, isSavingAssignment,
  handleSaveAssignment, onClose
}: ManageAssignmentDialogContentProps) {

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl">{currentAssignmentToEdit ? `Edit Assignment: ${currentAssignmentToEdit.title}` : "Create New Assignment"}</DialogTitle>
        <DialogDescription>{currentAssignmentToEdit ? "Update the details for this assignment." : "Define the details for the new assignment."}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="assignment-title-dialog">Title <span className="text-destructive">*</span></Label>
          <Input id="assignment-title-dialog" value={newAssignmentTitle} onChange={(e) => setNewAssignmentTitle(e.target.value)} placeholder="e.g., Essay on Algorithms" />
        </div>
        <div>
          <Label htmlFor="assignment-instructions-dialog">Instructions/Description</Label>
          <Textarea id="assignment-instructions-dialog" value={newAssignmentInstructions} onChange={(e) => setNewAssignmentInstructions(e.target.value)} placeholder="Detailed instructions for the assignment..." rows={5}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignment-due-date-dialog">Due Date <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="assignment-due-date-dialog" variant={"outline"} className={cn("w-full justify-start text-left font-normal",!newAssignmentDueDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newAssignmentDueDate ? format(newAssignmentDueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={newAssignmentDueDate} onSelect={setNewAssignmentDueDate} initialFocus disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="assignment-max-score-dialog">Max Score</Label>
            <Input id="assignment-max-score-dialog" type="number" value={newAssignmentMaxScore} onChange={(e) => setNewAssignmentMaxScore(e.target.value)} placeholder="e.g., 100" />
          </div>
        </div>
        <div>
          <Label htmlFor="assignment-file-types-dialog">Allowed File Types (Optional)</Label>
          <Input id="assignment-file-types-dialog" value={newAssignmentFileTypes} onChange={(e) => setNewAssignmentFileTypes(e.target.value)} placeholder="e.g., .pdf,.docx,.zip" />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated list of extensions (e.g., .pdf,.docx).</p>
        </div>
        {!currentAssignmentToEdit && (
          <div>
            <Label htmlFor="assignment-resource-file-dialog">Upload Resource File (Optional)</Label>
            <Input 
              id="assignment-resource-file-dialog" 
              type="file" 
              onChange={handleAssignmentResourceFileChange} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {newAssignmentResourceFile ? `Selected: ${newAssignmentResourceFile.name} (${formatFileSize(newAssignmentResourceFile.size)})` : "Max 20MB. Students can download this file."}
            </p>
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
        <Button type="button" onClick={handleSaveAssignment} disabled={isSavingAssignment}>
          {isSavingAssignment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentAssignmentToEdit ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
          {currentAssignmentToEdit ? "Save Changes" : "Create Assignment"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}


    