"use client"

import * as React from "react"
import { IconBell } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  type?: "info" | "success" | "warning" | "error"
}

interface NotificationsProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
}

// Sample notifications - replace with actual data
const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Profile Updated",
    message: "Your business profile has been successfully updated.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    type: "success"
  },
  {
    id: "2", 
    title: "New Review Received",
    message: "You received a 5-star review on Google Business Profile.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    type: "info"
  },
  {
    id: "3",
    title: "Subscription Renewal",
    message: "Your subscription will renew in 3 days.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    type: "warning"
  }
]

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function Notifications({ 
  notifications = sampleNotifications,
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id)
  }
  
  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <IconBell className="h-8 w-8" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 99 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-auto p-1"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-md cursor-pointer transition-colors border",
                    notification.isRead
                      ? "bg-muted/30 text-muted-foreground border-transparent"
                      : "bg-background text-foreground border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        notification.isRead && "text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <p className={cn(
                        "text-xs mt-1",
                        notification.isRead ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="pt-3 mt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
