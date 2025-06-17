
"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { GraduationCap, BookOpen, FileWarning, CreditCard, MessageSquare, Info, AlertTriangle, CheckCircle as CheckCircleIcon, Bell } from 'lucide-react';

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

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem = React.memo(function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const isClickable = !!notification.link;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        !notification.isRead && "bg-primary/5 border-primary/20 hover:bg-primary/10",
        notification.isRead && "bg-muted/50 hover:bg-muted/70",
        isClickable && "cursor-pointer"
      )}
      onClick={() => !isClickable && onClick(notification.id)} // Only call onClick here if not a link, link handles its own navigation
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0",
          !notification.isRead ? 'text-primary' : 'text-muted-foreground'
      )} />
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h4 className={cn("font-medium text-sm", !notification.isRead && "text-foreground")}>{notification.title}</h4>
          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-2 mt-1.5" title="Unread"></span>}
        </div>
        <p className={cn("text-xs", !notification.isRead ? "text-foreground/80" : "text-muted-foreground")}>{notification.description}</p>
        <p className={cn("text-xs mt-1", !notification.isRead ? "text-foreground/60" : "text-muted-foreground/80")}>
          {formatDistanceToNowStrict(parseISO(notification.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (isClickable) {
    // When it's a link, we let the Link component handle navigation.
    // The onClick for marking as read should happen when the link is clicked, so we attach it there.
    return (
      <Link href={notification.link!} passHref legacyBehavior>
        <a onClick={() => onClick(notification.id)}>{content}</a>
      </Link>
    );
  }

  return <div>{content}</div>; // For non-clickable items, the div's onClick handles marking as read.
});
NotificationItem.displayName = 'NotificationItem';


export default NotificationItem;
