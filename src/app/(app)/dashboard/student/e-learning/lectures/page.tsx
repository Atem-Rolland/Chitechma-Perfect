
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react"; 
import { motion } from "framer-motion";

export default function VideoLecturesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Video className="h-6 w-6 text-primary" />
            Video Lectures
          </CardTitle>
          <CardDescription>Watch recorded lectures and online classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Embedding video lectures (e.g., from Zoom recordings, Google Classroom, or YouTube links) will be implemented here.</p>
          {/* Placeholder for video embeds or links */}
        </CardContent>
      </Card>
    </motion.div>
  );
}

