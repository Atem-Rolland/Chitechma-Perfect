
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
  studentId?: string; 
  amount: number;
  currency: string; 
  date: string; 
  purpose: string; 
  status: "Completed" | "Pending" | "Failed";
  transactionId?: string; 
  method?: "MTN Mobile Money" | "Orange Money" | "Bank Transfer" | "Card";
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string; 
  status: "Pending Submission" | "Submitted" | "Graded" | "Late";
  grade?: string; 
  feedback?: string;
  submissionDate?: string; 
  submittedFile?: { name: string; type: string; size: number }; 
  submittedText?: string;
  allowsResubmission?: boolean;
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
