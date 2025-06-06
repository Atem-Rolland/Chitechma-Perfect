
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, Submission, Course } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { format, parseISO, isPast } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, FileText, AlertCircle, Inbox, Download, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Mock data for courses (needed to find course details for breadcrumbs/header)
// In a real app, this might come from a shared context or a direct fetch if not passed
const MOCK_COURSES_SUBMISSIONS: Partial<Course>[] = [
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409" },
];

const MOCK_ASSIGNMENTS_DETAILS: Partial<Assignment>[] = [
    { id: "ASG001_CSE401", title: "Initial App Proposal", courseId: "CSE401_CESM_Y2425_S1", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), maxScore: 20 },
    { id: "ASG002_CSE401", title: "UI Mockups", courseId: "CSE401_CESM_Y2425_S1", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), maxScore: 30 },
    { id: "ASG001_CSE409", title: "OOP Concepts Essay", courseId: "CSE409_CESM_Y2425_S1", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), maxScore: 25 },
];

const MOCK_SUBMISSIONS_DATA: Submission[] = [
    { 
        id: "SUB001", assignmentId: "ASG001_CSE401", courseId: "CSE401_CESM_Y2425_S1", studentId: "stud001", studentName: "Atem Rolland", studentMatricule: "CUSMS/S/24C001",
        submittedAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'Submitted', isLate: false,
        files: [{ name: "proposal_atem.pdf", url: "#", type: "application/pdf", size: 1200000 }],
        textSubmission: "Here is my proposal for the new app."
    },
    { 
        id: "SUB002", assignmentId: "ASG001_CSE401", courseId: "CSE401_CESM_Y2425_S1", studentId: "stud002", studentName: "Bih Brenda", studentMatricule: "CUSMS/S/24C002",
        submittedAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'Late Submission', isLate: true,
        files: [{ name: "proposal_brenda.docx", url: "#", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 850000 }],
    },
    { 
        id: "SUB003", assignmentId: "ASG001_CSE401", courseId: "CSE401_CESM_Y2425_S1", studentId: "stud003", studentName: "Chenwi Charles", studentMatricule: "CUSMS/S/24C003",
        submittedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'Graded', isLate: false,
        grade: 18, feedback: "Good effort. Some sections need more detail.",
        files: [{ name: "app_proposal_charles.pdf", url: "#", type: "application/pdf", size: 1500000 }],
    },
];


export default function AssignmentSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const courseId = params.courseId as string;
    const assignmentId = params.assignmentId as string;

    const [assignment, setAssignment] = useState<Partial<Assignment> | null | undefined>(undefined);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!courseId || !assignmentId || !user?.uid) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // For now, using mock data. Replace with Firestore fetching later.
                const foundAssignment = MOCK_ASSIGNMENTS_DETAILS.find(a => a.id === assignmentId && a.courseId === courseId);
                setAssignment(foundAssignment || null);

                const foundSubmissions = MOCK_SUBMISSIONS_DATA.filter(s => s.assignmentId === assignmentId);
                setSubmissions(foundSubmissions);

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 700));

            } catch (error) {
                console.error("Error fetching assignment/submissions:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load data." });
                setAssignment(null);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [courseId, assignmentId, user?.uid, toast]);

    const courseDetails = useMemo(() => MOCK_COURSES_SUBMISSIONS.find(c => c.id === courseId), [courseId]);

    const getStatusBadgeVariant = (status: Submission['status']) => {
        switch (status) {
            case "Graded": return "success";
            case "Submitted": return "default";
            case "Late Submission": return "warning";
            case "Pending Review": return "outline";
            default: return "secondary";
        }
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
                                                <Badge variant={getStatusBadgeVariant(sub.status)}>{sub.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {sub.grade !== null && sub.grade !== undefined ? `${sub.grade}/${assignment.maxScore}` : "N/G"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" disabled>
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
        </motion.div>
    );
}
