
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, Submission, Course, StudentSubmissionFile } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { format, parseISO, isPast } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, Eye, FileText, AlertCircle, Inbox, Download, MessageSquare, Link as LinkIcon, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Mock data for courses (needed to find course details for breadcrumbs/header)
const MOCK_COURSES_SUBMISSIONS: Partial<Course>[] = [
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409" },
];

function formatFileSize(bytes: number | undefined, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function AssignmentSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const courseId = params.courseId as string;
    const assignmentId = params.assignmentId as string;

    const [assignment, setAssignment] = useState<Assignment | null | undefined>(undefined);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<Submission | null>(null);
    const [isGradeSubmissionDialogOpen, setIsGradeSubmissionDialogOpen] = useState(false);
    const [currentGrade, setCurrentGrade] = useState<string>("");
    const [currentFeedback, setCurrentFeedback] = useState<string>("");
    const [isSavingGrade, setIsSavingGrade] = useState(false);


    useEffect(() => {
        async function fetchData() {
            if (!courseId || !assignmentId || !user?.uid) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Fetch Assignment Details
                const assignmentDocRef = doc(db, "assignments", assignmentId);
                const assignmentDocSnap = await getDoc(assignmentDocRef);

                if (assignmentDocSnap.exists()) {
                    const assignmentData = assignmentDocSnap.data() as Omit<Assignment, 'id'>;
                    if (assignmentData.courseId === courseId && assignmentData.lecturerId === user.uid) {
                        const fetchedAssignment: Assignment = {
                            id: assignmentDocSnap.id,
                            ...assignmentData,
                            dueDate: assignmentData.dueDate instanceof Timestamp ? assignmentData.dueDate.toDate().toISOString() : assignmentData.dueDate,
                            createdAt: assignmentData.createdAt instanceof Timestamp ? assignmentData.createdAt.toDate().toISOString() : assignmentData.createdAt,
                            updatedAt: assignmentData.updatedAt instanceof Timestamp ? assignmentData.updatedAt.toDate().toISOString() : assignmentData.updatedAt,
                        };
                        setAssignment(fetchedAssignment);

                        // Fetch Submissions
                        const submissionsQuery = query(
                            collection(db, "submissions"),
                            where("assignmentId", "==", assignmentId)
                        );
                        const submissionsSnapshot = await getDocs(submissionsQuery);
                        const fetchedSubmissions: Submission[] = [];
                        submissionsSnapshot.forEach((subDoc) => {
                            const subData = subDoc.data() as Omit<Submission, 'id'>;
                            fetchedSubmissions.push({ 
                                id: subDoc.id, 
                                ...subData,
                                submittedAt: subData.submittedAt instanceof Timestamp ? subData.submittedAt.toDate().toISOString() : subData.submittedAt,
                            });
                        });
                        setSubmissions(fetchedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
                    } else {
                         toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to view this assignment or it does not belong to this course." });
                         setAssignment(null); // Mark as not found or access denied
                    }
                } else {
                    toast({ variant: "destructive", title: "Not Found", description: "Assignment could not be found." });
                    setAssignment(null);
                }
            } catch (error) {
                console.error("Error fetching assignment/submissions:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load assignment and submissions data." });
                setAssignment(null);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [courseId, assignmentId, user?.uid, toast]);

    const courseDetails = useMemo(() => {
        // Try to get from fetched assignment first
        if (assignment && assignment.courseCode && assignment.courseName) {
            return { code: assignment.courseCode, title: assignment.courseName };
        }
        // Fallback to mock if needed (e.g. if assignment lacks these denormalized fields)
        return MOCK_COURSES_SUBMISSIONS.find(c => c.id === courseId) || {code: courseId, title: "Course Details"};
    }, [courseId, assignment]);

    const getStatusBadgeVariant = (status: Submission['status']) => {
        switch (status) {
            case "Graded": return "success";
            case "Submitted": return "default";
            case "Late Submission": return "warning";
            case "Pending Review": return "outline";
            default: return "secondary";
        }
    };

    const handleOpenGradeDialog = (submission: Submission) => {
        setSelectedSubmissionForGrading(submission);
        setCurrentGrade(submission.grade?.toString() || "");
        setCurrentFeedback(submission.feedback || "");
        setIsGradeSubmissionDialogOpen(true);
    };
    
    const handleSaveGrade = async () => {
        if (!selectedSubmissionForGrading || !assignment) return;
        
        const gradeValue = parseFloat(currentGrade);
        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > assignment.maxScore) {
            toast({ variant: "destructive", title: "Invalid Grade", description: `Grade must be a number between 0 and ${assignment.maxScore}.` });
            return;
        }
        setIsSavingGrade(true);
        // TODO: Implement actual saving to Firestore
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        setSubmissions(prev => prev.map(sub => 
            sub.id === selectedSubmissionForGrading.id 
            ? {...sub, grade: gradeValue, feedback: currentFeedback, status: "Graded" as const} 
            : sub
        ));
        toast({ title: "Grade Saved (Simulated)", description: `Grade for ${selectedSubmissionForGrading.studentName} has been saved.` });
        setIsSavingGrade(false);
        setIsGradeSubmissionDialogOpen(false);
    };
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
            </div>
        );
    }

    if (assignment === undefined || assignment === null) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-10">
                <Image src="https://placehold.co/300x200.png" alt="Assignment not found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="error document"/>
                <h2 className="text-2xl font-semibold text-destructive">Assignment Not Found</h2>
                <p className="text-muted-foreground">The assignment details could not be loaded or it does not exist.</p>
                <Button onClick={() => router.push(`/dashboard/lecturer/courses/${courseId}/manage`)}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Management</Button>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <Button variant="outline" onClick={() => router.push(`/dashboard/lecturer/courses/${courseId}/manage`)} className="mb-2 print:hidden">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course Management
            </Button>

            <header className="space-y-1 border-b pb-4">
                <h1 className="font-headline text-3xl font-bold">Submissions: {assignment.title}</h1>
                <p className="text-muted-foreground text-lg">
                    Course: {courseDetails?.code} - {courseDetails?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                    Due Date: {assignment.dueDate ? format(parseISO(assignment.dueDate as string), "PPP p") : "Not set"} | Max Score: {assignment.maxScore || "N/A"}
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions ({submissions.length})</CardTitle>
                    <CardDescription>Review and grade submissions for this assignment.</CardDescription>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No Submissions Yet</h3>
                            <p className="text-muted-foreground mt-1">
                                No students have submitted this assignment.
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Matricule</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Grade</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map(sub => (
                                        <TableRow key={sub.id} className={sub.isLate ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
                                            <TableCell className="font-medium">{sub.studentName || "N/A"}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{sub.studentMatricule || "N/A"}</TableCell>
                                            <TableCell>
                                                {format(parseISO(sub.submittedAt as string), "MMM dd, yyyy p")}
                                                {sub.isLate && <Badge variant="warning" className="ml-2 text-xs">Late</Badge>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant={getStatusBadgeVariant(sub.status)}
                                                    className={
                                                      sub.status === "Graded" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                                                      sub.status === "Submitted" || sub.status === "Late Submission" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : ""
                                                    }
                                                >{sub.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {sub.grade !== null && sub.grade !== undefined ? `${sub.grade}/${assignment.maxScore}` : "N/G"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenGradeDialog(sub)}>
                                                    <Eye className="mr-1 h-4 w-4"/> View & Grade
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" disabled className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" /> Download All Submissions (ZIP) - Coming Soon
                    </Button>
                </CardFooter>
            </Card>

            {/* Grade Submission Dialog */}
            {selectedSubmissionForGrading && assignment && (
                <Dialog open={isGradeSubmissionDialogOpen} onOpenChange={setIsGradeSubmissionDialogOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Review Submission: {selectedSubmissionForGrading.studentName}</DialogTitle>
                            <DialogDescription>
                                Assignment: {assignment.title} (Max Score: {assignment.maxScore})
                                <br/>Submitted: {format(parseISO(selectedSubmissionForGrading.submittedAt as string), "PPP p")}
                                {selectedSubmissionForGrading.isLate && <Badge variant="warning" className="ml-2 text-xs">Late Submission</Badge>}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedSubmissionForGrading.textSubmission && (
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Text Submission</CardTitle></CardHeader>
                                    <CardContent className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                                        {selectedSubmissionForGrading.textSubmission}
                                    </CardContent>
                                </Card>
                            )}
                            {selectedSubmissionForGrading.files && selectedSubmissionForGrading.files.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Submitted Files ({selectedSubmissionForGrading.files.length})</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {selectedSubmissionForGrading.files.map((file, index) => (
                                                <li key={index} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} - {file.type}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            <Download className="mr-1 h-4 w-4" /> Download
                                                        </a>
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                             {!selectedSubmissionForGrading.textSubmission && (!selectedSubmissionForGrading.files || selectedSubmissionForGrading.files.length === 0) && (
                                 <p className="text-muted-foreground text-center py-4">No text or files submitted for this assignment.</p>
                             )}

                            <Card className="mt-4">
                                <CardHeader><CardTitle className="text-base">Grade & Feedback</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                     <div>
                                        <Label htmlFor="grade-input">Grade (Out of {assignment.maxScore})</Label>
                                        <Input 
                                            id="grade-input" 
                                            type="number" 
                                            value={currentGrade} 
                                            onChange={(e) => setCurrentGrade(e.target.value)}
                                            max={assignment.maxScore}
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="feedback-input">Feedback for Student</Label>
                                        <Textarea 
                                            id="feedback-input" 
                                            value={currentFeedback}
                                            onChange={(e) => setCurrentFeedback(e.target.value)}
                                            placeholder="Provide constructive feedback..."
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSaveGrade} disabled={isSavingGrade}>
                                {isSavingGrade ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Grade & Feedback
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </motion.div>
    );
}
