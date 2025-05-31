
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function GradeAppealsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FileWarning className="h-6 w-6 text-primary" />
            Submit Grade Appeal
          </CardTitle>
          <CardDescription>Submit an appeal if you believe there is an error in your grade.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The grade appeal submission form will be implemented here. You'll be able to select a course, provide a reason, and attach supporting documents.</p>
          {/* Placeholder for grade appeal form */}
           <Button disabled className="mt-4">Submit Appeal - Coming Soon</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
