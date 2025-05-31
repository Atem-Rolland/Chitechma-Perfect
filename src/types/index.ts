
import type { User as FirebaseUser } from 'firebase/auth';

export type Role = "student" | "lecturer" | "admin" | "finance" | null;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: Role;
  department?: string; // Student's department
  level?: number; // Student's current level
  program?: string; // Student's program of study
  currentAcademicYear?: string; // Student's current academic year
  currentSemester?: string; // Student's current semester
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface AppUser extends FirebaseUser {
  profile?: UserProfile; // Extended profile information
}

export interface StudentDetails {
  userId: string; // links to UserProfile.uid
  matricule: string;
  program: string;
  department: string;
  idCardURL?: string;
  // Add other student-specific fields
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  lecturerId: string; 
  lecturerName?: string; 
  schedule?: string; 
  credits: number;
  type: 'Compulsory' | 'Elective' | 'General';
  level: number; 
  prerequisites?: string[]; 
  semester: string; // e.g., "First Semester", "Second Semester"
  academicYear: string; // e.g., "2024/2025"
}

export interface CaDetails {
  assignments?: number; // e.g., out of 5
  groupWork?: number;   // e.g., out of 5
  attendance?: number;  // e.g., out of 5
  writtenCA?: number;   // e.g., out of 15
  totalCaScore?: number; // e.g., out of 30
}

export interface Grade {
  id: string; // Unique ID for the grade entry
  studentId: string; 
  courseId: string; 
  courseCode: string;
  courseName: string;
  credits: number;
  score: number; // Final score (e.g., CA + Exam = 75 out of 100)
  gradeLetter: string; 
  gradePoint: number; 
  academicYear: string; 
  semester: string; 
  caDetails?: CaDetails; // Detailed CA breakdown
  examScore?: number; // Exam score (e.g., out of 70)
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  currency: string; 
  date: any; // Firestore Timestamp
  purpose: string; 
  status: "pending" | "completed" | "failed";
  transactionId?: string;
}
