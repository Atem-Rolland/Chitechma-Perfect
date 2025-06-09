
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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
      
      const completeProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email, 
        ...userProfileData, 
        displayName: userProfileData.displayName || firebaseUser.displayName || (userProfileData.role === 'student' ? FALLBACK_STUDENT_DETAILS.displayName : "User"),
        role: userProfileData.role || null, 
        department: userProfileData.role === 'student' ? (userProfileData.department || FALLBACK_STUDENT_DETAILS.department) : userProfileData.department,
        level: userProfileData.role === 'student' ? (userProfileData.level || FALLBACK_STUDENT_DETAILS.level) : userProfileData.level,
        program: userProfileData.role === 'student' ? (userProfileData.program || FALLBACK_STUDENT_DETAILS.program) : userProfileData.program,
        currentAcademicYear: userProfileData.role === 'student' ? (userProfileData.currentAcademicYear || FALLBACK_STUDENT_DETAILS.currentAcademicYear) : userProfileData.currentAcademicYear,
        currentSemester: userProfileData.role === 'student' ? (userProfileData.currentSemester || FALLBACK_STUDENT_DETAILS.currentSemester) : userProfileData.currentSemester,
        isNewStudent: userProfileData.role === 'student' ? (userProfileData.isNewStudent === undefined ? (userProfileData.level === VALID_LEVELS[0]) : userProfileData.isNewStudent) : userProfileData.isNewStudent,
        isGraduating: userProfileData.role === 'student' ? (userProfileData.isGraduating === undefined ? (userProfileData.level === VALID_LEVELS[VALID_LEVELS.length -1]) : userProfileData.isGraduating) : userProfileData.isGraduating,
        matricule: userProfileData.role === 'student' ? (userProfileData.matricule || FALLBACK_STUDENT_DETAILS.matricule) : userProfileData.matricule,
        
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
        
        status: userProfileData.status || 'active',
        lastLogin: userProfileData.lastLogin, 
        createdAt: userProfileData.createdAt || serverTimestamp(), 
        updatedAt: userProfileData.updatedAt || serverTimestamp(), 
      };

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
    if (userProfileData && userProfileData.uid) {
      const userDocRef = doc(db, "users", userProfileData.uid);
      try {
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
      } catch (updateError) {
        console.error("Error updating lastLogin:", updateError);
      }
    }
    return appUser;
  };

  const register = async (data: RegistrationData): Promise<AppUser> => {
    if (!data.password) {
      throw new Error("Password is required for registration.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    const userRole = data.role || 'student'; 
    
    // Base profile data common to all users
    const userProfileDataForFirestore: any = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: data.displayName,
      role: userRole,
      status: 'active', 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (firebaseUser.photoURL) { // Include photoURL if Firebase provided one (e.g. from social auth)
      userProfileDataForFirestore.photoURL = firebaseUser.photoURL;
    }

    // Add student-specific fields only if the role is 'student'
    if (userRole === 'student') {
      let studentProgram = "Program to be assigned";
      if (data.department === DEPARTMENTS.CESM) {
        studentProgram = "B.Eng. Computer Engineering and System Maintenance";
      } else if (data.department) {
        studentProgram = `${data.department} Program (Example)`;
      }

      // Required student fields (validated by Zod) or with defaults
      userProfileDataForFirestore.department = data.department || FALLBACK_STUDENT_DETAILS.department;
      userProfileDataForFirestore.level = data.level || VALID_LEVELS[0];
      userProfileDataForFirestore.program = studentProgram;
      userProfileDataForFirestore.currentAcademicYear = ACADEMIC_YEARS[2]; // Default year
      userProfileDataForFirestore.currentSemester = SEMESTERS[0];    // Default semester
      userProfileDataForFirestore.isNewStudent = (data.level || VALID_LEVELS[0]) === VALID_LEVELS[0];
      userProfileDataForFirestore.isGraduating = (data.level || VALID_LEVELS[0]) === VALID_LEVELS[VALID_LEVELS.length - 1];
      userProfileDataForFirestore.matricule = `CUSMS/S/${ACADEMIC_YEARS[2].slice(2,4)}${String(data.level || VALID_LEVELS[0]).charAt(0)}${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Student personal details required by Zod schema
      userProfileDataForFirestore.gender = data.gender;
      userProfileDataForFirestore.dateOfBirth = data.dateOfBirth;
      userProfileDataForFirestore.placeOfBirth = data.placeOfBirth;
      userProfileDataForFirestore.nationality = data.nationality;
      userProfileDataForFirestore.phone = data.phone;
      userProfileDataForFirestore.address = data.address;
      userProfileDataForFirestore.guardianName = data.guardianName;
      userProfileDataForFirestore.guardianPhone = data.guardianPhone;

      // Optional student personal details (only add if provided in form)
      if (data.regionOfOrigin) userProfileDataForFirestore.regionOfOrigin = data.regionOfOrigin;
      if (data.maritalStatus) userProfileDataForFirestore.maritalStatus = data.maritalStatus;
      if (data.nidOrPassport) userProfileDataForFirestore.nidOrPassport = data.nidOrPassport;
      if (data.guardianAddress) userProfileDataForFirestore.guardianAddress = data.guardianAddress;
    }
    
    await setDoc(doc(db, "users", firebaseUser.uid), userProfileDataForFirestore);

    // Create the UserProfile object for local state based on what was saved
    // This ensures consistency with the Firestore document structure
    const finalProfileForState: UserProfile = {
        uid: userProfileDataForFirestore.uid,
        email: userProfileDataForFirestore.email,
        displayName: userProfileDataForFirestore.displayName,
        role: userProfileDataForFirestore.role,
        photoURL: userProfileDataForFirestore.photoURL || null, // Ensure it's null if not present
        department: userProfileDataForFirestore.department, // Will be undefined if not a student, which matches UserProfile type
        level: userProfileDataForFirestore.level,
        program: userProfileDataForFirestore.program,
        currentAcademicYear: userProfileDataForFirestore.currentAcademicYear,
        currentSemester: userProfileDataForFirestore.currentSemester,
        isNewStudent: userProfileDataForFirestore.isNewStudent,
        isGraduating: userProfileDataForFirestore.isGraduating,
        matricule: userProfileDataForFirestore.matricule,
        gender: userProfileDataForFirestore.gender,
        dateOfBirth: userProfileDataForFirestore.dateOfBirth,
        placeOfBirth: userProfileDataForFirestore.placeOfBirth,
        regionOfOrigin: userProfileDataForFirestore.regionOfOrigin,
        maritalStatus: userProfileDataForFirestore.maritalStatus,
        nidOrPassport: userProfileDataForFirestore.nidOrPassport,
        nationality: userProfileDataForFirestore.nationality,
        phone: userProfileDataForFirestore.phone,
        address: userProfileDataForFirestore.address,
        guardianName: userProfileDataForFirestore.guardianName,
        guardianPhone: userProfileDataForFirestore.guardianPhone,
        guardianAddress: userProfileDataForFirestore.guardianAddress,
        status: userProfileDataForFirestore.status,
        // For timestamps, convert to ISO string for local state consistency or keep as serverTimestamp for Firestore
        // For simplicity and immediate local use, we can use new Date().toISOString() here
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
    };
    
    setProfile(finalProfileForState); 
    setRole(userRole);       
    const appUser = { ...firebaseUser, profile: finalProfileForState };
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

    