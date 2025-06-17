
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function PrintPreviewDialog({ open, onOpenChange, title, children }: PrintPreviewDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col print:h-auto print:max-w-full print:border-none print:shadow-none print:p-0">
        <DialogHeader className="no-print">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Review the document below. You can print it or save it as a PDF using your browser's print function.
          </DialogDescription>
        </DialogHeader>
        
        <div id="printable-area" className="flex-grow overflow-y-auto p-2 print:p-0 print:overflow-visible">
          {/* We will add a wrapper with specific styling for the transcript content here */}
          <div className="printable-document-wrapper bg-white text-black p-8 print:p-0 print:m-0 print:shadow-none print:border-none">
             {children}
          </div>
        </div>
        
        <DialogFooter className="no-print sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close Preview
            </Button>
          </DialogClose>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
