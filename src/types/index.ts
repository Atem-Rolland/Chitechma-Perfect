
import type { User as FirebaseUser } from 'firebase/auth';
import {
  FileText,
  FilePresentation,
  Youtube,
  Link as LinkIconLucide, // Aliased to avoid conflict with NextLink if used in same file
  FolderArchive,          // Correct icon name from lucide-react
  Image as ImageIcon,     // Aliased for clarity or to avoid conflict
  File as DefaultFileIcon // Aliased
} from 'lucide-react';
import type React from 'react';


export type Role = "student" | "lecturer" | "admin" | "finance" | null;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: Role;
  
  // Student-specific academic details
  // These are crucial for academic operations and should be set for student roles.
  // For transfer students (e.g., joining at Level 400 from HND), 'previousRecordsId' or similar
  // might be needed in the future to link to HND/transferred credits and results.
  // The system will require a new feature to manage the input of these prior academic records.
  department?: string; // e.g., "Department of Computer Engineering and System Maintenance"
  level?: number; // e.g., 200, 300, 400
  program?: string; // e.g., "B.Eng. Computer Engineering and System Maintenance", "HND in Business Studies"
  currentAcademicYear?: string; // e.g., "2024/2025"
  currentSemester?: string; // e.g., "First Semester"
  isNewStudent?: boolean; // Typically true for Level 200, false for transfers or continuing. Admins should verify for transfers.
  isGraduating?: boolean; // True if in final year of their current program and eligible for graduation.
  matricule?: string; // Unique student ID

  // Student-specific personal details (often required for registration)
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
  
  status?: 'active' | 'suspended' | 'pending_approval'; // User account status
  lastLogin?: any; // Firestore Timestamp or ISO string for last login
  
  createdAt?: any; // Firestore Timestamp or ISO string when the profile was created
  updatedAt?: any; // Firestore Timestamp or ISO string when the profile was last updated
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
  status?: "Open" | "Closed" | "Grading" | "Completed"; 
  totalSubmissions?: number; 
  gradedSubmissions?: number; 
  // Fields from mock data that might be useful
  courseCode?: string; // Denormalized for easier display
  courseName?: string; // Denormalized
  allowsResubmission?: boolean; // If student can resubmit
  submittedText?: string; // If a student's text submission (relevant for student view)
  submittedFile?: { name: string; type: string; size: number }; // (relevant for student view)
  submissionDate?: string; // (relevant for student view)
  grade?: string; // (relevant for student view, e.g., "85/100")
  feedback?: string; // (relevant for student view)
}

export interface StudentSubmissionFile {
  name: string;
  url: string; // Public URL from Supabase
  type: string; // MIME type
  size: number; // in bytes
  storagePath?: string; // Path in Supabase for potential future management (e.g., if submissions can be deleted by admin)
}

export interface Submission {
  id: string; // Firestore document ID
  assignmentId: string;
  courseId: string; 
  studentId: string;
  studentName?: string; // Denormalized for display
  studentMatricule?: string; // Denormalized for display
  submittedAt: any; // Firestore Timestamp
  files?: StudentSubmissionFile[];
  textSubmission?: string;
  grade?: number | null; // Score given by lecturer out of assignment.maxScore
  feedback?: string;
  isLate?: boolean;
  status: 'Submitted' | 'Late Submission' | 'Graded' | 'Pending Review'; // Status of this specific submission
  lecturerId?: string; // To scope feedback/grading if multiple lecturers on a course
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

export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'success' 
  | 'course_update' 
  | 'grade_release' 
  | 'payment_due' 
  | 'assignment_due'
  | 'new_material'
  | 'forum_reply';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string; // ISO string date
  isRead: boolean;
  link?: string; // Optional link to a relevant page in the app
  icon?: React.ElementType; // For custom icons per notification type
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
  switch (type) {
    case "pdf": return FileText;
    case "docx": return FileText;
    case "pptx": return FilePresentation;
    case "video_link": return Youtube;
    case "web_link": return LinkIconLucide;
    case "zip": return FolderArchive;
    case "image": return ImageIcon;
    default: return DefaultFileIcon;
  }
};
