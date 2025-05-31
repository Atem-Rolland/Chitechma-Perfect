
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function DiscussionForumPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <MessageSquare className="h-6 w-6 text-primary" />
            Discussion Forum
          </CardTitle>
          <CardDescription>Participate in class discussions and ask questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A threaded discussion forum with user avatars will be implemented here.</p>
          {/* Placeholder for forum threads and posting functionality */}
        </CardContent>
      </Card>
    </motion.div>
  );
}

