
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
  score: number; 
  gradeLetter: string; 
  gradePoint: number; 
  academicYear: string; 
  semester: string; 
  caDetails?: CaDetails; 
  examScore?: number; 
  isPass?: boolean; 
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  currency: string; 
  date: any; 
  purpose: string; 
  status: "pending" | "completed" | "failed";
  transactionId?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string; // ISO string for date
  status: "Pending Submission" | "Submitted" | "Graded" | "Late";
  grade?: string; // e.g., "85/100" or "A"
  feedback?: string;
  submissionDate?: string; // ISO string for date
  submittedFile?: { name: string; type: string; size: number }; // Mock file info
  submittedText?: string;
  allowsResubmission?: boolean;
}

// Forum Specific Types
export interface ForumUser {
  id: string;
  name: string;
  avatarUrl?: string; // URL to user's avatar image
}

export interface ForumPost {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string; // ISO date string
  replyToId?: string; // ID of the post this is a reply to (for threaded replies)
}

export interface ForumThread {
  id: string;
  courseId: string; // To associate thread with a course
  courseName?: string; // Optional, for display convenience
  title: string;
  originalPost: ForumPost; // The first post in the thread
  replies: ForumPost[]; // Array of replies to the original post
  author: ForumUser; // Author of the original post/thread
  createdAt: string; // ISO date string for thread creation
  lastActivityAt: string; // ISO date string for the last reply or original post if no replies
  lastActivityBy?: ForumUser; // User who made the last activity
  replyCount: number;
  viewCount: number; // Simulated
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface MockCourseForum { // Simplified course for forum context
  id: string;
  name: string;
}
