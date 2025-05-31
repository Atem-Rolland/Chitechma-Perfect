
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AssignmentsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Assignments
          </CardTitle>
          <CardDescription>Submit your assignments and view feedback from lecturers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Assignment submission (text and file uploads) and feedback viewing functionality will be implemented here.</p>
          {/* Placeholder for assignment list, submission forms, feedback display */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
