
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, GraduationCap, CreditCard, FileText, Download, User, Edit3, Settings, LogOut, HelpCircle, History, ChevronDown, Info, Phone, Mail, MapPin, Smartphone, Building, Users as GuardianIcon, Briefcase, CalendarDays, ShieldAlert, Award, Globe, School, Loader2, Bell, AlertTriangle, CheckCircle as CheckCircleIcon, MessageSquare, FileWarning, Video, PresentationIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { Course, Notification, NotificationType, FeeItem } from "@/types";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS, ALL_UNIVERSITY_COURSES, getGradeDetailsFromScore } from "@/config/data";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Fee Constants (ensure these match what's in payments/page.tsx or central config)
const BASE_TUITION = 350000;
const REGISTRATION_FEE = 25000;
const MEDICALS_FEE = 5000;
const STUDENT_UNION_FEE = 3000;
const STUDENT_ID_CARD_FEE = 2000;
const EXCURSION_FEE = 25000;
const HND_DEFENSE_FEE = 25000;
const WORK_EXPERIENCE_FEE = 5000;
const DESIGN_PROJECT_DEFENSE_FEE = 15000;
const FINAL_DEFENSE_FEE = 30000;
const GRADUATION_FEE = 15000;
const CURRENCY = "XAF";

const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Grades Published for CSE301", description: "Your grades for Introduction to Algorithms are now available.", type: "grade_release", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/grades" },
  { id: "n2", title: "New Material: Week 5 Lecture Notes", description: "Lecture notes for CSE401 - Week 5 have been uploaded.", type: "new_material", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/e-learning/materials" },
  { id: "n3", title: "Assignment Due: Mobile App Proposal", description: "Your CSE401 UI/UX proposal is due in 3 days.", type: "assignment_due", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isRead: true, link: "/dashboard/student/e-learning/assignments" },
  { id: "n4", title: "Payment Reminder: Second Installment", description: "Your second tuition installment is due next week.", type: "payment_due", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isRead: false, link: "/dashboard/student/payments" },
  { id: "n5", title: "Forum Reply in 'Big O Discussion'", description: "Dr. Eno replied to your question in the CSE301 forum.", type: "forum_reply", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isRead: true, link: "/dashboard/student/e-learning/forum" },
  { id: "n6", title: "System Maintenance Scheduled", description: "The CUSMS portal will be down for maintenance on Sunday from 2 AM to 4 AM.", type: "info", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), isRead: true },
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

