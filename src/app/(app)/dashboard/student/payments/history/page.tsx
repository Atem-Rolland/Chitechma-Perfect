
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Printer, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { Payment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const MOCK_PAYMENTS: Payment[] = [
  { 
    id: "TXN001", 
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    purpose: "First Installment - Tuition 2024/2025", 
    amount: 200000, 
    currency: "XAF", 
    status: "Completed", 
    method: "MTN Mobile Money" 
  },
  { 
    id: "TXN002", 
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    purpose: "Medicals Fee", 
    amount: 5000, 
    currency: "XAF", 
    status: "Completed", 
    method: "Orange Money" 
  },
  { 
    id: "TXN003", 
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    purpose: "Second Installment - Tuition 2024/2025", 
    amount: 100000, 
    currency: "XAF", 
    status: "Completed", 
    method: "MTN Mobile Money" 
  },
   { 
    id: "TXN004", 
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    purpose: "Student Union Fee", 
    amount: 3000, 
    currency: "XAF", 
    status: "Pending", 
    method: "Orange Money" 
  },
  { 
    id: "TXN005", 
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    purpose: "Excursion Fee", 
    amount: 25000, 
    currency: "XAF", 
    status: "Failed", 
    method: "MTN Mobile Money" 
  },
];


export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDownloadReceipt = (paymentId: string) => {
    toast({
      title: "Receipt Download (Simulated)",
      description: `Generating PDF receipt for transaction ${paymentId}... This is a simulated action.`,
      duration: 3000,
    });
  };
  
  const getStatusBadgeVariant = (status: Payment['status']) => {
    switch (status) {
      case "Completed": return "default"; // Using default for success-like appearance (green)
      case "Pending": return "secondary"; // Using secondary for warning-like (yellow/amber)
      case "Failed": return "destructive";
      default: return "outline";
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <History className="h-6 w-6 text-primary" />
            Payment History & Receipts
          </CardTitle>
          <CardDescription>View your past payments and download receipts (simulated).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10">
              <Image src="https://placehold.co/300x200.png" alt="No payment history" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty transaction document" />
              <h3 className="text-xl font-semibold">No Payment History</h3>
              <p className="text-muted-foreground mt-1">
                You have not made any payments yet.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Method</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs hidden sm:table-cell">{payment.id}</TableCell>
                      <TableCell>{format(parseISO(payment.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{payment.purpose}</TableCell>
                      <TableCell className="text-right">{payment.amount.toLocaleString()} {payment.currency}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">{payment.method || "N/A"}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                            variant={getStatusBadgeVariant(payment.status)}
                            className={
                                payment.status === "Completed" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                                payment.status === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                                payment.status === "Failed" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : ""
                            }
                        >
                            {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "Completed" && (
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(payment.id)}>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Receipt
                          </Button>
                        )}
                         {payment.status === "Pending" && (
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled>Check Status</Button>
                        )}
                         {payment.status === "Failed" && (
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs text-destructive" disabled>Details</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2">
            <p className="text-xs text-muted-foreground">
                This page shows a history of your financial transactions with the university. 
                For official receipts or any discrepancies, please contact the finance office.
            </p>
           <Button variant="outline" disabled className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Download Full Statement (PDF) - Coming Soon
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
