
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Role } from '@/types';
import { DEPARTMENTS, VALID_LEVELS } from '@/config/data';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from '../ui/separator';

const registerSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["student", "lecturer", "admin", "finance"]),
  
  // Student specific fields - made optional in base schema, refined later
  department: z.string().optional(),
  level: z.coerce.number().optional(),
  gender: z.string().optional(), // Using string for SelectValue compatibility, can be enum "Male" | "Female" | "Other"
  dateOfBirth: z.string().optional(), // Consider using a date picker or specific format validation
  placeOfBirth: z.string().optional(),
  regionOfOrigin: z.string().optional(),
  maritalStatus: z.string().optional(), // Can be enum
  nidOrPassport: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(), // Consider more specific phone validation
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianAddress: z.string().optional(),

}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.role === "student") {
    if (!data.department) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required for students.", path: ["department"] });
    }
    if (data.level === undefined || Number.isNaN(data.level)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Level is required for students.", path: ["level"] });
    } else if (!VALID_LEVELS.includes(data.level)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid level selected.", path: ["level"] });
    }
    // Add conditional requirements for other student fields if necessary
    if (!data.gender) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Gender is required.", path: ["gender"] });
    if (!data.dateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date of Birth is required.", path: ["dateOfBirth"] });
    if (!data.placeOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Place of Birth is required.", path: ["placeOfBirth"] });
    if (!data.nationality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nationality is required.", path: ["nationality"] });
    if (!data.phone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required.", path: ["phone"] });
    if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address is required.", path: ["address"] });
    if (!data.guardianName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guardian Name is required.", path: ["guardianName"] });
    if (!data.guardianPhone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guardian Phone is required.", path: ["guardianPhone"] });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      department: undefined,
      level: undefined,
      gender: undefined,
      dateOfBirth: "",
      placeOfBirth: "",
      regionOfOrigin: "",
      maritalStatus: undefined,
      nidOrPassport: "",
      nationality: "",
      phone: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
      guardianAddress: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await register(data); // Pass the whole data object
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Register as</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="finance">Finance Officer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedRole === 'student' && (
          <>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium text-foreground">Academic Information</h3>
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DEPARTMENTS).map(([key, name]) => (
                        <SelectItem key={key} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VALID_LEVELS.map(level => (
                        <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-6" />
            <h3 className="text-lg font-medium text-foreground">Identity Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="gender"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="dateOfBirth"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="placeOfBirth"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Place of Birth</FormLabel>
                        <FormControl><Input placeholder="e.g., Buea" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="regionOfOrigin"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Region of Origin (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., South-West" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="maritalStatus"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Marital Status (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="nidOrPassport"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>NID or Passport No. (Optional)</FormLabel>
                        <FormControl><Input placeholder="National ID or Passport Number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="nationality"
                    render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                        <FormLabel>Nationality</FormLabel>
                        <FormControl><Input placeholder="e.g., Cameroonian" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <Separator className="my-6" />
            <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="+237 XXXXXXXXX" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="address"
                    render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl><Input placeholder="e.g., UB Junction, Molyko" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <Separator className="my-6" />
            <h3 className="text-lg font-medium text-foreground">Guardian Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="guardianName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Full Name</FormLabel>
                        <FormControl><Input placeholder="Guardian's name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="guardianPhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Phone</FormLabel>
                        <FormControl><Input type="tel" placeholder="+237 YYYYYYYYY" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="guardianAddress"
                    render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                        <FormLabel>Guardian's Address (Optional)</FormLabel>
                        <FormControl><Input placeholder="Guardian's address" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" passHref>
            <Button variant="link" className="p-0 h-auto">Sign in</Button>
          </Link>
        </div>
      </form>
    </Form>
  );
}
