
"use client";

import type { MaterialType } from "@/types";
import { MATERIAL_TYPES, materialTypeAcceptsFile, materialTypeAcceptsLink, getMaterialTypeIcon } from "@/types";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Loader2, File as FileIcon } from "lucide-react";

interface UploadMaterialDialogContentProps {
  newMaterialName: string;
  setNewMaterialName: (name: string) => void;
  newMaterialType: MaterialType | undefined;
  setNewMaterialType: (type: MaterialType | undefined) => void;
  newMaterialFile: File | null;
  handleMaterialFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  newMaterialLink: string;
  setNewMaterialLink: (link: string) => void;
  newMaterialDescription: string;
  setNewMaterialDescription: (desc: string) => void;
  isUploadingMaterial: boolean;
  handleUploadMaterial: () => Promise<void>;
  onClose: () => void;
}

function formatFileSize(bytes: number | undefined, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function UploadMaterialDialogContent({
  newMaterialName, setNewMaterialName, newMaterialType, setNewMaterialType,
  newMaterialFile, handleMaterialFileChange, newMaterialLink, setNewMaterialLink,
  newMaterialDescription, setNewMaterialDescription, isUploadingMaterial, handleUploadMaterial,
  onClose
}: UploadMaterialDialogContentProps) {

  const IconForType = newMaterialType ? getMaterialTypeIcon(newMaterialType) : FileIcon;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl">Upload New Course Material</DialogTitle>
        <DialogDescription>Fill in the details for the new material.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="material-name-dialog">Material Name / Title <span className="text-destructive">*</span></Label>
          <Input id="material-name-dialog" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="e.g., Week 1 Lecture Notes" />
        </div>
        <div>
          <Label htmlFor="material-type-dialog">Material Type <span className="text-destructive">*</span></Label>
          <Select value={newMaterialType} onValueChange={(value: MaterialType) => setNewMaterialType(value)}>
            <SelectTrigger id="material-type-dialog">
              <div className="flex items-center gap-2">
                {newMaterialType && <IconForType className="h-4 w-4 text-muted-foreground" />}
                <SelectValue placeholder="Select material type..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES.map(type => {
                const SpecificIcon = getMaterialTypeIcon(type.value);
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <SpecificIcon className="h-4 w-4 text-muted-foreground" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {newMaterialType && materialTypeAcceptsFile(newMaterialType) && (
          <div>
            <Label htmlFor="material-file-dialog">Upload File <span className="text-destructive">*</span></Label>
            <Input 
              id="material-file-dialog" 
              type="file" 
              onChange={handleMaterialFileChange} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {newMaterialFile && <p className="text-xs text-muted-foreground mt-1">Selected: {newMaterialFile.name} ({formatFileSize(newMaterialFile.size)})</p>}
            <p className="text-xs text-muted-foreground mt-1">Max 50MB.</p>
          </div>
        )}
        {newMaterialType && materialTypeAcceptsLink(newMaterialType) && (
          <div>
            <Label htmlFor="material-link-dialog">Link URL <span className="text-destructive">*</span></Label>
            <Input id="material-link-dialog" type="url" value={newMaterialLink} onChange={(e) => setNewMaterialLink(e.target.value)} placeholder="e.g., https://example.com/resource" />
          </div>
        )}
        <div>
          <Label htmlFor="material-description-dialog">Description (Optional)</Label>
          <Textarea id="material-description-dialog" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} placeholder="Briefly describe the material..." rows={3}/>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancel</Button></DialogClose>
        <Button type="button" onClick={handleUploadMaterial} disabled={isUploadingMaterial}>
          {isUploadingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Upload Material
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

    