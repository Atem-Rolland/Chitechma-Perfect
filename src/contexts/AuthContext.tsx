
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

const FALLBACK_STUDENT_DETAILS = {
  displayName: "Atem Rolland", // Keep this specific for the demo user check
  department: DEPARTMENTS.CESM,
  level: 400,
  program: "B.Eng. Computer Engineering and System Maintenance",
  currentAcademicYear: ACADEMIC_YEARS[2], // 2024/2025
  currentSemester: SEMESTERS[0], // First Semester
  isNewStudent: false,
  isGraduating: true,
  matricule: `CUSMS/S/${ACADEMIC_YEARS[2].slice(2,4)}4${Math.floor(1000 + Math.random() * 9000)}` // Example matricule for L400
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfileData = userDocSnap.data() as UserProfile; 

        let completeProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || userProfileData.email,
          displayName: userProfileData.displayName || firebaseUser.displayName || "User",
          photoURL: userProfileData.photoURL || firebaseUser.photoURL || null,
          role: userProfileData.role || null,
          department: userProfileData.department,
          level: userProfileData.level,
          program: userProfileData.program,
          currentAcademicYear: userProfileData.currentAcademicYear,
          currentSemester: userProfileData.currentSemester,
          isNewStudent: userProfileData.isNewStudent,
          isGraduating: userProfileData.isGraduating,
          matricule: userProfileData.matricule,
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

        if (userProfileData.role === 'student' && userProfileData.displayName === "Atem Rolland") {
            completeProfile.department = userProfileData.department || FALLBACK_STUDENT_DETAILS.department;
            completeProfile.level = userProfileData.level || FALLBACK_STUDENT_DETAILS.level;
            completeProfile.program = userProfileData.program || FALLBACK_STUDENT_DETAILS.program;
            completeProfile.currentAcademicYear = userProfileData.currentAcademicYear || FALLBACK_STUDENT_DETAILS.currentAcademicYear;
            completeProfile.currentSemester = userProfileData.currentSemester || FALLBACK_STUDENT_DETAILS.currentSemester;
            completeProfile.isNewStudent = userProfileData.isNewStudent === undefined ? FALLBACK_STUDENT_DETAILS.isNewStudent : userProfileData.isNewStudent;
            completeProfile.isGraduating = userProfileData.isGraduating === undefined ? FALLBACK_STUDENT_DETAILS.isGraduating : userProfileData.isGraduating;
            completeProfile.matricule = userProfileData.matricule || FALLBACK_STUDENT_DETAILS.matricule;
        } else if (userProfileData.role === 'student') { 
            completeProfile.department = userProfileData.department || DEPARTMENTS.CESM; 
            completeProfile.level = userProfileData.level || VALID_LEVELS[0]; 
            completeProfile.currentAcademicYear = userProfileData.currentAcademicYear || ACADEMIC_YEARS[0];
            completeProfile.currentSemester = userProfileData.currentSemester || SEMESTERS[0];
        }
        return completeProfile;
      } else {
        if (firebaseUser.displayName === "Atem Rolland" || firebaseUser.email === "atem.rolland@example.com") {
            const atemProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: FALLBACK_STUDENT_DETAILS.displayName,
                role: 'student',
                department: FALLBACK_STUDENT_DETAILS.department,
                level: FALLBACK_STUDENT_DETAILS.level,
                program: FALLBACK_STUDENT_DETAILS.program,
                currentAcademicYear: FALLBACK_STUDENT_DETAILS.currentAcademicYear,
                currentSemester: FALLBACK_STUDENT_DETAILS.currentSemester,
                isNewStudent: FALLBACK_STUDENT_DETAILS.isNewStudent,
                isGraduating: FALLBACK_STUDENT_DETAILS.isGraduating,
                matricule: FALLBACK_STUDENT_DETAILS.matricule,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };
            try {
                await setDoc(doc(db, "users", firebaseUser.uid), atemProfile);
                return atemProfile;
            } catch (setDocError) {
                console.error("AuthContext: Error creating fallback profile for Atem Rolland:", setDocError);
                return null; 
            }
        }
        return null; 
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user profile from Firestore:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Removed setLoading(true) from here to prevent re-triggering global load on subsequent auth changes.
      // The initial `loading` state (true) handles the first load.
      if (firebaseUser) {
        const fetchedProfileData = await fetchUserProfile(firebaseUser);
        if (fetchedProfileData) {
          setProfile(fetchedProfileData);
          setRole(fetchedProfileData.role);
          setUser({ ...firebaseUser, profile: fetchedProfileData });
        } else {
          await firebaseSignOut(auth); 
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      if (loading) { // Only set loading to false once after the initial check
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserProfile, loading]); // Added loading to dependency array for the initial setLoading(false)

  const login = async (email: string, password: string): Promise<AppUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userProfileData = await fetchUserProfile(firebaseUser);

      if (!userProfileData) {
        await firebaseSignOut(auth); 
        throw new Error("Login successful, but your user profile could not be loaded. Please contact support or try registering again if this is your first time.");
      }
      
      setProfile(userProfileData);
      setRole(userProfileData.role);
      const appUser = { ...firebaseUser, profile: userProfileData };
      setUser(appUser);

      if (userProfileData.uid) { 
        const userDocRef = doc(db, "users", userProfileData.uid);
        try {
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        } catch (updateError) {
          console.error("AuthContext: Error updating lastLogin:", updateError);
        }
      }
      return appUser;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegistrationData): Promise<AppUser> => {
    if (!data.password) {
      throw new Error("Password is required for registration.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    const userRole = data.role || 'student';
    
    const userProfileDataForFirestore: Partial<UserProfile> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: data.displayName,
      role: userRole,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(), 
    };

    if (firebaseUser.photoURL) {
      userProfileDataForFirestore.photoURL = firebaseUser.photoURL;
    }

    if (userRole === 'student') {
      let studentProgram = "Program to be assigned";
      if (data.department === DEPARTMENTS.CESM) {
        studentProgram = "B.Eng. Computer Engineering and System Maintenance";
      } else if (data.department) {
        studentProgram = `${data.department} Program (Example)`;
      }

      userProfileDataForFirestore.department = data.department || FALLBACK_STUDENT_DETAILS.department;
      userProfileDataForFirestore.level = data.level || VALID_LEVELS[0];
      userProfileDataForFirestore.program = studentProgram;
      userProfileDataForFirestore.currentAcademicYear = data.level === VALID_LEVELS[0] ? ACADEMIC_YEARS[0] : ACADEMIC_YEARS[2]; 
      userProfileDataForFirestore.currentSemester = SEMESTERS[0];
      userProfileDataForFirestore.isNewStudent = (data.level || VALID_LEVELS[0]) === VALID_LEVELS[0];
      userProfileDataForFirestore.isGraduating = (data.level || VALID_LEVELS[0]) === VALID_LEVELS[VALID_LEVELS.length - 1];
      userProfileDataForFirestore.matricule = `CUSMS/S/${(userProfileDataForFirestore.currentAcademicYear || ACADEMIC_YEARS[0]).slice(2,4)}${String(userProfileDataForFirestore.level || VALID_LEVELS[0]).charAt(0)}${Math.floor(1000 + Math.random() * 9000)}`;
      
      if(data.gender) userProfileDataForFirestore.gender = data.gender;
      if(data.dateOfBirth) userProfileDataForFirestore.dateOfBirth = data.dateOfBirth;
      if(data.placeOfBirth) userProfileDataForFirestore.placeOfBirth = data.placeOfBirth;
      if(data.regionOfOrigin) userProfileDataForFirestore.regionOfOrigin = data.regionOfOrigin;
      if(data.maritalStatus) userProfileDataForFirestore.maritalStatus = data.maritalStatus;
      if(data.nidOrPassport) userProfileDataForFirestore.nidOrPassport = data.nidOrPassport;
      if(data.nationality) userProfileDataForFirestore.nationality = data.nationality;
      if(data.phone) userProfileDataForFirestore.phone = data.phone;
      if(data.address) userProfileDataForFirestore.address = data.address;
      if(data.guardianName) userProfileDataForFirestore.guardianName = data.guardianName;
      if(data.guardianPhone) userProfileDataForFirestore.guardianPhone = data.guardianPhone;
      if(data.guardianAddress) userProfileDataForFirestore.guardianAddress = data.guardianAddress;
    }
    
    await setDoc(doc(db, "users", firebaseUser.uid), userProfileDataForFirestore);

    const finalProfileForState = await fetchUserProfile(firebaseUser);
    if (!finalProfileForState) {
        await firebaseSignOut(auth);
        throw new Error("Registration succeeded but profile could not be loaded. Please contact support.");
    }
    
    setProfile(finalProfileForState);
    setRole(finalProfileForState.role); 
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

