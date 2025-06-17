
"use client";
import type { MockCourseForum } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";

interface NewThreadDialogContentProps {
  courses: MockCourseForum[];
  newThreadCourseId: string;
  setNewThreadCourseId: (id: string) => void;
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  newThreadContent: string;
  setNewThreadContent: (content: string) => void;
  onPostNewThread: () => void;
  isLoading: boolean;
  onClose: () => void;
}

export default function NewThreadDialogContent({
  courses, newThreadCourseId, setNewThreadCourseId, newThreadTitle, setNewThreadTitle,
  newThreadContent, setNewThreadContent, onPostNewThread, isLoading, onClose
}: NewThreadDialogContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Start a New Discussion Thread</DialogTitle>
        <DialogDescription>Share your thoughts or ask a question.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div>
          <Label htmlFor="new-thread-course-dialog">Course</Label>
          <Select value={newThreadCourseId} onValueChange={setNewThreadCourseId}>
            <SelectTrigger id="new-thread-course-dialog">
              <SelectValue placeholder="Select course for thread" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="new-thread-title-dialog">Thread Title</Label>
          <Input id="new-thread-title-dialog" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} placeholder="Enter a clear and concise title" />
        </div>
        <div>
          <Label htmlFor="new-thread-content-dialog">Your Post</Label>
          <Textarea id="new-thread-content-dialog" value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)} placeholder="Compose your message..." rows={8} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={onPostNewThread} disabled={isLoading}>
         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} Post Thread
        </Button>
      </DialogFooter>
    </>
  );
}
