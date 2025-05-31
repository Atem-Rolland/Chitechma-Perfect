
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderArchive } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseMaterialsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FolderArchive className="h-6 w-6 text-primary" />
            Course Materials
          </CardTitle>
          <CardDescription>Download lecture notes, slides, and other course resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Integration with Firebase Storage to list and download course materials will be implemented here.</p>
          {/* Placeholder for material list and download links */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
