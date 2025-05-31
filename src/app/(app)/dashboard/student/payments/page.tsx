
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function StudentPaymentsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <CreditCard className="h-6 w-6 text-primary" />
            Tuition & Payments Overview
          </CardTitle>
          <CardDescription>View your fee structure, make payments, and track your balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Detailed tuition fee structure, payment simulation (MTN Mobile Money, Orange Money), and balance tracking will be implemented here.
          </p>
          {/* Placeholder for fee details, payment form, balance display */}
          <div className="p-4 border rounded-lg bg-muted">
            <h3 className="font-semibold mb-2">Simulated Payment</h3>
            <p className="text-sm mb-3">Select a payment method:</p>
            <div className="flex gap-4">
                <Button variant="outline" disabled className="flex-1">
                    <Smartphone className="mr-2 h-4 w-4"/> MTN Mobile Money - Coming Soon
                </Button>
                <Button variant="outline" disabled className="flex-1">
                    <Smartphone className="mr-2 h-4 w-4"/> Orange Money - Coming Soon
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
