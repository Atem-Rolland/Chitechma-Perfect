
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser, UserProfile, Role } from '@/types';
import { useRouter } from 'next/navigation';
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from '@/config/data';


interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: Role;
  login: (email: string, pass: string) => Promise<AppUser>;
  register: (email: string, pass: string, displayName: string, role?: Role, department?: string, level?: number) => Promise<AppUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchUserProfile: (firebaseUser: FirebaseUser) => Promise<UserProfile | null>; // Exposed for refresh
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Fallback details if not provided or fetched, especially for initial setup or missing profile data
const FALLBACK_STUDENT_DETAILS = {
  displayName: "New Student",
  department: DEPARTMENTS.CESM, // Default department
  level: VALID_LEVELS[0], // Default to the first valid level (e.g., 200)
  program: "B.Eng. Computer Engineering and System Maintenance", // Generic program
  currentAcademicYear: ACADEMIC_YEARS[1], // e.g., 2024/2025
  currentSemester: SEMESTERS[0], // e.g., First Semester
  isNewStudent: true,
  isGraduating: false,
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userProfileData = userDocSnap.data() as UserProfile;
      
      // Ensure all fields are present, provide defaults if necessary
      const completeProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...userProfileData, // Spread fetched data first
        displayName: userProfileData.displayName || firebaseUser.displayName || (userProfileData.role === 'student' ? FALLBACK_STUDENT_DETAILS.displayName : "User"),
        role: userProfileData.role || null, // Ensure role exists
        // For students, ensure academic details have fallbacks if not present
        department: userProfileData.role === 'student' ? (userProfileData.department || FALLBACK_STUDENT_DETAILS.department) : userProfileData.department,
        level: userProfileData.role === 'student' ? (userProfileData.level || FALLBACK_STUDENT_DETAILS.level) : userProfileData.level,
        program: userProfileData.role === 'student' ? (userProfileData.program || FALLBACK_STUDENT_DETAILS.program) : userProfileData.program,
        currentAcademicYear: userProfileData.role === 'student' ? (userProfileData.currentAcademicYear || FALLBACK_STUDENT_DETAILS.currentAcademicYear) : userProfileData.currentAcademicYear,
        currentSemester: userProfileData.role === 'student' ? (userProfileData.currentSemester || FALLBACK_STUDENT_DETAILS.currentSemester) : userProfileData.currentSemester,
        isNewStudent: userProfileData.role === 'student' ? (userProfileData.isNewStudent === undefined ? (userProfileData.level === VALID_LEVELS[0]) : userProfileData.isNewStudent) : userProfileData.isNewStudent,
        isGraduating: userProfileData.role === 'student' ? (userProfileData.isGraduating === undefined ? (userProfileData.level === VALID_LEVELS[VALID_LEVELS.length -1]) : userProfileData.isGraduating) : userProfileData.isGraduating,
      };
      setProfile(completeProfile);
      setRole(completeProfile.role);
      return completeProfile;
    } else {
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid, ". A new profile might be created upon registration flow completion.");
      setProfile(null);
      setRole(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfileData = await fetchUserProfile(firebaseUser);
        setUser({ ...firebaseUser, profile: userProfileData || undefined });
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<AppUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const userProfileData = await fetchUserProfile(firebaseUser);
    const appUser = { ...firebaseUser, profile: userProfileData || undefined };
    setUser(appUser);
    return appUser;
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    userRole: Role = 'student',
    department?: string,
    level?: number
  ): Promise<AppUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    let roleSpecificDetails: Partial<UserProfile> = { displayName };

    if (userRole === 'student') {
      roleSpecificDetails = {
        ...roleSpecificDetails,
        department: department || FALLBACK_STUDENT_DETAILS.department,
        level: level || FALLBACK_STUDENT_DETAILS.level,
        program: FALLBACK_STUDENT_DETAILS.program, // Default program
        currentAcademicYear: FALLBACK_STUDENT_DETAILS.currentAcademicYear, // Default academic year
        currentSemester: FALLBACK_STUDENT_DETAILS.currentSemester, // Default semester
        isNewStudent: level === VALID_LEVELS[0] || level === undefined, // True if lowest level or undefined
        isGraduating: level === VALID_LEVELS[VALID_LEVELS.length - 1] // True if highest level (e.g. 400 for a 4-year program)
      };
    }

    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: userRole,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...roleSpecificDetails, // displayName is included here
    };
    await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

    setProfile(userProfile);
    setRole(userRole);
    const appUser = { ...firebaseUser, profile: userProfile };
    setUser(appUser);
    return appUser;
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setRole(null);
    router.push('/login'); 
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, role, login, register, logout, resetPassword, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
