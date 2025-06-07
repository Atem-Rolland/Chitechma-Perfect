
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { Notification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  GraduationCap, 
  BookOpen, 
  FileWarning, 
  CreditCard, 
  MessageSquare, 
  Info, 
  AlertTriangle, 
  CheckCircle as CheckCircleIcon 
} from 'lucide-react'; // Renamed CheckCircle to avoid conflict

// Mock data - same as in StudentDashboard for consistency in this phase
const MOCK_NOTIFICATIONS_ALL: Notification[] = [
  { id: "n1", title: "Grades Published for CSE301", description: "Your grades for Introduction to Algorithms are now available.", type: "grade_release", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/grades" },
  { id: "n2", title: "New Material: Week 5 Lecture Notes", description: "Lecture notes for CSE401 - Week 5 have been uploaded.", type: "new_material", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/e-learning/materials" },
  { id: "n3", title: "Assignment Due: Mobile App Proposal", description: "Your CSE401 UI/UX proposal is due in 3 days.", type: "assignment_due", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isRead: true, link: "/dashboard/student/e-learning/assignments" },
  { id: "n4", title: "Payment Reminder: Second Installment", description: "Your second tuition installment is due next week.", type: "payment_due", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/payments" },
  { id: "n5", title: "Forum Reply in 'Big O Discussion'", description: "Dr. Eno replied to your question in the CSE301 forum.", type: "forum_reply", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isRead: true, link: "/dashboard/student/e-learning/forum" },
  { id: "n6", title: "System Maintenance Scheduled", description: "The CUSMS portal will be down for maintenance on Sunday from 2 AM to 4 AM.", type: "info", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), isRead: true },
  { id: "n7", title: "Welcome to CUSMS!", description: "Explore your dashboard and e-learning tools.", type: "success", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), isRead: true },
  { id: "n8", title: "Profile Update Required", description: "Please update your emergency contact information.", type: "warning", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/profile" },
];

const getNotificationIcon = (type: NotificationType): React.ElementType => {
  switch (type) {
    case 'grade_release': return GraduationCap;
    case 'new_material': return BookOpen;
    case 'assignment_due': return FileWarning;
    case 'payment_due': return CreditCard;
    case 'forum_reply': return MessageSquare;
    case 'info': return Info;
    case 'warning': return AlertTriangle;
    case 'success': return CheckCircleIcon;
    case 'course_update': return BookOpen;
    default: return Bell;
  }
};

export default function AllNotificationsPage() {
  const { user } = useAuth(); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching all notifications for the user
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS_ALL.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
      setIsLoading(false);
    }, 800);
  }, [user?.uid]); // Changed dependency from [user] to [user?.uid]

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Bell className="h-7 w-7 text-primary" />
                All Notifications
              </CardTitle>
              <CardDescription>View all your announcements, alerts, and updates.</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" asChild>
                <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard</Link>
              </Button>
              <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0 || isLoading}>
                <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read ({unreadCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Image src="https://placehold.co/200x150.png" alt="No notifications" width={120} height={90} className="mx-auto mb-4 rounded-md opacity-70" data-ai-hint="empty inbox" />
              <h3 className="text-xl font-semibold text-foreground/90">No Notifications Yet</h3>
              <p className="text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-18rem)]">
              <ul className="divide-y divide-border">
                {notifications.map(notif => {
                  const Icon = getNotificationIcon(notif.type);
                  const isClickable = !!notif.link;
                  const NotificationItemWrapper = isClickable ? Link : 'div';
                  const wrapperProps = isClickable ? { href: notif.link! } : {}; // Added non-null assertion

                  return (
                    <li key={notif.id}>
                      <NotificationItemWrapper {...wrapperProps} onClick={() => handleMarkAsRead(notif.id)}>
                        <div // Removed motion.div from here
                          className={cn(
                            "flex items-start gap-4 p-4 transition-colors",
                            !notif.isRead && "bg-primary/5 hover:bg-primary/10",
                            notif.isRead && "hover:bg-muted/50",
                            isClickable && "cursor-pointer"
                          )}
                        >
                          <div className={cn("mt-1 p-2 rounded-full", !notif.isRead ? 'bg-primary/10' : 'bg-muted')}>
                            <Icon className={cn("h-5 w-5 shrink-0", !notif.isRead ? 'text-primary' : 'text-muted-foreground')} />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <h4 className={cn("font-medium", !notif.isRead && "text-foreground")}>{notif.title}</h4>
                              {!notif.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 ml-3 mt-1.5" title="Unread"></span>}
                            </div>
                            <p className={cn("text-sm", !notif.isRead ? "text-foreground/80" : "text-muted-foreground")}>
                              {notif.description}
                            </p>
                            <p className={cn("text-xs mt-1.5", !notif.isRead ? "text-foreground/70" : "text-muted-foreground/80")}>
                              {formatDistanceToNowStrict(parseISO(notif.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </NotificationItemWrapper>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
        {notifications.length > 0 && (
            <CardFooter className="border-t pt-4">
                 <p className="text-xs text-muted-foreground text-center w-full">
                    End of notifications. {unreadCount > 0 ? `${unreadCount} unread.` : "All caught up!"}
                </p>
            </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
