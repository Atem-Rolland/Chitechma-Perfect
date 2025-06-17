
"use client";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ReplyDialogContentProps {
  threadTitle: string | undefined;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onPostReply: () => void;
  isLoading: boolean;
  onClose: () => void;
}

export default function ReplyDialogContent({
  threadTitle, replyContent, setReplyContent, onPostReply, isLoading, onClose
}: ReplyDialogContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Post a Reply</DialogTitle>
        <DialogDescription>Responding to: {threadTitle || "this thread"}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div>
          <Label htmlFor="reply-content-dialog">Your Reply</Label>
          <Textarea id="reply-content-dialog" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Type your reply here..." rows={6} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={onPostReply} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} Post Reply
        </Button>
      </DialogFooter>
    </>
  );
}