export function StudentDashboard() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [displayedEnrolledCourses, setDisplayedEnrolledCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const [totalFeesDue, setTotalFeesDue] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isLoadingFees, setIsLoadingFees] = useState(true);

  useEffect(() => {
    async function loadRegisteredCoursesForDashboard() {
      setIsLoadingCourses(true);
      if (profile && user?.uid && typeof window !== 'undefined') {
        const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
        let studentRegisteredIds: string[] = [];
        if (storageKey) {
          const storedIds = localStorage.getItem(storageKey);
          if (storedIds) {
            try {
              const parsedIds = JSON.parse(storedIds);
              if (Array.isArray(parsedIds)) studentRegisteredIds = parsedIds;
            } catch (e) {
              console.error("Failed to parse registered courses from localStorage for dashboard:", e);
            }
          }
        }

        const studentCurrentYear = profile.currentAcademicYear || ACADEMIC_YEARS[2];
        const studentCurrentSemester = profile.currentSemester || SEMESTERS[0];

        const filtered = ALL_UNIVERSITY_COURSES.filter(course =>
          studentRegisteredIds.includes(course.id) &&
          course.academicYear === studentCurrentYear &&
          course.semester === studentCurrentSemester &&
          course.department === profile.department &&
          course.level === profile.level
        );
        setDisplayedEnrolledCourses(filtered);
      } else {
        setDisplayedEnrolledCourses([]);
      }
      setIsLoadingCourses(false);
    }

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setNotifications(MOCK_NOTIFICATIONS.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
      setIsLoadingNotifications(false);
    }

    if (profile && !authLoading) {
      setIsLoadingFees(true);
      let currentTotal = 0;
      currentTotal += BASE_TUITION;
      currentTotal += MEDICALS_FEE;
      currentTotal += STUDENT_UNION_FEE;
      currentTotal += STUDENT_ID_CARD_FEE;
      currentTotal += EXCURSION_FEE;
      if (profile.isNewStudent) currentTotal += REGISTRATION_FEE;
      if (profile.level === 300) currentTotal += HND_DEFENSE_FEE;
      if (profile.level === 400) {
        currentTotal += WORK_EXPERIENCE_FEE;
        currentTotal += DESIGN_PROJECT_DEFENSE_FEE;
        currentTotal += FINAL_DEFENSE_FEE;
      }
      if ((profile.level === 300 || profile.level === 400) && profile.isGraduating) {
        currentTotal += GRADUATION_FEE;
      }
      const mockPaidAmount = Math.min(currentTotal, 300000 + (profile.level === 400 ? 50000 : 0));
      setAmountPaid(mockPaidAmount);
      setTotalFeesDue(currentTotal);
      setIsLoadingFees(false);
    } else if (!authLoading && !profile) {
      setIsLoadingFees(false);
    }

    if (profile && !authLoading) {
      loadRegisteredCoursesForDashboard();
      loadNotifications();
    } else if (!authLoading) {
      setIsLoadingCourses(false);
      setIsLoadingNotifications(false);
      setIsLoadingFees(false);
    }
  }, [profile, user?.uid, authLoading]);

  const balance = useMemo(() => totalFeesDue - amountPaid, [totalFeesDue, amountPaid]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const academicProgram = profile?.program || "Program Not Set";
  const studentDepartment = profile?.department || "Department Not Set";
  const studentLevel = profile?.level ? `Level ${profile.level}` : "Level Not Set";
  const currentAcademicYear = profile?.currentAcademicYear || "Academic Year Not Set";
  const currentSemester = profile?.currentSemester || "Semester Not Set";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-8 pb-8"
    >
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-card to-card p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <Link href="/profile" className="relative group">
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-4 ring-primary ring-offset-background ring-offset-2 group-hover:ring-accent transition-all duration-300">
                <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || "User"} data-ai-hint="user avatar" />
                <AvatarFallback className="text-3xl md:text-4xl bg-muted">{getInitials(profile?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </Link>
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="font-headline text-3xl md:text-4xl text-foreground">Hi, {profile?.displayName || "Student"}!</CardTitle>
              <CardDescription className="text-md md:text-lg text-muted-foreground mt-1">
                {academicProgram} <br className="sm:hidden" />
                <span className="hidden sm:inline">&bull; </span> {currentAcademicYear} &bull; {currentSemester}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-3 sm:mt-0 ml-auto shrink-0">
                  Account <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/student/payments/history" passHref>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    View Transaction History
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/help" passHref>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contact Support (Placeholder)
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Links Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[
          { title: 'Courses', href: '/courses', icon: BookOpen },
          { title: 'Timetable', href: '/dashboard/student/timetable', icon: CalendarDays },
          { title: 'Grades', href: '/dashboard/student/grades', icon: GraduationCap },
          { title: 'Payments', href: '/dashboard/student/payments', icon: CreditCard },
          { title: 'Materials', href: '/dashboard/student/e-learning/materials', icon: FolderArchive },
          { title: 'Assignments', href: '/dashboard/student/e-learning/assignments', icon: ClipboardCheck },
        ].map(item => (
          <Link href={item.href} key={item.title} passHref>
            <Button variant="outline" className="w-full h-20 md:h-24 flex flex-col items-center justify-center gap-1.5 text-center shadow-sm hover:shadow-md hover:border-primary transition-all">
              <item.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">{item.title}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="text-primary"/>Recent Notifications</CardTitle>
              <CardDescription>Stay updated with important announcements and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingNotifications ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : notifications.length > 0 ? (
                <ScrollArea className="h-[280px] p-4">
                  <ul className="space-y-3">
                    {notifications.slice(0, 5).map(notif => {
                      const Icon = getNotificationIcon(notif.type);
                      const isClickable = !!notif.link;
                      const NotificationItemWrapper = isClickable ? Link : 'div';
                      const wrapperProps = isClickable ? { href: notif.link! } : {};

                      return (
                        <li key={notif.id}>
                          <NotificationItemWrapper {...wrapperProps}>
                            <div
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                !notif.isRead && "bg-primary/5 border-primary/20 hover:bg-primary/10",
                                notif.isRead && "bg-muted/50 hover:bg-muted/70",
                                isClickable && "cursor-pointer"
                              )}
                              onClick={() => !isClickable && handleNotificationClick(notif.id)}
                            >
                              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0",
                                  !notif.isRead ? 'text-primary' : 'text-muted-foreground'
                              )} />
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <h4 className={cn("font-medium text-sm", !notif.isRead && "text-foreground")}>{notif.title}</h4>
                                  {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-2 mt-1.5" title="Unread"></span>}
                                </div>
                                <p className={cn("text-xs", !notif.isRead ? "text-foreground/80" : "text-muted-foreground")}>{notif.description}</p>
                                <p className={cn("text-xs mt-1", !notif.isRead ? "text-foreground/60" : "text-muted-foreground/80")}>
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
              ) : (
                <div className="text-center py-6 p-4">
                  <Image src="https://placehold.co/200x150.png" alt="No notifications" width={100} height={75} className="mx-auto mb-3 rounded-md opacity-70" data-ai-hint="empty bell notification" />
                  <p className="text-muted-foreground">No new notifications.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/notifications">View All Notifications</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary"/>Tuition Status</CardTitle>
              <CardDescription>Overview of your fee payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingFees || authLoading ? (
                <>
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-6 w-1/2 mb-1" />
                  <Skeleton className="h-6 w-2/3" />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Due:</span>
                    <span className="font-semibold">{CURRENCY} {totalFeesDue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{CURRENCY} {amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-semibold ${balance > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>{CURRENCY} {balance.toLocaleString()}</span>
                  </div>
                </>
              )}
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/student/payments">Make a Payment</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 pt-2">
                <Smartphone className="h-3 w-3" /> Supports MTN Mobile Money & Orange Money.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
