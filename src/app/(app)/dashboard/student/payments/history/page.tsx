
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PaymentHistoryPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <History className="h-6 w-6 text-primary" />
            Payment History & Receipts
          </CardTitle>
          <CardDescription>View your past payments and download receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your payment transaction history and PDF receipt generation will be implemented here.</p>
          {/* Placeholder for payment history table and receipt download buttons */}
          <Button disabled className="mt-4">
            <Printer className="mr-2 h-4 w-4" />
            Download All Receipts (PDF) - Coming Soon
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
