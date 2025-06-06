
import type { User as FirebaseUser } from 'firebase/auth';

export type Role = "student" | "lecturer" | "admin" | "finance" | null;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: Role;
  
  department?: string; 
  level?: number; 
  program?: string; 
  currentAcademicYear?: string; 
  currentSemester?: string; 
  isNewStudent?: boolean; 
  isGraduating?: boolean; 
  matricule?: string;

  gender?: "Male" | "Female" | "Other" | string;
  dateOfBirth?: string; 
  placeOfBirth?: string;
  regionOfOrigin?: string;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed" | string;
  nidOrPassport?: string;
  nationality?: string;
  
  phone?: string;
  address?: string;
  
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  
  createdAt?: any; 
  updatedAt?: any; 
}

export interface AppUser extends FirebaseUser {
  profile?: UserProfile; 
}

export interface StudentDetails {
  userId: string; 
  matricule: string;
  program: string;
  department: string;
  idCardURL?: string;
  
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description:string;
  department: string; 
  lecturerId: string; 
  lecturerName?: string; 
  schedule?: string; 
  credits: number;
  type: 'Compulsory' | 'Elective' | 'General';
  level: number; 
  prerequisites?: string[]; 
  semester: string; 
  academicYear: string; 
}

export interface CaDetails {
  assignments?: number; 
  groupWork?: number;   
  attendance?: number;  
  writtenCA?: number;   
  totalCaScore?: number; 
}

export interface Grade {
  id: string; 
  studentId: string; 
  courseId: string; 
  courseCode: string;
  courseName: string;
  credits: number;
  score: number | null; 
  gradeLetter: string | null; 
  gradePoint: number | null; 
  academicYear: string; 
  semester: string; 
  caDetails?: CaDetails; 
  examScore?: number | null; 
  isPass?: boolean; 
  isPublished?: boolean; 
  remark?: string; 
}

export interface Payment {
  id: string;
  studentId?: string; 
  amount: number;
  currency: string; 
  date: string; 
  purpose: string; 
  status: "Completed" | "Pending" | "Failed";
  transactionId?: string; 
  method?: "MTN Mobile Money" | "Orange Money" | "Bank Transfer" | "Card";
}

export type MaterialType = "pdf" | "docx" | "pptx" | "video_link" | "web_link" | "zip" | "image" | "other";

export interface CourseMaterial {
  id: string; // Firestore document ID
  courseId: string;
  lecturerId: string; 
  name: string; 
  type: MaterialType;
  url: string; 
  storagePath?: string; // Path in Supabase storage, if it's a file
  fileName?: string; 
  fileType?: string; 
  size?: number; 
  uploadedAt: any; 
  description?: string; 
}

export interface AssignmentResource {
  name: string;
  url: string; // URL to the file in Supabase Storage
  type?: string; // Mime type
  size?: number; // Size in bytes
  storagePath?: string; // Path in Supabase storage, for deletion
}

export interface Assignment {
  id: string; // Firestore document ID
  courseId: string;
  lecturerId: string;
  title: string;
  description: string;
  dueDate: any; // Timestamp or ISO string
  maxScore: number;
  allowedFileTypes?: string; // e.g., ".pdf,.docx,.zip"
  assignmentResources?: AssignmentResource[]; // Files uploaded by lecturer with assignment
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
  status?: "Open" | "Closed" | "Grading" | "Completed"; // Optional status
  totalSubmissions?: number; // (For display - could be dynamic)
  gradedSubmissions?: number; // (For display - could be dynamic)
}

export interface StudentSubmissionFile {
  name: string;
  url: string; // URL to the file in Supabase Storage
  type: string; // Mime type
  size: number; // Size in bytes
}

export interface Submission {
  id: string; // Firestore document ID
  assignmentId: string;
  studentId: string;
  studentName?: string; // Denormalized for easier display
  studentMatricule?: string; // Denormalized
  submittedAt: any; // Timestamp
  files?: StudentSubmissionFile[];
  textSubmission?: string;
  grade?: number | null; // Score given by lecturer
  feedback?: string;
  isLate?: boolean;
  lecturerId?: string; // To scope feedback/grading
}


export interface ForumUser {
  id: string;
  name: string;
  avatarUrl?: string; 
}

export interface ForumPost {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string; 
  replyToId?: string; 
}

export interface ForumThread {
  id: string;
  courseId: string; 
  courseName?: string; 
  title: string;
  originalPost: ForumPost; 
  replies: ForumPost[]; 
  author: ForumUser; 
  createdAt: string; 
  lastActivityAt: string; 
  lastActivityBy?: ForumUser; 
  replyCount: number;
  viewCount: number; 
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface MockCourseForum { 
  id: string;
  name: string;
}

export interface LiveClass {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  lecturerName: string;
  dateTime: string; 
  meetingLink: string; 
  durationMinutes?: number; 
}

export interface FeeItem {
  name: string;
  amount: number;
  condition?: string; 
}

export interface VideoLecture {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; 
  duration: string; 
  uploadDate: string; 
  sourceType?: "Google Classroom" | "CUSMS Platform";
  sourceDetails?: string; 
  classroomLink?: string; 
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface TimetableEntry {
  id: string; 
  courseId: string; 
  courseCode: string;
  courseTitle: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; 
  endTime: string;   
  venue: string;     
  lecturerName?: string;
  semester: string; 
  academicYear: string; 
}

// For Course Materials Manager by Lecturer
export const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: "pdf", label: "PDF Document" },
  { value: "docx", label: "Word Document" },
  { value: "pptx", label: "PowerPoint Presentation" },
  { value: "image", label: "Image (PNG, JPG, GIF)" },
  { value: "zip", label: "ZIP Archive" },
  { value: "video_link", label: "Video Link (YouTube, Vimeo, etc.)" },
  { value: "web_link", label: "Web Link (Article, Resource)" },
  { value: "other", label: "Other File Type" },
];

export const materialTypeAcceptsFile = (type: MaterialType | undefined): boolean => {
  if (!type) return false;
  return !["video_link", "web_link"].includes(type);
};

export const materialTypeAcceptsLink = (type: MaterialType | undefined): boolean => {
  if (!type) return false;
  return ["video_link", "web_link"].includes(type);
};

export const getMaterialTypeIcon = (type: MaterialType): React.ElementType => {
  const LucideIcons = require("lucide-react");
  switch (type) {
    case "pdf": return LucideIcons.FileText;
    case "docx": return LucideIcons.FileText; 
    case "pptx": return LucideIcons.FilePresentation;
    case "video_link": return LucideIcons.Youtube;
    case "web_link": return LucideIcons.Link;
    case "zip": return LucideIcons.Archive;
    case "image": return LucideIcons.Image; 
    default: return LucideIcons.File;
  }
};

