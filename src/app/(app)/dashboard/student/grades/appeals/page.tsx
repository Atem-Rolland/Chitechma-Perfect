
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Send, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GradeAppealsPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [appealReason, setAppealReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  // Mock data for courses to appeal - in a real app, this would be fetched
  const appealableCourses = [
    { id: "CSE401", name: "Mobile Application Development (CSE401)" },
    { id: "MGT403", name: "Research Methodology (MGT403)" },
    { id: "NES403", name: "Modeling in Information System (NES403)" },
    { id: "CSE301", name: "Introduction to Algorithms (CSE301)" },
    { id: "CSE302", name: "Database Systems (CSE302)" },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation (e.g., file size, type) could be added here
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmitAppeal = async () => {
    // This function would handle the actual submission logic
    // For now, it will remain disabled.
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Appeal Submitted (Simulated)",
      description: "Your grade appeal for the selected course has been notionally submitted.",
    });
    setSelectedCourse("");
    setAppealReason("");
    setSelectedFile(null);
    // Reset file input visually if possible, though it's tricky with controlled file inputs
    const fileInput = document.getElementById("supporting-documents") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setIsSubmitting(false);
  };


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
            Please provide clear and concise reasons for your appeal, along with any supporting evidence (e.g., graded paper, screenshot).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="course-select">Select Course to Appeal</Label>
            <Select 
              value={selectedCourse} 
              onValueChange={setSelectedCourse}
              disabled // Keep course selection disabled for now
            >
              <SelectTrigger id="course-select" aria-label="Select course to appeal">
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {appealableCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Course selection will be enabled once backend integration for grade appeals is complete. This list shows examples.</p>
          </div>

          <div>
            <Label htmlFor="appeal-reason">Reason for Appeal</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Clearly explain the reason for your grade appeal. Provide specific details and refer to course materials, assignments, or grading criteria if necessary."
              rows={6}
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              disabled // Keep textarea disabled for now
            />
          </div>
          
          <div>
            <Label htmlFor="supporting-documents">Attach Supporting Document (Optional)</Label>
            <Input 
              id="supporting-documents" 
              type="file" 
              onChange={handleFileChange}
              accept="image/*,application/pdf,.doc,.docx" // Specify acceptable file types
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 p-2 border rounded-md bg-secondary/50">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Attach documents like graded papers, screenshots, etc. (Max 5MB. PDF, DOC, DOCX, JPG, PNG accepted).
            </p>
          </div>
          
          <Button 
            disabled // Submit button remains disabled as backend is not implemented
            className="w-full" 
            onClick={handleSubmitAppeal}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Appeal - Feature Under Development
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Note: The grade appeal submission system is currently under development. 
            This page demonstrates the UI for selecting a file.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

