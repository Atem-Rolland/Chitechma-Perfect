
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseMaterial, MaterialType, Assignment, AssignmentResource } from "@/types";
import { MATERIAL_TYPES, materialTypeAcceptsFile, materialTypeAcceptsLink, getMaterialTypeIcon } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES } from "@/config/data"; // Use ALL_UNIVERSITY_COURSES
import { db, auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, deleteDoc, Timestamp, updateDoc } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
    ArrowLeft, UploadCloud, PlusCircle, Trash2, Download, ExternalLink as OpenLinkIcon, Info, FileText, FilePresentation, 
    Youtube, Link as LinkIconLucide, Archive, Image as ImageIconLucide, CalendarIcon, Edit, Eye, ListChecks, Loader2, File 
} from "lucide-react"; 
import { motion } from "framer-motion";
import Image from "next/image"; 
import { format, parseISO } from "date-fns"; 
import { cn } from "@/lib/utils";
import Link from "next/link";

function formatFileSize(bytes: number | undefined, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ManageCoursePage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null | undefined>(undefined);
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState(true);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
    
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState("");
    const [newMaterialType, setNewMaterialType] = useState<MaterialType | undefined>(undefined);
    const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null);
    const [newMaterialLink, setNewMaterialLink] = useState("");
    const [newMaterialDescription, setNewMaterialDescription] = useState("");
    const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [currentAssignmentToEdit, setCurrentAssignmentToEdit] = useState<Assignment | null>(null);
    const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
    const [newAssignmentInstructions, setNewAssignmentInstructions] = useState("");
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<Date | undefined>(undefined);
    const [newAssignmentMaxScore, setNewAssignmentMaxScore] = useState<number | string>(100);
    const [newAssignmentFileTypes, setNewAssignmentFileTypes] = useState(".pdf,.docx,.zip");
    const [newAssignmentResourceFile, setNewAssignmentResourceFile] = useState<File | null>(null);
    const [isSavingAssignment, setIsSavingAssignment] = useState(false);
    const [isDeletingAssignmentId, setIsDeletingAssignmentId] = useState<string | null>(null);


    useEffect(() => {
        async function fetchCourseData() {
            if (!courseId || !user?.uid) {
                setIsLoadingCourseDetails(false);
                setIsLoadingMaterials(false);
                setIsLoadingAssignments(false);
                return;
            }
            setIsLoadingCourseDetails(true);
            setIsLoadingMaterials(true);
            setIsLoadingAssignments(true);

            const foundCourse = ALL_UNIVERSITY_COURSES.find(c => c.id === courseId); // Use centralized list
            setCourse(foundCourse || null);
            setIsLoadingCourseDetails(false);

            if (foundCourse) {
                try {
                    const materialsQuery = query(
                        collection(db, "courseMaterials"), 
                        where("courseId", "==", courseId),
                        where("lecturerId", "==", user.uid), // Ensure lecturer can only see their materials for the course
                        orderBy("uploadedAt", "desc")
                    );
                    const materialsSnapshot = await getDocs(materialsQuery);
                    const fetchedMaterials: CourseMaterial[] = [];
                    materialsSnapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedMaterials.push({ 
                            id: doc.id, 
                            ...data,
                            uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : data.uploadedAt,
                         } as CourseMaterial);
                    });
                    setMaterials(fetchedMaterials);
                } catch (error) {
                    console.error("Error fetching course materials:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not load course materials." });
                } finally {
                    setIsLoadingMaterials(false);
                }

                try {
                    const assignmentsQuery = query(
                        collection(db, "assignments"),
                        where("courseId", "==", courseId),
                        where("lecturerId", "==", user.uid), // Ensure lecturer can only see their assignments
                        orderBy("createdAt", "desc")
                    );
                    const assignmentsSnapshot = await getDocs(assignmentsQuery);
                    const fetchedAssignments: Assignment[] = [];
                    assignmentsSnapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedAssignments.push({ 
                            id: doc.id, 
                            ...data,
                            dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate,
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
                            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                        } as Assignment);
                    });
                    setAssignments(fetchedAssignments);
                } catch (error) {
                    console.error("Error fetching assignments:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not load assignments." });
                } finally {
                    setIsLoadingAssignments(false);
                }
            } else {
                setIsLoadingMaterials(false);
                setIsLoadingAssignments(false);
            }
        }
        fetchCourseData();
    }, [courseId, toast, user?.uid]);

    const handleMaterialFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 50MB." });
                setNewMaterialFile(null);
                event.target.value = ""; 
                return;
            }
            setNewMaterialFile(file);
        } else {
            setNewMaterialFile(null);
        }
    };
    
    const resetUploadMaterialForm = () => {
        setNewMaterialName("");
        setNewMaterialType(undefined);
        setNewMaterialFile(null);
        setNewMaterialLink("");
        setNewMaterialDescription("");
        const fileInput = document.getElementById("material-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleUploadMaterial = async () => {
        if (!newMaterialName.trim() || !newMaterialType || !user?.uid || !courseId || !course) {
            toast({ variant: "destructive", title: "Missing fields", description: "Material name, type, and course context are required." });
            return;
        }
        setIsUploadingMaterial(true);
        try {
            let fileUrl = "";
            let storagePath = "";

            if (materialTypeAcceptsFile(newMaterialType) && newMaterialFile) {
                const filePath = `course_materials/${courseId}/${Date.now()}-${newMaterialFile.name.replace(/\s+/g, '_')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('cusms-files').upload(filePath, newMaterialFile);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('cusms-files').getPublicUrl(filePath);
                fileUrl = urlData.publicUrl;
                storagePath = filePath;
            } else if (materialTypeAcceptsLink(newMaterialType) && newMaterialLink.trim()) {
                fileUrl = newMaterialLink.trim();
                if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                    fileUrl = 'https://' + fileUrl;
                }
            } else {
                 toast({ variant: "destructive", title: "Input Required", description: "Please provide a file or a link for the selected material type." });
                 setIsUploadingMaterial(false);
                 return;
            }

            const materialToSave: Omit<CourseMaterial, 'id'> = {
                courseId: courseId, lecturerId: user.uid, name: newMaterialName, type: newMaterialType,
                url: fileUrl, storagePath: storagePath || undefined, fileName: newMaterialFile?.name,
                fileType: newMaterialFile?.type, size: newMaterialFile?.size, uploadedAt: serverTimestamp(),
                description: newMaterialDescription.trim() || undefined,
            };
            const docRef = await addDoc(collection(db, "courseMaterials"), materialToSave);
            // Optimistically update UI before re-fetch or use snapshot listener
            const newMaterialEntry = { ...materialToSave, id: docRef.id, uploadedAt: new Date().toISOString() } as CourseMaterial;
            setMaterials(prev => [newMaterialEntry, ...prev].sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
            
            toast({ title: "Material Uploaded", description: `${newMaterialName} has been added.` });
            setIsUploadDialogOpen(false);
            resetUploadMaterialForm();
        } catch (error: any) {
            console.error("Error uploading material:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not upload material." });
        } finally {
            setIsUploadingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (materialToDelete: CourseMaterial) => {
        if (!materialToDelete.id) return;
        if (!window.confirm(`Are you sure you want to delete "${materialToDelete.name}"? This action cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, "courseMaterials", materialToDelete.id));
            if (materialToDelete.storagePath) {
                const { error: storageError } = await supabase.storage.from('cusms-files').remove([materialToDelete.storagePath]);
                if (storageError) {
                    console.warn("Error deleting file from Supabase Storage:", storageError);
                    toast({ variant: "warning", title: "Partial Deletion", description: "Material removed from list, but file deletion from storage failed." });
                }
            }
            setMaterials(prev => prev.filter(m => m.id !== materialToDelete.id));
            toast({ title: "Material Deleted", description: `${materialToDelete.name} has been removed.`, variant: "default" });
        } catch (error: any) {
            console.error("Error deleting material:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "Could not delete material." });
        }
    };

    const handleAssignmentResourceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 20 * 1024 * 1024) { // 20MB limit for assignment resources
                toast({ variant: "destructive", title: "File too large", description: "Maximum file size for assignment resources is 20MB." });
                setNewAssignmentResourceFile(null);
                event.target.value = "";
                return;
            }
            setNewAssignmentResourceFile(file);
        } else {
            setNewAssignmentResourceFile(null);
        }
    };

    const resetAssignmentForm = () => {
        setNewAssignmentTitle("");
        setNewAssignmentInstructions("");
        setNewAssignmentDueDate(undefined);
        setNewAssignmentMaxScore(100);
        setNewAssignmentFileTypes(".pdf,.docx,.zip");
        setNewAssignmentResourceFile(null);
        setCurrentAssignmentToEdit(null);
        const resourceFileInput = document.getElementById("assignment-resource-file") as HTMLInputElement;
        if (resourceFileInput) resourceFileInput.value = "";
    };

    const handleOpenEditAssignmentDialog = (assignment: Assignment) => {
        setCurrentAssignmentToEdit(assignment);
        setNewAssignmentTitle(assignment.title);
        setNewAssignmentInstructions(assignment.description);
        setNewAssignmentDueDate(assignment.dueDate instanceof Timestamp ? assignment.dueDate.toDate() : parseISO(assignment.dueDate as string));
        setNewAssignmentMaxScore(assignment.maxScore);
        setNewAssignmentFileTypes(assignment.allowedFileTypes || ".pdf,.docx,.zip");
        setNewAssignmentResourceFile(null);
        setIsAssignmentDialogOpen(true);
    };

    const handleSaveAssignment = async () => {
        if (!newAssignmentTitle.trim() || !newAssignmentDueDate || !courseId || !user?.uid || !course) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Title and Due Date are required for an assignment."});
            return;
        }
        setIsSavingAssignment(true);
        try {
            if (currentAssignmentToEdit) { 
                const updatedAssignmentData: Partial<Assignment> & {updatedAt: any} = {
                    title: newAssignmentTitle.trim(),
                    description: newAssignmentInstructions.trim(),
                    dueDate: Timestamp.fromDate(newAssignmentDueDate),
                    maxScore: Number(newAssignmentMaxScore) || 100,
                    allowedFileTypes: newAssignmentFileTypes.trim(),
                    updatedAt: serverTimestamp(),
                };
                await updateDoc(doc(db, "assignments", currentAssignmentToEdit.id), updatedAssignmentData);
                setAssignments(prev => prev.map(a => a.id === currentAssignmentToEdit.id ? {...a, ...updatedAssignmentData, dueDate: newAssignmentDueDate.toISOString(), updatedAt: new Date().toISOString() } : a).sort((a,b) => {
                     const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt as string);
                     const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt as string);
                     return dateB.getTime() - dateA.getTime();
                }));
                toast({ title: "Assignment Updated", description: `"${newAssignmentTitle}" has been updated successfully.`});
            } else { 
                let resource: AssignmentResource | undefined = undefined;
                if (newAssignmentResourceFile) {
                    const filePath = `assignment_resources/${courseId}/${Date.now()}-${newAssignmentResourceFile.name.replace(/\s+/g, '_')}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('cusms-files')
                        .upload(filePath, newAssignmentResourceFile);
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage.from('cusms-files').getPublicUrl(filePath);
                    resource = {
                        name: newAssignmentResourceFile.name, url: urlData.publicUrl,
                        type: newAssignmentResourceFile.type, size: newAssignmentResourceFile.size,
                        storagePath: filePath, 
                    };
                }

                const assignmentToSave: Omit<Assignment, 'id'> = {
                    courseId: courseId, lecturerId: user.uid,
                    title: newAssignmentTitle.trim(), description: newAssignmentInstructions.trim(),
                    dueDate: Timestamp.fromDate(newAssignmentDueDate),
                    maxScore: Number(newAssignmentMaxScore) || 100,
                    allowedFileTypes: newAssignmentFileTypes.trim(),
                    assignmentResources: resource ? [resource] : [],
                    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
                    status: "Open", totalSubmissions: 0, gradedSubmissions: 0,
                    courseCode: course.code, courseName: course.title, // Denormalize
                };
                const docRef = await addDoc(collection(db, "assignments"), assignmentToSave);
                setAssignments(prev => [{ ...assignmentToSave, id: docRef.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: newAssignmentDueDate.toISOString() } as Assignment, ...prev].sort((a,b) => {
                    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt as string);
                    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt as string);
                    return dateB.getTime() - dateA.getTime();
                }));
                toast({ title: "Assignment Created", description: `"${newAssignmentTitle}" has been created successfully.`});
            }
            setIsAssignmentDialogOpen(false);
            resetAssignmentForm();
        } catch (error: any) {
            console.error("Error saving assignment:", error);
            toast({ variant: "destructive", title: "Save Failed", description: error.message || "Could not save assignment." });
        } finally {
            setIsSavingAssignment(false);
        }
    };

    const handleDeleteAssignment = async (assignmentToDelete: Assignment) => {
        if (!assignmentToDelete.id) return;
        if (!window.confirm(`Are you sure you want to delete assignment "${assignmentToDelete.title}"? This will also delete any associated resource files. This action cannot be undone.`)) return;
        
        setIsDeletingAssignmentId(assignmentToDelete.id);
        try {
            if (assignmentToDelete.assignmentResources && assignmentToDelete.assignmentResources.length > 0) {
                const storagePathsToDelete = assignmentToDelete.assignmentResources.map(r => r.storagePath).filter(Boolean) as string[];
                if (storagePathsToDelete.length > 0) {
                    const { error: storageError } = await supabase.storage.from('cusms-files').remove(storagePathsToDelete);
                    if (storageError) console.warn("Error deleting resource files from Supabase Storage:", storageError);
                }
            }
            await deleteDoc(doc(db, "assignments", assignmentToDelete.id));
            setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
            toast({ title: "Assignment Deleted", description: `"${assignmentToDelete.title}" has been removed.`, variant: "default" });
        } catch (error: any) {
            console.error("Error deleting assignment:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "Could not delete assignment." });
        } finally {
            setIsDeletingAssignmentId(null);
        }
    };

    const isLoadingPage = isLoadingCourseDetails;
    const IconForType = newMaterialType ? getMaterialTypeIcon(newMaterialType) : File;

    if (isLoadingPage) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
                {[1,2,3].map(i => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!course) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-10 p-4 md:p-6">
                <Image src="https://placehold.co/300x200.png" alt="Course not found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="error document"/>
                <h2 className="text-2xl font-semibold text-destructive">Course Not Found</h2>
                <p className="text-muted-foreground">The course management page could not be loaded.</p>
                <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
            </motion.div>
        );
    }
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 md:space-y-8 p-4 md:p-6">
            <Button variant="outline" onClick={() => router.push('/dashboard/lecturer/courses')} className="mb-4 print:hidden self-start">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
            </Button>

            <header className="space-y-1 border-b pb-4">
                <h1 className="font-headline text-2xl md:text-3xl font-bold">Manage Course: {course.title} ({course.code})</h1>
                <p className="text-muted-foreground text-md md:text-lg">Upload materials, create assignments, and manage other aspects of your course.</p>
            </header>

            <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-xl md:text-2xl">Course Materials</CardTitle>
                        <CardDescription>Upload and manage learning resources for your students.</CardDescription>
                    </div>
                    <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { setIsUploadDialogOpen(isOpen); if (!isOpen) resetUploadMaterialForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto mt-3 sm:mt-0"><PlusCircle className="mr-2 h-5 w-5" /> Upload New Material</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader><DialogTitle className="text-xl">Upload New Course Material</DialogTitle><DialogDescription>Fill in the details below.</DialogDescription></DialogHeader>
                            <div className="space-y-4 py-3">
                                <div><Label htmlFor="material-name">Material Name / Title <span className="text-destructive">*</span></Label><Input id="material-name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="e.g., Week 1 Lecture Notes" /></div>
                                <div><Label htmlFor="material-type">Material Type <span className="text-destructive">*</span></Label><Select value={newMaterialType} onValueChange={(value: MaterialType) => setNewMaterialType(value)}><SelectTrigger id="material-type"><SelectValue placeholder="Select material type..." /></SelectTrigger><SelectContent>{MATERIAL_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent></Select></div>
                                {newMaterialType && materialTypeAcceptsFile(newMaterialType) && (<div><Label htmlFor="material-file">Upload File <span className="text-destructive">*</span></Label><Input id="material-file" type="file" onChange={handleMaterialFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>{newMaterialFile && <p className="text-xs text-muted-foreground mt-1">Selected: {newMaterialFile.name} ({formatFileSize(newMaterialFile.size)})</p>}</div>)}
                                {newMaterialType && materialTypeAcceptsLink(newMaterialType) && (<div><Label htmlFor="material-link">Link URL <span className="text-destructive">*</span></Label><Input id="material-link" type="url" value={newMaterialLink} onChange={(e) => setNewMaterialLink(e.target.value)} placeholder="e.g., https://example.com/resource" /></div>)}
                                 <div><Label htmlFor="material-description">Description (Optional)</Label><Textarea id="material-description" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} placeholder="Briefly describe the material..." rows={3}/></div>
                            </div>
                            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="button" onClick={handleUploadMaterial} disabled={isUploadingMaterial}>{isUploadingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Upload</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoadingMaterials ? (<div className="text-center py-10"><UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3 animate-pulse" /><p>Loading materials...</p></div>)
                    : materials.length === 0 ? (<div className="text-center py-10 border-2 border-dashed border-muted rounded-lg"><IconForType className="mx-auto h-12 w-12 text-muted-foreground mb-3" /><h3 className="text-lg font-semibold text-muted-foreground">No Materials Uploaded Yet</h3><p className="text-sm text-muted-foreground mt-1">Click "Upload New Material" to add resources.</p></div>)
                    : (<div className="border rounded-md overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="w-[50px] text-center">Type</TableHead><TableHead className="min-w-[200px]">Name & Description</TableHead><TableHead className="hidden md:table-cell text-center min-w-[100px]">Size</TableHead><TableHead className="hidden md:table-cell text-center min-w-[120px]">Uploaded</TableHead><TableHead className="text-right min-w-[150px]">Actions</TableHead></TableRow></TableHeader><TableBody>{materials.map(material => { const MaterialIcon = getMaterialTypeIcon(material.type); const uploadedDate = material.uploadedAt instanceof Timestamp ? material.uploadedAt.toDate() : (typeof material.uploadedAt === 'string' ? parseISO(material.uploadedAt) : new Date()); return (<TableRow key={material.id}><TableCell className="text-center"><MaterialIcon className="h-5 w-5 mx-auto text-muted-foreground" /></TableCell><TableCell className="font-medium">{material.name}{material.description && <p className="text-xs text-muted-foreground mt-0.5">{material.description}</p>}</TableCell><TableCell className="hidden md:table-cell text-center">{material.size ? formatFileSize(material.size) : (materialTypeAcceptsLink(material.type) ? "Link" : "N/A")}</TableCell><TableCell className="hidden md:table-cell text-center">{uploadedDate instanceof Date ? format(uploadedDate, "MMM dd, yyyy") : "Processing..."}</TableCell><TableCell className="text-right space-x-1">{materialTypeAcceptsLink(material.type) || (material.url && material.url.startsWith("http")) ? (<Button variant="outline" size="sm" onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}><OpenLinkIcon className="mr-1 h-4 w-4"/>Open</Button>) : (<Button variant="outline" size="sm" onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}><Download className="mr-1 h-4 w-4"/>Download</Button>)}<Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMaterial(material)}><Trash2 className="h-4 w-4"/><span className="sr-only">Delete</span></Button></TableCell></TableRow>)})}</TableBody></Table></div>)}
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div><CardTitle className="text-xl md:text-2xl">Assignments</CardTitle><CardDescription>Create and manage assignments for this course.</CardDescription></div>
                     <Dialog open={isAssignmentDialogOpen} onOpenChange={(isOpen) => { setIsAssignmentDialogOpen(isOpen); if (!isOpen) resetAssignmentForm(); }}><DialogTrigger asChild><Button onClick={() => { resetAssignmentForm(); setIsAssignmentDialogOpen(true); }}  className="w-full sm:w-auto mt-3 sm:mt-0"><PlusCircle className="mr-2 h-5 w-5"/>Create New Assignment</Button></DialogTrigger><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle className="text-xl">{currentAssignmentToEdit ? `Edit: ${currentAssignmentToEdit.title}` : "Create New Assignment"}</DialogTitle><DialogDescription>{currentAssignmentToEdit ? "Update details below." : "Define details below."}</DialogDescription></DialogHeader><div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2"><div><Label htmlFor="assignment-title">Title <span className="text-destructive">*</span></Label><Input id="assignment-title" value={newAssignmentTitle} onChange={(e) => setNewAssignmentTitle(e.target.value)} placeholder="e.g., Essay on Algorithms" /></div><div><Label htmlFor="assignment-instructions">Instructions/Description</Label><Textarea id="assignment-instructions" value={newAssignmentInstructions} onChange={(e) => setNewAssignmentInstructions(e.target.value)} placeholder="Detailed instructions..." rows={5}/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label htmlFor="assignment-due-date">Due Date <span className="text-destructive">*</span></Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!newAssignmentDueDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newAssignmentDueDate ? format(newAssignmentDueDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newAssignmentDueDate} onSelect={setNewAssignmentDueDate} initialFocus disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} /></PopoverContent></Popover></div><div><Label htmlFor="assignment-max-score">Max Score</Label><Input id="assignment-max-score" type="number" value={newAssignmentMaxScore} onChange={(e) => setNewAssignmentMaxScore(e.target.value)} placeholder="e.g., 100" /></div></div><div><Label htmlFor="assignment-file-types">Allowed File Types (Optional)</Label><Input id="assignment-file-types" value={newAssignmentFileTypes} onChange={(e) => setNewAssignmentFileTypes(e.target.value)} placeholder="e.g., .pdf,.docx,.zip" /><p className="text-xs text-muted-foreground mt-1">Comma-separated list.</p></div>{!currentAssignmentToEdit && (<div><Label htmlFor="assignment-resource-file">Upload Resource File (Optional)</Label><Input id="assignment-resource-file" type="file" onChange={handleAssignmentResourceFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/><p className="text-xs text-muted-foreground mt-1">{newAssignmentResourceFile ? `Selected: ${newAssignmentResourceFile.name} (${formatFileSize(newAssignmentResourceFile.size)})` : "Max 20MB."}</p></div>)}</div><DialogFooter><Button type="button" variant="outline" onClick={() => { setIsAssignmentDialogOpen(false); resetAssignmentForm();}}>Cancel</Button><Button type="button" onClick={handleSaveAssignment} disabled={isSavingAssignment}>{isSavingAssignment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentAssignmentToEdit ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}{currentAssignmentToEdit ? "Save Changes" : "Create Assignment"}</Button></DialogFooter></DialogContent></Dialog>
                </CardHeader>
                <CardContent>
                     {isLoadingAssignments ? (<div className="text-center py-10"><ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-3 animate-pulse" /><p>Loading assignments...</p></div>)
                     : assignments.length === 0 ? (<div className="text-center py-10 border-2 border-dashed border-muted rounded-lg"><ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-3" /><h3 className="text-lg font-semibold text-muted-foreground">No Assignments Created Yet</h3><p className="text-sm text-muted-foreground mt-1">Click "Create New Assignment" to add one.</p></div>)
                     : (<div className="border rounded-md overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="min-w-[150px]">Title</TableHead><TableHead className="text-center min-w-[150px]">Due Date</TableHead><TableHead className="text-center hidden sm:table-cell min-w-[120px]">Submissions</TableHead><TableHead className="text-right min-w-[200px]">Actions</TableHead></TableRow></TableHeader><TableBody>{assignments.map(assignment => { const dueDate = assignment.dueDate instanceof Timestamp ? assignment.dueDate.toDate() : (typeof assignment.dueDate === 'string' ? parseISO(assignment.dueDate) : new Date()); const isCurrentlyDeleting = isDeletingAssignmentId === assignment.id; return (<TableRow key={assignment.id}><TableCell className="font-medium">{assignment.title}</TableCell><TableCell className="text-center">{format(dueDate, "MMM dd, yyyy p")}</TableCell><TableCell className="text-center hidden sm:table-cell">{assignment.gradedSubmissions || 0} / {assignment.totalSubmissions || 0} Graded</TableCell><TableCell className="text-right space-x-1"><Button variant="outline" size="sm" asChild><Link href={`/dashboard/lecturer/courses/${courseId}/assignments/${assignment.id}/submissions`}><Eye className="mr-1 h-4 w-4"/>View</Link></Button><Button variant="outline" size="sm" onClick={() => handleOpenEditAssignmentDialog(assignment)} disabled={isSavingAssignment || !!isDeletingAssignmentId}><Edit className="mr-1 h-4 w-4"/>Edit</Button><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAssignment(assignment)} disabled={isSavingAssignment || !!isDeletingAssignmentId}>{isCurrentlyDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}<span className="sr-only">Delete</span></Button></TableCell></TableRow>);})}</TableBody></Table></div>)}
                </CardContent>
            </Card>
            
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="text-xl md:text-2xl">Grade Entry</CardTitle><CardDescription>Enter CA and Exam marks for students in this course.</CardDescription></CardHeader>
                <CardContent><Button variant="secondary" disabled><FileText className="mr-2 h-5 w-5"/>Enter/Upload Marks (Coming Soon)</Button><p className="text-sm text-muted-foreground mt-3">Mark entry and bulk upload features will be available here.</p></CardContent>
            </Card>
        </motion.div>
    );
}
