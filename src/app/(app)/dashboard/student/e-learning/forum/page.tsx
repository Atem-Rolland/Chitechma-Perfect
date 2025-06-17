
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, PlusCircle, Eye, Reply, UserCircle, CornerDownRight, Send, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import type { ForumThread, ForumPost, ForumUser, MockCourseForum } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const ViewThreadDialogContent = dynamic(() => import('@/components/forum/ViewThreadDialogContent'), {
  suspense: true,
  loading: () => <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading thread...</p></div>,
});
const NewThreadDialogContent = dynamic(() => import('@/components/forum/NewThreadDialogContent'), {
  suspense: true,
  loading: () => <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading form...</p></div>,
});
const ReplyDialogContent = dynamic(() => import('@/components/forum/ReplyDialogContent'), {
  suspense: true,
  loading: () => <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading form...</p></div>,
});


const MOCK_FORUM_USERS: Record<string, ForumUser> = {
  "user1": { id: "user1", name: "Alice Wonderland", avatarUrl: "https://placehold.co/40x40.png?text=AW" },
  "user2": { id: "user2", name: "Bob The Builder", avatarUrl: "https://placehold.co/40x40.png?text=BB" },
  "user3": { id: "user3", name: "Charlie Brown", avatarUrl: "https://placehold.co/40x40.png?text=CB" },
  "user4": { id: "user4", name: "Diana Prince", avatarUrl: "https://placehold.co/40x40.png?text=DP" },
};

const MOCK_ENROLLED_COURSES_FORUM: MockCourseForum[] = [
  { id: "CSE301", name: "Introduction to Algorithms (CSE301)" },
  { id: "MTH201", name: "Calculus I (MTH201)" },
  { id: "CSE401", name: "Mobile Application Development (CSE401)" },
];

