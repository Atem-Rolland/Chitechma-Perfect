
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

export interface Grade {
  id: string; // Unique ID for the grade entry
  studentId: string; // Links to UserProfile.uid // In a real app, this would be fetched based on logged-in user
  courseId: string; // Links to Course.id
  courseCode: string;
  courseName: string;
  credits: number;
  score: number; // e.g., 75 (0-100)
  gradeLetter: string; // e.g., "A", "B+", "C"
  gradePoint: number; // e.g., 4.0, 3.5, 2.0 (based on university scale)
  academicYear: string; // e.g., "2023/2024"
  semester: string; // e.g., "First Semester"
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  currency: string; // e.g., "XAF", "USD", "NGN"
  date: any; // Firestore Timestamp
  purpose: string; // e.g., "Tuition Fee - Fall 2024"
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  // Add other payment-specific fields
}

// For react-hook-form, define schema types if using Zod
// Example:
// import { z } from 'zod';
// export const LoginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });
// export type LoginFormData = z.infer<typeof LoginSchema>;

    