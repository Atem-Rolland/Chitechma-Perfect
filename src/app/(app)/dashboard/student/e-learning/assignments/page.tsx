
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Removed DialogHeader, DialogDescription, DialogClose, DialogFooter
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, UploadCloud, Eye, MessageCircle, CheckCircle, AlertTriangle, Clock, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect, Suspense } from "react"; // Added Suspense
import dynamic from 'next/dynamic'; // Added dynamic
import type { Assignment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { format, parseISO, isPast, differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { cn } from "@/lib/utils";

// Dynamically import dialog content components
const SubmitAssignmentDialogContent = dynamic(() => import('@/components/assignments/SubmitAssignmentDialogContent'), {
  suspense: true,
  loading: () => <div className="p-6 text-center">Loading form...</div>,
});
const ViewSubmissionDialogContent = dynamic(() => import('@/components/assignments/ViewSubmissionDialogContent'), {
  suspense: true,
  loading: () => <div className="p-6 text-center">Loading submission details...</div>,
});


// Mock data - in a real app, this would come from a backend
const MOCK_ENROLLED_COURSES = [
  { id: "CSE301", name: "Introduction to Algorithms (CSE301)" },
  { id: "MTH201", name: "Calculus I (MTH201)" },
  { id: "CSE401", name: "Mobile Application Development (CSE401)" },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign1_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Algorithm Analysis Essay", description: "Write a 5-page essay on the importance of Big O notation.",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "Pending Submission", allowsResubmission: true, maxScore: 100,
  },
  {
    id: "assign2_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Sorting Algorithms Implementation", description: "Implement Bubble Sort and Merge Sort in Python.",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "Submitted", submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Submitted 1 day before due
    submittedText: "Implemented both algorithms as requested. Code attached.",
    submittedFile: { name: "sorting_impl.zip", type: "application/zip", size: 1024 * 500 }, // 500KB
    maxScore: 100,
  },
  {
    id: "assign1_mth201", courseId: "MTH201", courseCode: "MTH201", courseName: "Calculus I",
    title: "Problem Set 1: Limits", description: "Complete exercises 1-10 from Chapter 2.",
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: "Graded", grade: "88/100 (A)", feedback: "Good work on the limit calculations. Pay attention to question 7's edge case.",
    submissionDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    submittedFile: { name: "problem_set_1.pdf", type: "application/pdf", size: 1024 * 1200 }, // 1.2MB
    maxScore: 100,
  },
  {
    id: "assign1_cse401", courseId: "CSE401", courseCode: "CSE401", courseName: "Mobile Application Development",
    title: "UI/UX Design Proposal", description: "Create a detailed UI/UX proposal for a new mobile app concept.",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    status: "Pending Submission", allowsResubmission: true, maxScore: 100,
  },
  {
    id: "assign3_cse301", courseId: "CSE301", courseCode: "CSE301", courseName: "Introduction to Algorithms",
    title: "Graph Traversal Quiz", description: "Online quiz covering BFS and DFS.",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Due yesterday
    status: "Late", allowsResubmission: false, maxScore: 20,
  },
];


export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false); // Simulate loading
  const { toast } = useToast();

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);

  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  useEffect(() => {
    // Simulate API call for assignments if needed, or filter based on user's courses
    // For now, we just use the mock data.
  }, []);

  const filteredAssignments = useMemo(() => {
    if (selectedCourseId === "all") {
      return assignments;
    }
    return assignments.filter(assign => assign.courseId === selectedCourseId);
  }, [assignments, selectedCourseId]);

  const handleOpenSubmitDialog = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setSubmissionText(assignment.status === "Submitted" ? assignment.submittedText || "" : "");
    setSubmissionFile(null); // Reset file input for new submission/resubmission
    setIsSubmitDialogOpen(true);
  };

  const handleOpenViewDialog = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 10MB." });
        return;
      }
      setSubmissionFile(file);
    } else {
      setSubmissionFile(null);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!currentAssignment) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setAssignments(prev => prev.map(assign =>
      assign.id === currentAssignment.id
      ? { ...assign,
          status: "Submitted" as const,
          submissionDate: new Date().toISOString(),
          submittedText: submissionText,
          submittedFile: submissionFile ? { name: submissionFile.name, type: submissionFile.type, size: submissionFile.size } : undefined,
        }
      : assign
    ));

    toast({ title: "Assignment Submitted", description: `${currentAssignment.title} has been submitted.`, variant: "default" });
    setIsLoading(false);
    setIsSubmitDialogOpen(false);
    setSubmissionText("");
    setSubmissionFile(null);
  };

  const getStatusBadgeVariant = (status: Assignment["status"], dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status === "Pending Submission";
    if (status === "Graded") return "success"; // Custom variant or style for success
    if (status === "Submitted") return "default"; // Shadcn default is primary
    if (status === "Pending Submission" && isOverdue) return "destructive";
    if (status === "Late") return "destructive";
    return "outline"; // For pending
  };

  const getDueDateInfo = (dueDate: string, status: Assignment["status"]) => {
    const due = parseISO(dueDate);
    const now = new Date();
    if (status === "Submitted" || status === "Graded") {
      return `Due: ${format(due, "MMM dd, yyyy")}`;
    }
    if (isPast(due)) {
      return `Due ${formatDistanceToNowStrict(due, { addSuffix: true })} (${format(due, "MMM dd")})`;
    }
    const daysLeft = differenceInDays(due, now);
    if (daysLeft < 1) return `Due Today, ${format(due, "HH:mm")}`;
    if (daysLeft === 1) return `Due Tomorrow, ${format(due, "HH:mm")}`;
    return `Due in ${formatDistanceToNowStrict(due)} (${format(due, "MMM dd")})`;
  };


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
            <ClipboardCheck className="h-6 w-6 text-primary" />
            My Assignments
          </CardTitle>
          <CardDescription>View, submit, and track your course assignments here.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="mb-4">
            <Label htmlFor="course-filter-assignments">Filter by Course</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger id="course-filter-assignments">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {MOCK_ENROLLED_COURSES.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center p-8"> <UploadCloud className="h-12 w-12 mx-auto animate-pulse text-muted-foreground"/> <p>Loading assignments...</p></div>
          ) : filteredAssignments.length === 0 ? (
             <div className="text-center py-10">
                <Image src="https://placehold.co/300x200.png" alt="No assignments" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state tasks" />
                <h3 className="text-xl font-semibold">No Assignments Found</h3>
                <p className="text-muted-foreground mt-1">
                  {selectedCourseId === "all" ? "There are no assignments available." : `No assignments found for ${MOCK_ENROLLED_COURSES.find(c => c.id === selectedCourseId)?.name || 'the selected course'}.`}
                </p>
              </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.title}
                        <p className="text-xs text-muted-foreground md:hidden">{assignment.courseCode}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{assignment.courseName}</TableCell>
                      <TableCell>
                        <span className={cn("text-sm", isPast(parseISO(assignment.dueDate)) && (assignment.status === "Pending Submission" || assignment.status === "Late") ? "text-destructive font-medium" : "text-muted-foreground")}>
                           {getDueDateInfo(assignment.dueDate, assignment.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(assignment.status, assignment.dueDate)}
                               className={cn(assignment.status === "Graded" && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                                             assignment.status === "Submitted" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                               )}
                        >
                          {assignment.status === "Pending Submission" && isPast(parseISO(assignment.dueDate)) ? "Overdue" : assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {assignment.status === "Pending Submission" || assignment.status === "Late" || (assignment.status === "Submitted" && assignment.allowsResubmission) ? (
                          <Button variant="default" size="sm" onClick={() => handleOpenSubmitDialog(assignment)}>
                            {assignment.status === "Submitted" ? "Resubmit" : "Submit"}
                          </Button>
                        ) : assignment.status === "Submitted" ? (
                          <Button variant="outline" size="sm" onClick={() => handleOpenViewDialog(assignment)}>
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Button>
                        ) : assignment.status === "Graded" ? (
                          <Button variant="outline" size="sm" onClick={() => handleOpenViewDialog(assignment)}>
                            <MessageCircle className="mr-1 h-4 w-4" /> Feedback
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Assignment Dialog */}
      {currentAssignment && (
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <Suspense fallback={<div className="p-6 text-center">Loading form...</div>}>
              <SubmitAssignmentDialogContent
                currentAssignment={currentAssignment}
                submissionText={submissionText}
                setSubmissionText={setSubmissionText}
                submissionFile={submissionFile}
                handleFileChange={handleFileChange}
                handleSubmitAssignment={handleSubmitAssignment}
                isLoading={isLoading}
                onClose={() => setIsSubmitDialogOpen(false)}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}

      {/* View Submission/Feedback Dialog */}
      {currentAssignment && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
             <Suspense fallback={<div className="p-6 text-center">Loading submission details...</div>}>
                <ViewSubmissionDialogContent
                    currentAssignment={currentAssignment}
                    toast={toast}
                    onClose={() => setIsViewDialogOpen(false)}
                />
             </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
