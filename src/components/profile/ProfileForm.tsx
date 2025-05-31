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
import { db, auth } from '@/lib/firebase'; // Assuming auth is exported for updateEmail if needed
import { supabase } from '@/lib/supabase';
import { updateProfile as updateFirebaseProfile, updateEmail as updateFirebaseAuthEmail } from 'firebase/auth'; // For updating Firebase Auth user
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
  email: z.string().email({ message: "Invalid email address." }), // Email update might need re-authentication
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
  const { user: authUser, profile: currentProfile, fetchUserProfile } = useAuth(); // Assuming fetchUserProfile updates context

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

      // Upload new profile picture if provided
      if (data.photoFile) {
        const file = data.photoFile;
        const filePath = `users/avatars/${authUser.uid}/${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cusms-files') // Bucket name
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('cusms-files').getPublicUrl(filePath);
        photoURL = urlData.publicUrl;
      }
      
      const updates: Partial<UserProfile> = {
        displayName: data.displayName,
        // Email update is more complex and usually requires re-authentication or verification
        // For now, we'll keep it simple and not update email directly here unless explicitly handled
        photoURL: photoURL,
        updatedAt: new Date(), // Or serverTimestamp() from firebase
      };

      // Update Firestore document
      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, updates);

      // Update Firebase Auth profile (name, photoURL)
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.displayName,
          photoURL: photoURL,
        });
        // To update email: await updateFirebaseAuthEmail(auth.currentUser, data.email);
        // This requires recent login or re-authentication.
      }
      
      // Refresh user profile in AuthContext
      if (fetchUserProfile && auth.currentUser) {
         await fetchUserProfile(auth.currentUser);
      }

      setSuccess("Profile updated successfully!");
      form.reset({ ...data, photoFile: null }); // Reset form, clear file input state

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
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
          render={({ field }) => ( // field prop is not directly used for input type="file" value
            <FormItem className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={avatarPreview || undefined} alt={userProfile.displayName || "User"} />
                <AvatarFallback className="text-3xl">{getInitials(userProfile.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <FormLabel htmlFor="photoFile" className="block text-sm font-medium mb-1">Profile Picture</FormLabel>
                <FormControl>
                  <Input 
                    id="photoFile" 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange} // Use custom handler
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                <FormDescription>Upload a new profile picture (max 2MB).</FormDescription>
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
        
        {/* Add other profile fields as needed, e.g., matricule for students */}
        {userProfile.role === 'student' && (
          <FormItem>
            <FormLabel>Matricule Number</FormLabel>
            <FormControl>
              {/* This would typically come from student specific data, not user profile directly */}
              <Input value={(currentProfile as any)?.matricule || "N/A"} disabled /> 
            </FormControl>
            <FormDescription>Your unique student identification number.</FormDescription>
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
