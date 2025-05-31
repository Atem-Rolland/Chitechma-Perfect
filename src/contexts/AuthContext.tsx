
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

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: Role;
  login: (email: string, pass: string) => Promise<AppUser>;
  register: (email: string, pass: string, displayName: string, role?: Role) => Promise<AppUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchUserProfile: (firebaseUser: FirebaseUser) => Promise<UserProfile | null>; // Exposed for refresh
  // mfaSetup: () => Promise<void>; // Placeholder for MFA
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const MOCK_INITIAL_STUDENT_DETAILS = {
  department: "Department of computer engineering and system maintenance",
  level: 200, // Changed from 100 to 200
  program: "B.Eng. Computer Engineering and System Maintenance",
  currentAcademicYear: "2024/2025",
  currentSemester: "First Semester",
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
      // Ensure all fields are present, provide defaults if necessary for students
      const completeProfile: UserProfile = {
        ...userProfileData,
        department: userProfileData.department || (userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.department : undefined),
        level: userProfileData.level || (userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.level : undefined),
        program: userProfileData.program || (userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.program : undefined),
        currentAcademicYear: userProfileData.currentAcademicYear || (userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.currentAcademicYear : undefined),
        currentSemester: userProfileData.currentSemester || (userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.currentSemester : undefined),
        isNewStudent: userProfileData.isNewStudent === undefined && userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.isNewStudent : userProfileData.isNewStudent,
        isGraduating: userProfileData.isGraduating === undefined && userProfileData.role === 'student' ? MOCK_INITIAL_STUDENT_DETAILS.isGraduating : userProfileData.isGraduating,
      };
      setProfile(completeProfile);
      setRole(completeProfile.role);
      return completeProfile;
    } else {
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid, "A new profile might be created if this is a new registration.");
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

  const register = async (email: string, password: string, displayName: string, userRole: Role = 'student'): Promise<AppUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    let studentSpecificDetails = {};
    if (userRole === 'student') {
      studentSpecificDetails = {
        department: MOCK_INITIAL_STUDENT_DETAILS.department,
        level: MOCK_INITIAL_STUDENT_DETAILS.level,
        program: MOCK_INITIAL_STUDENT_DETAILS.program,
        currentAcademicYear: MOCK_INITIAL_STUDENT_DETAILS.currentAcademicYear,
        currentSemester: MOCK_INITIAL_STUDENT_DETAILS.currentSemester,
        isNewStudent: MOCK_INITIAL_STUDENT_DETAILS.isNewStudent,
        isGraduating: MOCK_INITIAL_STUDENT_DETAILS.isGraduating,
      };
    }

    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || firebaseUser.displayName,
      role: userRole,
      photoURL: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...studentSpecificDetails,
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
