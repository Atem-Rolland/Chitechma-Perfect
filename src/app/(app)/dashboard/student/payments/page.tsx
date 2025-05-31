
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CreditCard, Smartphone, ReceiptText, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import type { FeeItem } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Fee Constants
const BASE_TUITION = 350000;
const REGISTRATION_FEE = 25000;
const MEDICALS_FEE = 5000;
const STUDENT_UNION_FEE = 3000;
const STUDENT_ID_CARD_FEE = 2000;
const EXCURSION_FEE = 25000;
const HND_DEFENSE_FEE = 25000;
const WORK_EXPERIENCE_FEE = 5000;
const DESIGN_PROJECT_DEFENSE_FEE = 15000;
const FINAL_DEFENSE_FEE = 30000;
const GRADUATION_FEE = 15000;
const CURRENCY = "XAF";

export default function StudentPaymentsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [applicableFees, setApplicableFees] = useState<FeeItem[]>([]);
  const [totalFeesDue, setTotalFeesDue] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0); // Mock: Example of partial payment for demo
  const [isLoadingFees, setIsLoadingFees] = useState(true);

  useEffect(() => {
    if (profile && !authLoading) {
      setIsLoadingFees(true);
      const fees: FeeItem[] = [];
      let currentTotal = 0;

      fees.push({ name: "Tuition Fee", amount: BASE_TUITION });
      currentTotal += BASE_TUITION;

      fees.push({ name: "Medicals", amount: MEDICALS_FEE });
      currentTotal += MEDICALS_FEE;

      fees.push({ name: "Student Union Fee", amount: STUDENT_UNION_FEE });
      currentTotal += STUDENT_UNION_FEE;

      fees.push({ name: "Student ID Card", amount: STUDENT_ID_CARD_FEE });
      currentTotal += STUDENT_ID_CARD_FEE;
      
      fees.push({ name: "Excursion Fee", amount: EXCURSION_FEE });
      currentTotal += EXCURSION_FEE;

      if (profile.isNewStudent) {
        fees.push({ name: "Registration Fee", amount: REGISTRATION_FEE, condition: "New Students Only" });
        currentTotal += REGISTRATION_FEE;
      }

      if (profile.level === 300) {
        fees.push({ name: "HND Defense Fee", amount: HND_DEFENSE_FEE, condition: "Level 300 Students" });
        currentTotal += HND_DEFENSE_FEE;
      }

      if (profile.level === 400) {
        fees.push({ name: "Work Experience Fee", amount: WORK_EXPERIENCE_FEE, condition: "Level 400 Students" });
        currentTotal += WORK_EXPERIENCE_FEE;
        fees.push({ name: "Design Project Defense Fee", amount: DESIGN_PROJECT_DEFENSE_FEE, condition: "Level 400 Students" });
        currentTotal += DESIGN_PROJECT_DEFENSE_FEE;
        fees.push({ name: "Final Defense Fee", amount: FINAL_DEFENSE_FEE, condition: "Level 400 Students" });
        currentTotal += FINAL_DEFENSE_FEE;
      }
      
      if ((profile.level === 300 || profile.level === 400) && profile.isGraduating) {
        fees.push({ name: "Graduation Fee", amount: GRADUATION_FEE, condition: "Graduating HND/Degree Students" });
        currentTotal += GRADUATION_FEE;
      }
      
      // Mock a partial payment for demonstration
      // In a real app, this would come from payment records.
      const mockPaidAmount = Math.min(currentTotal, 300000 + (profile.level === 400 ? 50000 : 0)); 
      setAmountPaid(mockPaidAmount);

      setApplicableFees(fees);
      setTotalFeesDue(currentTotal);
      setIsLoadingFees(false);
    } else if (!authLoading && !profile) {
        setIsLoadingFees(false); // No profile, stop loading
    }
  }, [profile, authLoading]);

  const balance = useMemo(() => totalFeesDue - amountPaid, [totalFeesDue, amountPaid]);

  if (authLoading || isLoadingFees) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!profile) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Not Loaded</CardTitle>
                <CardDescription>Student profile information is required to display fee details.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Please ensure your profile is complete or contact administration.</p>
            </CardContent>
        </Card>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <CreditCard className="h-7 w-7 text-primary" />
            Tuition & Fee Payments
          </CardTitle>
          <CardDescription>Overview of your fee structure, payment status, and options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <Card className="shadow-inner bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><ReceiptText className="h-5 w-5 text-accent"/>Fee Breakdown for {profile.displayName}</CardTitle>
              <CardDescription>This is an itemized list of fees applicable based on your current student profile (Level: {profile.level || 'N/A'}).</CardDescription>
            </CardHeader>
            <CardContent>
              {applicableFees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Item</TableHead>
                      <TableHead className="text-right">Amount ({CURRENCY})</TableHead>
                      <TableHead className="hidden sm:table-cell">Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicableFees.map((fee, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{fee.name}</TableCell>
                        <TableCell className="text-right">{fee.amount.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fee.condition || "Standard Fee"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Fee details are being calculated...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-lg">
                <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-muted-foreground">Total Fees Due:</span>
                    <span className="font-bold text-primary">{totalFeesDue.toLocaleString()} {CURRENCY}</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{amountPaid.toLocaleString()} {CURRENCY}</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md bg-muted">
                    <span className="font-semibold">Outstanding Balance:</span>
                    <span className={`font-bold ${balance > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                        {balance.toLocaleString()} {CURRENCY}
                    </span>
                </div>
                {balance > 0 && (
                     <Alert variant="destructive" className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Payment Required</AlertTitle>
                        <AlertDescription>
                            You have an outstanding balance. Please complete your payment to avoid any interruptions to your studies.
                        </AlertDescription>
                    </Alert>
                )}
                 {balance <= 0 && totalFeesDue > 0 && (
                     <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                        <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-700 dark:text-green-300">Fees Cleared</AlertTitle>
                        <AlertDescription className="text-green-600 dark:text-green-300">
                            Your fees for the current assessment are fully paid. Thank you!
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Make Payment</CardTitle>
                <CardDescription>Select your preferred method to pay your fees. Payment gateway is under development.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" disabled className="flex-1 py-6 text-lg">
                        <Image src="https://placehold.co/30x30.png?text=MTN" alt="MTN" width={24} height={24} className="mr-2 rounded-sm" data-ai-hint="MTN logo" />
                        MTN Mobile Money
                        <span className="ml-auto text-xs text-muted-foreground">(Coming Soon)</span>
                    </Button>
                    <Button variant="outline" disabled className="flex-1 py-6 text-lg">
                        <Image src="https://placehold.co/30x30.png?text=OM" alt="Orange" width={24} height={24} className="mr-2 rounded-sm" data-ai-hint="Orange logo" />
                        Orange Money
                        <span className="ml-auto text-xs text-muted-foreground">(Coming Soon)</span>
                    </Button>
                </div>
                 <p className="text-xs text-center text-muted-foreground mt-4">
                    Secure payment processing by CUSMS. You will be redirected to the payment gateway.
                 </p>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="mx-auto">View Payment History</Button>
            </CardFooter>
          </Card>

        </CardContent>
      </Card>
    </motion.div>
  );
}
