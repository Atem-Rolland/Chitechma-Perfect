
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseMaterial, MaterialType } from "@/types";
import { MATERIAL_TYPES, materialTypeAcceptsFile, materialTypeAcceptsLink, getMaterialTypeIcon } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from "@/config/data";
import { db, auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, deleteDoc, Timestamp } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UploadCloud, PlusCircle, Trash2, Download, ExternalLink as OpenLinkIcon, Info, File, FileText, FilePresentation, Youtube, Link as LinkIcon, Archive, Image as ImageIconLucide } from "lucide-react"; // Renamed ImageIcon to ImageIconLucide
import { motion } from "framer-motion";
import Image from "next/image"; 
import { format } from "date-fns"; 

// Simplified MOCK_ALL_COURSES_SOURCE for this page context.
const MOCK_ALL_COURSES_SOURCE: Course[] = [
    { id: "CSE301_CESM_Y2324_S1", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" },
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10-12, Wed 10-11, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-16, Fri 8-9", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
];


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
    const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState(true);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState("");
    const [newMaterialType, setNewMaterialType] = useState<MaterialType | undefined>(undefined);
    const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null);
    const [newMaterialLink, setNewMaterialLink] = useState("");
    const [newMaterialDescription, setNewMaterialDescription] = useState("");

    useEffect(() => {
        async function fetchCourseData() {
            if (!courseId) return;
            setIsLoadingCourseDetails(true);
            setIsLoadingMaterials(true);

            // Fetch course details (still mocked for now)
            const foundCourse = MOCK_ALL_COURSES_SOURCE.find(c => c.id === courseId);
            setCourse(foundCourse || null);
            setIsLoadingCourseDetails(false);

            // Fetch materials from Firestore
            if (foundCourse) {
                try {
                    const materialsQuery = query(
                        collection(db, "courseMaterials"), 
                        where("courseId", "==", courseId),
                        orderBy("uploadedAt", "desc")
                    );
                    const querySnapshot = await getDocs(materialsQuery);
                    const fetchedMaterials: CourseMaterial[] = [];
                    querySnapshot.forEach((doc) => {
                        fetchedMaterials.push({ id: doc.id, ...doc.data() } as CourseMaterial);
                    });
                    setMaterials(fetchedMaterials);
                } catch (error) {
                    console.error("Error fetching course materials:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not load course materials." });
                }
            }
            setIsLoadingMaterials(false);
        }
        fetchCourseData();
    }, [courseId, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    
    const resetUploadForm = () => {
        setNewMaterialName("");
        setNewMaterialType(undefined);
        setNewMaterialFile(null);
        setNewMaterialLink("");
        setNewMaterialDescription("");
        const fileInput = document.getElementById("material-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleUploadMaterial = async () => {
        if (!newMaterialName.trim() || !newMaterialType || !user?.uid || !courseId) {
            toast({ variant: "destructive", title: "Missing fields", description: "Material name, type, and user/course context are required." });
            return;
        }

        let fileUrl = "";
        let storagePath = "";

        setIsUploading(true);

        try {
            if (materialTypeAcceptsFile(newMaterialType) && newMaterialFile) {
                const filePath = `course_materials/${courseId}/${Date.now()}-${newMaterialFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('cusms-files')
                    .upload(filePath, newMaterialFile);

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
                 setIsUploading(false);
                 return;
            }

            const materialToSave: Omit<CourseMaterial, 'id'> = {
                courseId: courseId,
                lecturerId: user.uid,
                name: newMaterialName,
                type: newMaterialType,
                url: fileUrl,
                storagePath: storagePath || undefined,
                fileName: newMaterialFile?.name,
                fileType: newMaterialFile?.type,
                size: newMaterialFile?.size,
                uploadedAt: serverTimestamp(),
                description: newMaterialDescription.trim() || undefined,
            };

            const docRef = await addDoc(collection(db, "courseMaterials"), materialToSave);
            // Optimistic update:
            setMaterials(prev => [{ ...materialToSave, id: docRef.id, uploadedAt: new Date() } as CourseMaterial, ...prev]);
            
            toast({ title: "Material Uploaded", description: `${newMaterialName} has been added.` });
            setIsUploadDialogOpen(false);
            resetUploadForm();

        } catch (error: any) {
            console.error("Error uploading material:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not upload material." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteMaterial = async (materialToDelete: CourseMaterial) => {
        if (!materialToDelete.id) return;
        if (!window.confirm(`Are you sure you want to delete "${materialToDelete.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete from Firestore
            await deleteDoc(doc(db, "courseMaterials", materialToDelete.id));

            // Delete from Supabase Storage if it's a file with a storagePath
            if (materialToDelete.storagePath) {
                const { error: storageError } = await supabase.storage
                    .from('cusms-files')
                    .remove([materialToDelete.storagePath]);
                if (storageError) {
                    console.warn("Error deleting file from Supabase Storage, but Firestore entry removed:", storageError);
                    toast({ variant: "warning", title: "Partial Deletion", description: "Material removed from list, but file deletion from storage may have failed. Contact support if issues persist." });
                }
            }
            setMaterials(prev => prev.filter(m => m.id !== materialToDelete.id));
            toast({ title: "Material Deleted", description: `${materialToDelete.name} has been removed.`, variant: "default" });
        } catch (error: any) {
            console.error("Error deleting material:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "Could not delete material." });
        }
    };

    const isLoading = isLoadingCourseDetails || isLoadingMaterials;
    const IconForType = newMaterialType ? getMaterialTypeIcon(newMaterialType) : File;


    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
            </div>
        );
    }

    if (!course) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-10">
                <Image src="https://placehold.co/300x200.png" alt="Course not found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="error document"/>
                <h2 className="text-2xl font-semibold text-destructive">Course Not Found</h2>
                <p className="text-muted-foreground">The course management page could not be loaded.</p>
                <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
            </motion.div>
        );
    }
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
            </Button>

            <header className="space-y-1 border-b pb-4">
                <h1 className="font-headline text-3xl font-bold">Manage Course: {course.title} ({course.code})</h1>
                <p className="text-muted-foreground text-lg">Upload materials, create assignments, and manage other aspects of your course.</p>
            </header>

            {/* Course Materials Section */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Course Materials</CardTitle>
                        <CardDescription>Upload and manage learning resources for your students.</CardDescription>
                    </div>
                    <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { setIsUploadDialogOpen(isOpen); if (!isOpen) resetUploadForm(); }}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-5 w-5" /> Upload New Material</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Upload New Course Material</DialogTitle>
                                <DialogDescription>Fill in the details below and upload your file or link.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-3">
                                <div>
                                    <Label htmlFor="material-name">Material Name / Title <span className="text-destructive">*</span></Label>
                                    <Input id="material-name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="e.g., Week 1 Lecture Notes" />
                                </div>
                                <div>
                                    <Label htmlFor="material-type">Material Type <span className="text-destructive">*</span></Label>
                                    <Select value={newMaterialType} onValueChange={(value: MaterialType) => setNewMaterialType(value)}>
                                        <SelectTrigger id="material-type">
                                            <SelectValue placeholder="Select material type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MATERIAL_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newMaterialType && materialTypeAcceptsFile(newMaterialType) && (
                                    <div>
                                        <Label htmlFor="material-file">Upload File <span className="text-destructive">*</span></Label>
                                        <Input id="material-file" type="file" onChange={handleFileChange} 
                                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        {newMaterialFile && <p className="text-xs text-muted-foreground mt-1">Selected: {newMaterialFile.name} ({formatFileSize(newMaterialFile.size)})</p>}
                                    </div>
                                )}
                                {newMaterialType && materialTypeAcceptsLink(newMaterialType) && (
                                    <div>
                                        <Label htmlFor="material-link">Link URL <span className="text-destructive">*</span></Label>
                                        <Input id="material-link" type="url" value={newMaterialLink} onChange={(e) => setNewMaterialLink(e.target.value)} placeholder="e.g., https://example.com/resource" />
                                    </div>
                                )}
                                 <div>
                                    <Label htmlFor="material-description">Description (Optional)</Label>
                                    <Textarea id="material-description" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} placeholder="Briefly describe the material..." rows={3}/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="button" onClick={handleUploadMaterial} disabled={isUploading}>
                                    {isUploading ? <UploadCloud className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                    Upload Material
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoadingMaterials ? (
                        <div className="text-center py-10"><UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3 animate-pulse" /><p>Loading materials...</p></div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
                            <IconForType className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No Materials Uploaded Yet</h3>
                            <p className="text-sm text-muted-foreground mt-1">Click "Upload New Material" to add resources for this course.</p>
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">Type</TableHead>
                                    <TableHead>Name & Description</TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Size</TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.map(material => {
                                    const MaterialIcon = getMaterialTypeIcon(material.type);
                                    const uploadedDate = material.uploadedAt instanceof Timestamp 
                                                        ? material.uploadedAt.toDate() 
                                                        : (typeof material.uploadedAt === 'string' ? new Date(material.uploadedAt) : new Date());
                                    return (
                                    <TableRow key={material.id}>
                                        <TableCell className="text-center"><MaterialIcon className="h-5 w-5 mx-auto text-muted-foreground" /></TableCell>
                                        <TableCell className="font-medium">
                                            {material.name}
                                            {material.description && <p className="text-xs text-muted-foreground mt-0.5">{material.description}</p>}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-center">{material.size ? formatFileSize(material.size) : (materialTypeAcceptsLink(material.type) ? "Link" : "N/A")}</TableCell>
                                        <TableCell className="hidden md:table-cell text-center">{format(uploadedDate, "MMM dd, yyyy")}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            {materialTypeAcceptsLink(material.type) || material.url.startsWith("http") ? (
                                                <Button variant="outline" size="sm" onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}>
                                                    <OpenLinkIcon className="mr-1 h-4 w-4"/>Open Link
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}>
                                                    <Download className="mr-1 h-4 w-4"/>Download
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMaterial(material)}>
                                                <Trash2 className="h-4 w-4"/>
                                                <span className="sr-only">Delete {material.name}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Placeholder for Assignments Section */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Assignments</CardTitle>
                    <CardDescription>Create and manage assignments for this course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" disabled><PlusCircle className="mr-2 h-5 w-5"/>Create New Assignment (Coming Soon)</Button>
                    <p className="text-sm text-muted-foreground mt-3">Assignment management functionality will be implemented here.</p>
                </CardContent>
            </Card>
            
            {/* Placeholder for Grade Entry Section */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Grade Entry</CardTitle>
                    <CardDescription>Enter CA and Exam marks for students in this course.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="secondary" disabled><FileText className="mr-2 h-5 w-5"/>Enter/Upload Marks (Coming Soon)</Button>
                    <p className="text-sm text-muted-foreground mt-3">Mark entry and bulk upload features will be available here.</p>
                </CardContent>
            </Card>


        </motion.div>
    );
}

