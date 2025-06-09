
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
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

// Define the shape of the registration data, including new fields
interface RegistrationData {
  email: string;
  password?: string; // Password only needed for actual registration
  displayName: string;
  role?: Role;
  department?: string;
  level?: number;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  regionOfOrigin?: string;
  maritalStatus?: string;
  nidOrPassport?: string;
  nationality?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
}


interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: Role;
  login: (email: string, pass: string) => Promise<AppUser>;
  register: (data: RegistrationData) => Promise<AppUser>; // Updated signature
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchUserProfile: (firebaseUser: FirebaseUser) => Promise<UserProfile | null>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Fallback/default details, especially useful for mocking or when Firestore profile is incomplete.
// This example is tailored for "Atem Rolland", a Level 400 CESM student.
const FALLBACK_STUDENT_DETAILS = {
  displayName: "Atem Rolland",
  department: DEPARTMENTS.CESM, 
  level: 400, 
  program: "B.Eng. Computer Engineering and System Maintenance", // Specific program for CESM
  currentAcademicYear: ACADEMIC_YEARS[2], // e.g., 2024/2025
  currentSemester: SEMESTERS[0],   // e.g., First Semester
  isNewStudent: false, // A Level 400 student is not "new" in the HND Year 1 sense
  isGraduating: true, // Level 400 often implies graduating, adjust if program length varies
  matricule: `CUSMS/S/${ACADEMIC_YEARS[2].slice(2,4)}4${Math.floor(1000 + Math.random() * 9000)}` // Example Level 400 matricule for 24/25
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const currentProfileRef = useRef<UserProfile | null>(null);
  useEffect(() => {
    currentProfileRef.current = profile;
  }, [profile]);

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userProfileData = userDocSnap.data() as UserProfile;
      
      // Create a complete profile by merging Firebase Auth data, Firestore data, and fallbacks for students
      const completeProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email, 
        ...userProfileData, 
        // Ensure core fields have sensible defaults if missing from Firestore, especially for the "Atem Rolland" example
        displayName: userProfileData.displayName || firebaseUser.displayName || (userProfileData.role === 'student' ? FALLBACK_STUDENT_DETAILS.displayName : "User"),
        role: userProfileData.role || null, 
        // Student-specific fallbacks if role is student and data is missing
        department: userProfileData.role === 'student' ? (userProfileData.department || FALLBACK_STUDENT_DETAILS.department) : userProfileData.department,
        level: userProfileData.role === 'student' ? (userProfileData.level || FALLBACK_STUDENT_DETAILS.level) : userProfileData.level,
        program: userProfileData.role === 'student' ? (userProfileData.program || FALLBACK_STUDENT_DETAILS.program) : userProfileData.program,
        currentAcademicYear: userProfileData.role === 'student' ? (userProfileData.currentAcademicYear || FALLBACK_STUDENT_DETAILS.currentAcademicYear) : userProfileData.currentAcademicYear,
        currentSemester: userProfileData.role === 'student' ? (userProfileData.currentSemester || FALLBACK_STUDENT_DETAILS.currentSemester) : userProfileData.currentSemester,
        isNewStudent: userProfileData.role === 'student' ? (userProfileData.isNewStudent === undefined ? (userProfileData.level === VALID_LEVELS[0]) : userProfileData.isNewStudent) : userProfileData.isNewStudent, // Default for new student: true if Level 200
        isGraduating: userProfileData.role === 'student' ? (userProfileData.isGraduating === undefined ? (userProfileData.level === VALID_LEVELS[VALID_LEVELS.length -1]) : userProfileData.isGraduating) : userProfileData.isGraduating, // Default for graduating: true if highest level
        matricule: userProfileData.role === 'student' ? (userProfileData.matricule || FALLBACK_STUDENT_DETAILS.matricule) : userProfileData.matricule,
        
        // Optional personal details
        gender: userProfileData.gender,
        dateOfBirth: userProfileData.dateOfBirth,
        placeOfBirth: userProfileData.placeOfBirth,
        regionOfOrigin: userProfileData.regionOfOrigin,
        maritalStatus: userProfileData.maritalStatus,
        nidOrPassport: userProfileData.nidOrPassport,
        nationality: userProfileData.nationality,
        phone: userProfileData.phone,
        address: userProfileData.address,
        guardianName: userProfileData.guardianName,
        guardianPhone: userProfileData.guardianPhone,
        guardianAddress: userProfileData.guardianAddress,
        
        status: userProfileData.status || 'active', // Default to active
        lastLogin: userProfileData.lastLogin, // Can be updated on login
        createdAt: userProfileData.createdAt || serverTimestamp(), 
        updatedAt: userProfileData.updatedAt || serverTimestamp(), 
      };

      // Compare with current profile state before setting to avoid unnecessary re-renders
      let changed = true; 
      const existingProfile = currentProfileRef.current;
      if (existingProfile &&
          existingProfile.uid === completeProfile.uid &&
          existingProfile.displayName === completeProfile.displayName &&
          existingProfile.email === completeProfile.email &&
          existingProfile.role === completeProfile.role &&
          existingProfile.photoURL === completeProfile.photoURL &&
          existingProfile.level === completeProfile.level &&
          existingProfile.department === completeProfile.department &&
          existingProfile.program === completeProfile.program &&
          existingProfile.currentAcademicYear === completeProfile.currentAcademicYear &&
          existingProfile.currentSemester === completeProfile.currentSemester &&
          existingProfile.matricule === completeProfile.matricule &&
          existingProfile.phone === completeProfile.phone && 
          existingProfile.address === completeProfile.address
        ) {
        changed = false;
      }

      if (changed) {
        setProfile(completeProfile);
        setRole(completeProfile.role);
      }
      return completeProfile;
    } else {
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
      // Potentially create a basic profile here if that's desired for new Firebase Auth users without a Firestore doc
      setProfile(null); 
      setRole(null);    
      return null;
    }
  }, []); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const fetchedProfileData = await fetchUserProfile(firebaseUser);
        setUser({ ...firebaseUser, profile: fetchedProfileData || undefined });
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
    // Potentially update lastLogin here
    // if (userProfileData) {
    //   const userDocRef = doc(db, "users", firebaseUser.uid);
    //   await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
    // }
    return appUser;
  };

  const register = async (data: RegistrationData): Promise<AppUser> => {
    if (!data.password) {
      throw new Error("Password is required for registration.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    const userRole = data.role || 'student'; 
    
    let studentProgram = "Program to be assigned";
    if (userRole === 'student' && data.department === DEPARTMENTS.CESM) {
      studentProgram = "B.Eng. Computer Engineering and System Maintenance";
    } else if (userRole === 'student') {
      // A more generic or lookup-based approach would be better for other departments
      studentProgram = `${data.department} Program (Example)`; // Placeholder
    }


    // Construct the initial UserProfile to save to Firestore
    const userProfileDataToSave: Omit<UserProfile, 'uid' | 'email' | 'photoURL'> & { role: Role } = {
      displayName: data.displayName,
      role: userRole,
      // Student-specific fields are only added if role is student
      department: userRole === 'student' ? (data.department || FALLBACK_STUDENT_DETAILS.department) : undefined,
      level: userRole === 'student' ? (data.level || VALID_LEVELS[0]) : undefined, // Default to lowest level if not provided
      program: userRole === 'student' ? studentProgram : undefined,
      currentAcademicYear: userRole === 'student' ? ACADEMIC_YEARS[2] : undefined, // Example default
      currentSemester: userRole === 'student' ? SEMESTERS[0] : undefined,    // Example default
      isNewStudent: userRole === 'student' ? ( (data.level || VALID_LEVELS[0]) === VALID_LEVELS[0] ) : undefined,
      isGraduating: userRole === 'student' ? ( (data.level || VALID_LEVELS[0]) === VALID_LEVELS[VALID_LEVELS.length - 1] ) : undefined, // Example, needs logic for actual final year
      matricule: userRole === 'student' ? `CUSMS/S/${ACADEMIC_YEARS[2].slice(2,4)}${String(data.level || VALID_LEVELS[0]).charAt(0)}${Math.floor(1000 + Math.random() * 9000)}` : undefined, // Example matricule

      gender: userRole === 'student' ? data.gender : undefined,
      dateOfBirth: userRole === 'student' ? data.dateOfBirth : undefined,
      placeOfBirth: userRole === 'student' ? data.placeOfBirth : undefined,
      regionOfOrigin: userRole === 'student' ? data.regionOfOrigin : undefined,
      maritalStatus: userRole === 'student' ? data.maritalStatus : undefined,
      nidOrPassport: userRole === 'student' ? data.nidOrPassport : undefined,
      nationality: userRole === 'student' ? data.nationality : undefined,
      phone: userRole === 'student' ? data.phone : undefined,
      address: userRole === 'student' ? data.address : undefined,
      guardianName: userRole === 'student' ? data.guardianName : undefined,
      guardianPhone: userRole === 'student' ? data.guardianPhone : undefined,
      guardianAddress: userRole === 'student' ? data.guardianAddress : undefined,
      
      status: 'active', // New users are active by default
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const finalProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL, 
      ...userProfileDataToSave,
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), finalProfile);

    setProfile(finalProfile); 
    setRole(userRole);       
    const appUser = { ...firebaseUser, profile: finalProfile };
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