const MOCK_FORUM_THREADS: ForumThread[] = [
  {
    id: "thread1_cse301", courseId: "CSE301", courseName: "Introduction to Algorithms",
    title: "Confused about Big O Notation for nested loops",
    author: MOCK_FORUM_USERS["user1"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityBy: MOCK_FORUM_USERS["user2"],
    replyCount: 2, viewCount: 15,
    originalPost: {
      id: "post1_thread1", author: MOCK_FORUM_USERS["user1"],
      content: "Hi everyone, I'm struggling to understand how to calculate Big O for a function with two nested loops where the inner loop depends on the outer loop's variable. For example:\n\nfor (i=0; i<n; i++) {\n  for (j=0; j<i; j++) {\n    // constant time operation\n  }\n}\n\nAny help would be appreciated!",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    replies: [
      { id: "reply1_thread1", author: MOCK_FORUM_USERS["user2"], content: "Great question, Alice! This is a common point of confusion. The inner loop runs i times for each iteration of the outer loop. So you're looking at something like 0 + 1 + 2 + ... + (n-1) operations. This sum is n*(n-1)/2, which simplifies to O(n^2).", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "reply2_thread1", author: MOCK_FORUM_USERS["user1"], content: "Oh, that makes sense! So the dependency doesn't change it from O(n^2) in this case. Thanks, Bob!", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), replyToId: "reply1_thread1" },
    ],
  },
  {
    id: "thread2_cse301", courseId: "CSE301", courseName: "Introduction to Algorithms",
    title: "Recommended resources for understanding recursion?",
    author: MOCK_FORUM_USERS["user3"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityBy: MOCK_FORUM_USERS["user3"],
    replyCount: 0, viewCount: 8,
    originalPost: {
      id: "post1_thread2", author: MOCK_FORUM_USERS["user3"],
      content: "I find recursion quite challenging. Does anyone have links to good articles, videos, or practice problems that helped them grasp it better?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    replies: [],
  },
  {
    id: "thread1_cse401", courseId: "CSE401", courseName: "Mobile Application Development",
    title: "Choosing between React Native and Flutter for final project",
    author: MOCK_FORUM_USERS["user4"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityBy: MOCK_FORUM_USERS["user4"],
    replyCount: 0, viewCount: 5,
    originalPost: {
      id: "post1_thread3", author: MOCK_FORUM_USERS["user4"],
      content: "For our final project, I'm debating whether to use React Native or Flutter. Does anyone have experience with both and can share pros/cons for a relatively complex app?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    replies: [],
    isPinned: true,
  },
];

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) return names[0][0] + names[names.length - 1][0];
  return name.substring(0, 2).toUpperCase();
};

export default function DiscussionForumPage() {
  const [allThreads, setAllThreads] = useState<ForumThread[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isViewThreadDialogOpen, setIsViewThreadDialogOpen] = useState(false);
  const [currentThreadToView, setCurrentThreadToView] = useState<ForumThread | null>(null);
  
  const [isNewThreadDialogOpen, setIsNewThreadDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newThreadCourseId, setNewThreadCourseId] = useState<string>("");

  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToThreadId, setReplyingToThreadId] = useState<string | null>(null);


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAllThreads(MOCK_FORUM_THREADS);
      if (MOCK_ENROLLED_COURSES_FORUM.length > 0) {
        setNewThreadCourseId(MOCK_ENROLLED_COURSES_FORUM[0].id);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredThreads = useMemo(() => {
    return allThreads
      .filter(thread => selectedCourseId === "all" || thread.courseId === selectedCourseId)
      .filter(thread => 
        thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.originalPost.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a,b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  }, [allThreads, selectedCourseId, searchTerm]);

  const handleOpenViewThreadDialog = (thread: ForumThread) => {
    setCurrentThreadToView(thread);
    setIsViewThreadDialogOpen(true);
    setAllThreads(prev => prev.map(t => t.id === thread.id ? {...t, viewCount: (t.viewCount || 0) + 1} : t));
  };

  const handleOpenNewThreadDialog = () => {
    if (selectedCourseId === "all" && MOCK_ENROLLED_COURSES_FORUM.length > 0) {
      setNewThreadCourseId(MOCK_ENROLLED_COURSES_FORUM[0].id);
    } else if (selectedCourseId !== "all") {
      setNewThreadCourseId(selectedCourseId);
    } else if (MOCK_ENROLLED_COURSES_FORUM.length === 0) {
        toast({ title: "Cannot Create Thread", description: "No courses available to create a thread in.", variant: "destructive" });
        return;
    }
    setNewThreadTitle("");
    setNewThreadContent("");
    setIsNewThreadDialogOpen(true);
  };
  
  const handlePostNewThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !newThreadCourseId) {
      toast({ title: "Error", description: "Title, content, and course are required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newThread: ForumThread = {
        id: `thread${Date.now()}_${newThreadCourseId}`,
        courseId: newThreadCourseId,
        courseName: MOCK_ENROLLED_COURSES_FORUM.find(c => c.id === newThreadCourseId)?.name,
        title: newThreadTitle,
        author: MOCK_FORUM_USERS["user1"], 
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        lastActivityBy: MOCK_FORUM_USERS["user1"],
        replyCount: 0, viewCount: 0,
        originalPost: {
          id: `post${Date.now()}_new`, author: MOCK_FORUM_USERS["user1"],
          content: newThreadContent, createdAt: new Date().toISOString(),
        },
        replies: [],
      };
      setAllThreads(prev => [newThread, ...prev]);
      toast({ title: "Thread Posted!", description: `Your thread "${newThreadTitle}" has been created.` });
      setIsNewThreadDialogOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      setIsLoading(false);
    }, 1000);
  };

  const handleOpenReplyDialog = (threadId: string) => {
    setReplyingToThreadId(threadId);
    setReplyContent("");
    setIsReplyDialogOpen(true);
  };

  const handlePostReply = () => {
    if (!replyContent.trim() || !replyingToThreadId) {
       toast({ title: "Error", description: "Reply content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newReply: ForumPost = {
        id: `reply${Date.now()}`,
        author: MOCK_FORUM_USERS["user1"], 
        content: replyContent,
        createdAt: new Date().toISOString(),
      };
      const updatedThreads = allThreads.map(thread => {
        if (thread.id === replyingToThreadId) {
          return {
            ...thread,
            replies: [...thread.replies, newReply],
            replyCount: thread.replyCount + 1,
            lastActivityAt: new Date().toISOString(),
            lastActivityBy: MOCK_FORUM_USERS["user1"],
          };
        }
        return thread;
      });
      setAllThreads(updatedThreads);
      toast({ title: "Reply Posted!", description: "Your reply has been added to the thread." });
      setIsReplyDialogOpen(false);
      setReplyContent("");
      setReplyingToThreadId(null);
      
      // If view dialog was open for this thread, refresh its content
      if (currentThreadToView && currentThreadToView.id === replyingToThreadId) {
        const updatedThreadForDialog = updatedThreads.find(t => t.id === replyingToThreadId);
        if(updatedThreadForDialog) {
            setCurrentThreadToView(updatedThreadForDialog);
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const renderPostElement = (post: ForumPost, isOriginalPost = false) => (
    <motion.div 
        key={post.id} 
        className={`p-4 ${isOriginalPost ? 'border-b' : 'ml-4 lg:ml-8 border-l-2 pl-4 py-3 my-2 border-muted'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} data-ai-hint="user avatar" />
          <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNowStrict(parseISO(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none mt-1 whitespace-pre-wrap text-muted-foreground">
            {post.content}
          </div>
        </div>
      </div>
    </motion.div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <MessageSquare className="h-7 w-7 text-primary" />
                Discussion Forum
              </CardTitle>
              <CardDescription>Engage in course discussions, ask questions, and collaborate with peers.</CardDescription>
            </div>
            <Button onClick={handleOpenNewThreadDialog} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Start New Thread
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-grow sm:max-w-xs">
                <Label htmlFor="course-filter-forum" className="sr-only">Filter by Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger id="course-filter-forum">
                    <SelectValue placeholder="Filter by course..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {MOCK_ENROLLED_COURSES_FORUM.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
             </div>
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search threads by title, content, or author..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 pt-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : filteredThreads.length === 0 ? (
             <div className="text-center py-12">
                <Image src="https://placehold.co/300x200.png" alt="No threads" width={180} height={120} className="mx-auto mb-6 rounded-lg opacity-80" data-ai-hint="empty state forum chat" />
                <h3 className="text-xl font-semibold text-foreground/90">No Threads Yet</h3>
                <p className="text-muted-foreground mt-1.5 max-w-md mx-auto">
                  {selectedCourseId === "all" ? "There are no discussion threads started." : `No threads found for ${MOCK_ENROLLED_COURSES_FORUM.find(c => c.id === selectedCourseId)?.name || 'the selected course'}.`}
                  Be the first to start a discussion!
                </p>
              </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Thread / Author</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Replies</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Views</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreads.map(thread => (
                    <TableRow key={thread.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border hidden sm:flex">
                            <AvatarImage src={thread.author.avatarUrl} alt={thread.author.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{getInitials(thread.author.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-primary hover:underline cursor-pointer" onClick={() => handleOpenViewThreadDialog(thread)}>
                              {thread.isPinned && <span title="Pinned Thread" className="mr-1">📌</span>}
                              {thread.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {thread.author.name} in <span className="font-medium">{thread.courseName || thread.courseId}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{thread.replyCount}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">{thread.viewCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                        {thread.lastActivityBy ? 
                         `By ${thread.lastActivityBy.name} ` : ''} 
                         {formatDistanceToNowStrict(parseISO(thread.lastActivityAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenViewThreadDialog(thread)}>
                          <Eye className="mr-1.5 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Thread Dialog */}
      {isViewThreadDialogOpen && currentThreadToView && (
        <Dialog open={isViewThreadDialogOpen} onOpenChange={setIsViewThreadDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
            <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading thread...</p></div>}>
              <ViewThreadDialogContent
                thread={currentThreadToView}
                onClose={() => setIsViewThreadDialogOpen(false)}
                onReply={handleOpenReplyDialog}
                renderPost={renderPostElement}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}

      {/* New Thread Dialog */}
       <Dialog open={isNewThreadDialogOpen} onOpenChange={setIsNewThreadDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading form...</p></div>}>
              <NewThreadDialogContent
                courses={MOCK_ENROLLED_COURSES_FORUM}
                newThreadCourseId={newThreadCourseId}
                setNewThreadCourseId={setNewThreadCourseId}
                newThreadTitle={newThreadTitle}
                setNewThreadTitle={setNewThreadTitle}
                newThreadContent={newThreadContent}
                setNewThreadContent={setNewThreadContent}
                onPostNewThread={handlePostNewThread}
                isLoading={isLoading}
                onClose={() => setIsNewThreadDialogOpen(false)}
              />
            </Suspense>
          </DialogContent>
        </Dialog>

       {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-2">Loading form...</p></div>}>
            <ReplyDialogContent
              threadTitle={currentThreadToView?.title}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onPostReply={handlePostReply}
              isLoading={isLoading}
              onClose={() => setIsReplyDialogOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

