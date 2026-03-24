"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, User, ShieldAlert } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface Message {
  _id: string;
  senderId: any;
  receiverId: any;
  content: string;
  createdAt: string;
}

export function LiveChatWidget() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Connect to websocket globally if logged in as a regular user
  useEffect(() => {
    // We don't want to show widget to admins, or on the dedicated chat pages
    if (!isAuthenticated || user?.role === "admin" || pathname.includes("/chat")) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const initLiveSupport = async () => {
      try {
        const adminRes = await api.get("/users/admin");
        const adminObj = adminRes.data?.data;
        if (!adminObj) return;
        
        if (isMounted) setAdminId(adminObj._id);

        // Fetch History
        const historyRes = await api.get(`/chat/${adminObj._id}`);
        if (isMounted) setMessages(historyRes.data.data || []);

        // Socket logic
        const currentUserId = user?._id || (user as any)?.id || "";
        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000", {
          query: { userId: currentUserId }
        });

        socketRef.current = socket;

        socket.on("newMessage", (msg: Message) => {
          if (isMounted) {
            setMessages(prev => [...prev, msg]);
            // If widget is closed, notify and pop it open automatically!
            setIsOpen(currentIsOpen => {
              if (!currentIsOpen) {
                toast.info("New message from Support!");
              }
              return true; // Auto-open the chat!
            });
          }
        });

        socket.on("messageSent", (msg: Message) => {
          if (isMounted) setMessages(prev => [...prev, msg]);
        });

      } catch (error) {
        console.error("Failed to initialize live chat widget", error);
      }
    };

    initLiveSupport();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user, pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!adminId) {
      toast.error("Support is temporarily unavailable.");
      return;
    }

    if (!socketRef.current) {
      toast.error("Live WebSockets are completely disconnected! Please refresh the page.");
      // Attempt to forcibly re-init socket
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000", {
        query: { userId: user?._id }
      });
    }

    socketRef.current.emit("sendMessage", {
      receiverId: adminId,
      content: input.trim(),
    });

    setInput("");
  };

  // Hide widget completely if on dedicated chat page or admin
  if (!isAuthenticated || user?.role === "admin" || pathname.includes("/chat") || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-foreground text-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <span className="font-semibold tracking-wide">Live Support Agent</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-background/20 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <MessageCircle className="w-10 h-10 mb-2 text-foreground" />
                <p className="text-sm text-muted-foreground">Ask us anything!<br/>Our support team is live.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                
                return (
                  <div key={msg._id || idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mb-1">
                        <User className="w-4 h-4 text-foreground" />
                      </div>
                    )}
                    
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                      isMe 
                        ? 'bg-foreground text-background rounded-br-none' 
                        : 'bg-card border border-border text-foreground rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-wrap leading-tight">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={adminId ? "Type a message..." : "Connecting..."}
                disabled={!adminId}
                className="flex-1 bg-muted border border-border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-foreground transition-colors text-foreground"
              />
              <button
                type="submit"
                disabled={!input.trim() || !adminId}
                className="bg-foreground text-background p-2.5 rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-50 animate-in fade-in zoom-in"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background animate-pulse">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
