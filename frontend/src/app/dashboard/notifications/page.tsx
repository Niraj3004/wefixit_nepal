"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Bell, ArrowLeft, Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  _id: string;
  user: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (response.data && response.data.data) {
          setNotifications(response.data.data);
        }
      } catch (error: any) {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, router]);

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;

    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      // Slient fail for marking as read
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push("/dashboard")} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-2">Stay updated on your repair requests and invoices.</p>
          </div>
          <div className="hidden sm:flex bg-primary/10 p-4 rounded-2xl relative">
            <Bell className="w-8 h-8 text-primary" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-2 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            {notifications.length > 0 ? (
              <div className="flex flex-col gap-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => markAsRead(notification._id, notification.isRead)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                      notification.isRead 
                        ? 'bg-transparent border-border hover:bg-muted/30' 
                        : 'bg-primary/5 border-primary/30 shadow-sm'
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {notification.isRead 
                        ? <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                        : <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Circle className="w-3 h-3 fill-current" /></div>
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`text-[15px] leading-relaxed mb-1 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Notifications</h3>
                <p className="text-muted-foreground">You don't have any new updates right now.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
