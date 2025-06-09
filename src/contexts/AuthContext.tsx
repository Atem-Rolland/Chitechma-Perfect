
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
  displayName: "Atem Rolland",
  department: DEPARTMENTS.CESM,
  level: 400,
  program: "B.Eng. Computer Engineering and System Maintenance",
  currentAcademicYear: ACADEMIC_YEARS[2],
  currentSemester: SEMESTERS[0],
  isNewStudent: false,
  isGraduating: true,
  matricule: `CUSMS/S/${ACADEMIC_YEARS[2].slice(2,4)}4${Math.floor(1000 + Math.random() * 9000)}`
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    console.log("AuthContext: Fetching profile for UID:", firebaseUser.uid);
    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        console.log("AuthContext: Profile document found for UID:", firebaseUser.uid);
        const userProfileData = userDocSnap.data() as UserProfile; // Assume this is the correct type from Firestore

        // Construct the complete profile, ensuring all expected fields are present, falling back if necessary.
        const completeProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || userProfileData.email, // Prefer Firebase's email if available
          displayName: userProfileData.displayName || firebaseUser.displayName || (userProfileData.role === 'student' ? FALLBACK_STUDENT_DETAILS.displayName : "User"),
          photoURL: userProfileData.photoURL || firebaseUser.photoURL || null,
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
        return completeProfile;
      } else {
        console.warn("AuthContext: User profile document NOT found in Firestore for UID:", firebaseUser.uid);
        return null;
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user profile from Firestore:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged triggered. Firebase user:", firebaseUser ? firebaseUser.uid : "null");
      setLoading(true);
      if (firebaseUser) {
        const fetchedProfileData = await fetchUserProfile(firebaseUser);
        if (fetchedProfileData) {
          setProfile(fetchedProfileData);
          setRole(fetchedProfileData.role);
          setUser({ ...firebaseUser, profile: fetchedProfileData });
          console.log("AuthContext: Profile and AppUser state updated from onAuthStateChanged for UID:", firebaseUser.uid);
        } else {
          console.error("AuthContext: CRITICAL - Firebase user exists but no Firestore profile found. UID:", firebaseUser.uid, "Logging out user.");
          // This is a critical state. User is authenticated with Firebase but has no profile in our system.
          // Forcing logout.
          await firebaseSignOut(auth); // This will re-trigger onAuthStateChanged with firebaseUser = null
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } else {
        console.log("AuthContext: Firebase user is null, clearing user, profile, and role state.");
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<AppUser> => {
    console.log("AuthContext: Attempting login for:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: Firebase signInWithEmailAndPassword successful:", userCredential.user.uid);
      const firebaseUser = userCredential.user;

      const userProfileData = await fetchUserProfile(firebaseUser);

      if (!userProfileData) {
        console.error("AuthContext: Login failed - User profile not found in Firestore after successful Firebase Auth. UID:", firebaseUser.uid);
        // Sign out the user because they authenticated but have no profile, an inconsistent state.
        await firebaseSignOut(auth); // This will trigger onAuthStateChanged to clear states.
        throw new Error("Login successful, but your user profile could not be loaded. Please contact support or try registering again if this is your first time.");
      }
      
      // If profile fetch is successful, update context state immediately
      setProfile(userProfileData);
      setRole(userProfileData.role);
      const appUser = { ...firebaseUser, profile: userProfileData };
      setUser(appUser);

      // Update lastLogin
      if (userProfileData.uid) { // Should always be true if userProfileData exists
        const userDocRef = doc(db, "users", userProfileData.uid);
        try {
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
          console.log("AuthContext: Last login updated for user:", userProfileData.uid);
        } catch (updateError) {
          console.error("AuthContext: Error updating lastLogin:", updateError);
          // Non-critical, so don't re-throw unless necessary for the login flow
        }
      }
      console.log("AuthContext: Login process completed for:", email);
      return appUser;
    } catch (error: any) {
      console.error("AuthContext: Login error caught in login function:", error.code, error.message);
      // Re-throw the original Firebase auth error or the custom profile error
      throw error;
    }
  };

  const register = async (data: RegistrationData): Promise<AppUser> => {
    console.log("AuthContext: Attempting registration for:", data.email);
    if (!data.password) {
      console.error("AuthContext: Registration failed - Password is required.");
      throw new Error("Password is required for registration.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    console.log("AuthContext: Firebase user created successfully:", firebaseUser.uid);
    
    const userRole = data.role || 'student';
    
    const userProfileDataForFirestore: Partial<UserProfile> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: data.displayName,
      role: userRole,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(), // Set lastLogin on registration too
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
      userProfileDataForFirestore.currentAcademicYear = data.level === VALID_LEVELS[0] ? ACADEMIC_YEARS[0] : ACADEMIC_YEARS[2]; // Simplified default
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
    
    console.log("AuthContext: Saving user profile to Firestore:", userProfileDataForFirestore);
    await setDoc(doc(db, "users", firebaseUser.uid), userProfileDataForFirestore);
    console.log("AuthContext: Firestore profile saved for UID:", firebaseUser.uid);

    // Fetch the just-created profile to ensure all server-generated timestamps are resolved for local state
    const finalProfileForState = await fetchUserProfile(firebaseUser);
    if (!finalProfileForState) {
        console.error("AuthContext: CRITICAL - Failed to fetch profile immediately after registration for UID:", firebaseUser.uid);
        // This is an unexpected state, sign out user to prevent issues.
        await firebaseSignOut(auth);
        throw new Error("Registration succeeded but profile could not be loaded. Please contact support.");
    }
    
    setProfile(finalProfileForState);
    setRole(finalProfileForState.role); // Ensure role is set from the fetched profile
    const appUser = { ...firebaseUser, profile: finalProfileForState };
    setUser(appUser);
    console.log("AuthContext: Registration process completed for:", data.email);
    return appUser;
  };

  const logout = async () => {
    console.log("AuthContext: Logging out user.");
    await firebaseSignOut(auth);
    // onAuthStateChanged will handle resetting user, profile, and role states.
    router.push('/login');
    console.log("AuthContext: User logged out, redirected to login.");
  };

  const resetPassword = async (email: string) => {
    console.log("AuthContext: Sending password reset email to:", email);
    await sendPasswordResetEmail(auth, email);
    console.log("AuthContext: Password reset email sent.");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, role, login, register, logout, resetPassword, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
