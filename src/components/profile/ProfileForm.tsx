
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; 
import { supabase } from '@/lib/supabase';
import { updateProfile as updateFirebaseProfile, updateEmail as updateFirebaseAuthEmail } from 'firebase/auth'; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }), 
  photoFile: z.instanceof(File).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userProfile: UserProfile;
}

export function ProfileForm({ userProfile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.photoURL || null);
  const { user: authUser, profile: currentProfile, fetchUserProfile } = useAuth(); 

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile.displayName || "",
      email: userProfile.email || "",
      photoFile: null,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        form.setError("photoFile", { type: "manual", message: "File size should not exceed 2MB." });
        setAvatarPreview(currentProfile?.photoURL || null); // Revert preview
        return;
      }
      form.setValue("photoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!authUser || !currentProfile) {
      setError("User not authenticated.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let photoURL = currentProfile.photoURL;

      if (data.photoFile) {
        const file = data.photoFile;
        const fileExtension = file.name.split('.').pop();
        const fileName = `${authUser.uid}-${Date.now()}.${fileExtension}`;
        const filePath = `users/avatars/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cusms-files') 
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('cusms-files').getPublicUrl(filePath);
        photoURL = urlData.publicUrl;
      }
      
      const updates: Partial<UserProfile> = {
        displayName: data.displayName,
        photoURL: photoURL,
        updatedAt: new Date(), 
      };

      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, updates);

      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.displayName,
          photoURL: photoURL,
        });
      }
      
      if (fetchUserProfile && auth.currentUser) {
         await fetchUserProfile(auth.currentUser);
      }

      setSuccess("Profile updated successfully!");
      form.reset({ ...data, photoFile: null }); 
      // No need to reset avatarPreview here if fetchUserProfile updates the context's photoURL

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ').filter(Boolean); // filter out empty strings from multiple spaces
    if (names.length > 1) {
      return (names[0][0] || "") + (names[names.length - 1][0] || "");
    } else if (names.length === 1 && names[0].length > 1) {
      return names[0].substring(0, 2).toUpperCase();
    } else if (names.length === 1 && names[0].length === 1) {
      return names[0][0].toUpperCase();
    }
    return name.length > 1 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Update Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="photoFile"
          render={({ field }) => ( 
            <FormItem className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={avatarPreview || undefined} alt={currentProfile?.displayName || "User"} />
                <AvatarFallback className="text-3xl">{getInitials(currentProfile?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow w-full sm:w-auto">
                <FormLabel className="block text-sm font-medium mb-1">Profile Picture</FormLabel>
                <FormControl>
                  <Input 
                    id="photoFile-input" 
                    type="file" 
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                <FormDescription>Upload a new profile picture (max 2MB). JPG, PNG, GIF accepted.</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled />
              </FormControl>
              <FormDescription>Email address cannot be changed here. Contact support if needed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {userProfile.role === 'student' && 'matricule' in userProfile && (
          <FormItem>
            <FormLabel>Matricule Number</FormLabel>
            <FormControl>
              <Input value={(userProfile as any).matricule || "N/A"} disabled /> 
            </FormControl>
            <FormDescription>Your unique student identification number.</FormDescription>
          </FormItem>
        )}
         {userProfile.role === 'student' && 'program' in userProfile && (
          <FormItem>
            <FormLabel>Program</FormLabel>
            <FormControl>
              <Input value={userProfile.program || "N/A"} disabled /> 
            </FormControl>
             <FormDescription>Your enrolled academic program.</FormDescription>
          </FormItem>
        )}
         {userProfile.role === 'student' && 'department' in userProfile && (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input value={userProfile.department || "N/A"} disabled /> 
            </FormControl>
            <FormDescription>Your assigned department.</FormDescription>
          </FormItem>
        )}
         {userProfile.role === 'student' && 'level' in userProfile && (
          <FormItem>
            <FormLabel>Current Level</FormLabel>
            <FormControl>
              <Input value={userProfile.level?.toString() || "N/A"} disabled /> 
            </FormControl>
            <FormDescription>Your current academic level.</FormDescription>
          </FormItem>
        )}


        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

    
