
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
