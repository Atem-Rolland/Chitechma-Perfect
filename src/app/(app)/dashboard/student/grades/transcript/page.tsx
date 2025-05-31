
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function TranscriptPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <DownloadCloud className="h-6 w-6 text-primary" />
            Download Transcript
          </CardTitle>
          <CardDescription>Request and download your official or unofficial academic transcript.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Functionality to request and download your academic transcript in PDF format will be implemented here.
            You will be able to choose between official (signed) and unofficial versions.
          </p>
          <Button disabled className="w-full sm:w-auto">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download Transcript (PDF) - Coming Soon
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

