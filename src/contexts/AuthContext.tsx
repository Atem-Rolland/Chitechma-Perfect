
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
  displayName: "Atem Rolland",
  department: DEPARTMENTS.CESM, 
  level: 400, 
  program: "B.Eng. Computer Engineering and System Maintenance",
  currentAcademicYear: ACADEMIC_YEARS[2], // Changed from ACADEMIC_YEARS[1] to ACADEMIC_YEARS[2] (2024/2025)
  currentSemester: SEMESTERS[0], 
  isNewStudent: false, 
  isGraduating: true, 
  matricule: `CUSMS/S/${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`
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
      };
      // These calls are important for keeping the context's standalone profile/role states in sync.
      setProfile(completeProfile); 
      setRole(completeProfile.role);
      return completeProfile;
    } else {
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
      return null;
    }
  }, []); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const fetchedProfileData = await fetchUserProfile(firebaseUser);

        if (fetchedProfileData) {
          // Profile was successfully fetched. fetchUserProfile has already updated context's profile and role.
          // Now, update the main 'user' state in context.
          setUser({ ...firebaseUser, profile: fetchedProfileData });
        } else {
          // Profile not found in Firestore by this fetchUserProfile call.
          // This could be a temporary Firestore lag, or the user genuinely has no profile.
          // We check if the 'user' state in context *already* has a profile for this firebaseUser.uid.
          // If it does, it means login() or register() likely just set it. We trust that.
          if (!(user?.uid === firebaseUser.uid && user?.profile)) {
            // If not, then it's more likely a genuine "no profile" or a different user session causing this.
            // Clear profile from 'user' state and also the standalone 'profile' & 'role' states.
            setUser({ ...firebaseUser, profile: undefined }); 
            setProfile(null); 
            setRole(null);    
          }
          // If user?.uid === firebaseUser.uid && user?.profile was true, we do nothing here,
          // preserving the profile/role potentially set by login()/register() and fetched by their own fetchUserProfile call.
        }
      } else {
        // User is signed out
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile, user]); // user is a dependency

  const login = async (email: string, password: string): Promise<AppUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    // fetchUserProfile will call setProfile and setRole internally if successful
    const userProfileData = await fetchUserProfile(firebaseUser); 
    const appUser = { ...firebaseUser, profile: userProfileData || undefined };
    setUser(appUser); // Update the main user object in context
    return appUser;
  };

  const register = async (data: RegistrationData): Promise<AppUser> => {
    if (!data.password) {
      throw new Error("Password is required for registration.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    const userRole = data.role || 'student'; 

    const userProfileData: Partial<UserProfile> = {
      displayName: data.displayName,
      department: userRole === 'student' ? (data.department || FALLBACK_STUDENT_DETAILS.department) : undefined,
      level: userRole === 'student' ? (data.level || FALLBACK_STUDENT_DETAILS.level) : undefined,
      program: userRole === 'student' ? FALLBACK_STUDENT_DETAILS.program : undefined,
      currentAcademicYear: userRole === 'student' ? FALLBACK_STUDENT_DETAILS.currentAcademicYear : undefined,
      currentSemester: userRole === 'student' ? FALLBACK_STUDENT_DETAILS.currentSemester : undefined,
      isNewStudent: userRole === 'student' ? (data.level === VALID_LEVELS[0] || data.level === undefined) : undefined,
      isGraduating: userRole === 'student' ? (data.level === VALID_LEVELS[VALID_LEVELS.length - 1]) : undefined,
      matricule: userRole === 'student' ? (data.level ? `CUSMS/S/${new Date().getFullYear().toString().slice(-2)}${String(data.level).charAt(0)}${Math.floor(1000 + Math.random() * 9000)}` : FALLBACK_STUDENT_DETAILS.matricule ) : undefined,
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
    };

    const finalProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: userRole,
      photoURL: firebaseUser.photoURL, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...userProfileData,
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), finalProfile);

    // Critical: Update context states immediately after successful registration and Firestore write.
    setProfile(finalProfile); // This ensures the context's standalone profile is up-to-date
    setRole(userRole);       // This ensures the context's standalone role is up-to-date
    const appUser = { ...firebaseUser, profile: finalProfile };
    setUser(appUser);        // This ensures the main user object in context (with its embedded profile) is up-to-date
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

