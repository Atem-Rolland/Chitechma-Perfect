
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ViewGradesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BookCheck className="h-6 w-6 text-primary" />
            My Grades
          </CardTitle>
          <CardDescription>View your grades by academic year and semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Grade viewing functionality will be implemented here. You'll be able to filter by semester and see detailed results for each course.</p>
          {/* Placeholder for grade display table, filters, etc. */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
