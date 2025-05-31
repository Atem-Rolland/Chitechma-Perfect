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
  // mfaSetup: () => Promise<void>; // Placeholder for MFA
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

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
      setProfile(userProfileData);
      setRole(userProfileData.role);
      return userProfileData;
    } else {
      // Handle case where user exists in Auth but not in Firestore (e.g., incomplete registration)
      // For now, return null and let the app decide how to handle this.
      // Potentially create a default profile or redirect to a profile setup page.
      console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
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
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || firebaseUser.displayName,
      role: userRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: firebaseUser.photoURL
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
    router.push('/login'); // Redirect to login after logout
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // const mfaSetup = async () => { /* Implement MFA logic */ };

  return (
    <AuthContext.Provider value={{ user, profile, loading, role, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
