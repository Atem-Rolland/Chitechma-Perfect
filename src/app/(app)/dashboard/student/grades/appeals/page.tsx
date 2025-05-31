
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GradeAppealsPage() {
  // Mock data for courses to appeal - in a real app, this would be fetched
  const appealableCourses = [
    { id: "CSE401", name: "Mobile Application Development (CSE401)" },
    { id: "MGT403", name: "Research Methodology (MGT403)" },
    { id: "NES403", name: "Modeling in Information System (NES403)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FileWarning className="h-6 w-6 text-primary" />
            Submit Grade Appeal
          </CardTitle>
          <CardDescription>
            If you believe there is an error in your grade for a specific course, you can submit an appeal here.
            Please provide clear and concise reasons for your appeal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="course-select">Select Course to Appeal</Label>
            <Select disabled>
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {appealableCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Course selection will be enabled once backend is integrated.</p>
          </div>

          <div>
            <Label htmlFor="appeal-reason">Reason for Appeal</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Clearly explain the reason for your grade appeal. Provide specific details and refer to course materials or assignments if necessary."
              rows={5}
              disabled
            />
          </div>
          
          <div>
            <Label htmlFor="supporting-documents">Attach Supporting Documents (Optional)</Label>
            <Input id="supporting-documents" type="file" disabled />
            <p className="text-xs text-muted-foreground mt-1">You can attach documents like graded papers, screenshots, etc. (Max 5MB)</p>
          </div>
          
          <Button disabled className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Submit Appeal - Coming Soon
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Note: The grade appeal submission system is currently under development.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

