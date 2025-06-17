
"use client";
import type { ForumThread, ForumPost } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reply } from "lucide-react";
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface ViewThreadDialogContentProps {
  thread: ForumThread;
  onClose: () => void;
  onReply: (threadId: string) => void;
  renderPost: (post: ForumPost, isOriginalPost?: boolean) => React.ReactNode;
}

export default function ViewThreadDialogContent({ thread, onClose, onReply, renderPost }: ViewThreadDialogContentProps) {
  return (
    <>
      <DialogHeader className="pb-3 border-b">
        <DialogTitle className="font-headline text-xl">{thread.title}</DialogTitle>
        <DialogDescription>
          Started by {thread.author.name} in {thread.courseName || thread.courseId} - {formatDistanceToNowStrict(parseISO(thread.createdAt), { addSuffix: true })}
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="flex-grow py-1 pr-3 -mr-2 max-h-[calc(80vh-15rem)]"> {/* Adjusted max-h for scrollability */}
        <div className="space-y-1">
          {renderPost(thread.originalPost, true)}
          {thread.replies.map(reply => renderPost(reply))}
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        <Button type="button" onClick={() => onReply(thread.id)}>
          <Reply className="mr-2 h-4 w-4"/> Reply to Thread
        </Button>
      </DialogFooter>
    </>
  );
}
