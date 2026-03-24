"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { io, Socket } from "socket.io-client";
import { Send, User, ChevronLeft, Loader2, MessageSquare, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Message {
  _id: string;
  senderId: any;
  receiverId: any;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [adminId, setAdminId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const initChat = async () => {
      try {
        // 1. Get Admin ID
        const adminRes = await api.get("/users/admin");
        const adminData = adminRes.data.data;
        if (!adminData) throw new Error("Support is currently offline.");
        
        setAdminId(adminData._id);

        // 2. Fetch Chat History
        const historyRes = await api.get(`/chat/${adminData._id}`);
        setMessages(historyRes.data.data || []);

        // 3. Connect to WebSocket
        const currentUserId = user?._id || (user as any)?.id || "";
        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000", {
          query: { userId: currentUserId }
        });

        socketRef.current = socket;

        // Listen for new incoming messages
        socket.on("newMessage", (msg: Message) => {
          setMessages(prev => [...prev, msg]);
        });
        
        // Listen for our own sent messages to get DB confirmation
        socket.on("messageSent", (msg: Message) => {
          setMessages(prev => [...prev, msg]);
        });

        socket.on("messageError", (err) => {
          toast.error(err.error || "Failed to send message");
        });

      } catch (error: any) {
        toast.error(error.message || "Could not initialize chat.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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

    // Emit via socket
    socketRef.current.emit("sendMessage", {
      receiverId: adminId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-muted/20 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-card border border-border shadow-xl md:rounded-3xl flex flex-col overflow-hidden h-[100dvh] md:h-[85vh]">
        
        {/* Header */}
        <div className="bg-background border-b border-border p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
                <ShieldAlert className="w-5 h-5" />
                {adminId && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>}
              </div>
              <div>
                <h2 className="font-bold text-foreground">Live Support</h2>
                <p className="text-xs text-muted-foreground">{adminId ? "Online - Usually replies instantly" : "Offline"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30 flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Connecting to support...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm">
              <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">How can we help?</h3>
              <p className="text-muted-foreground">Send a message to our support team and we will get back to you immediately.</p>
            </div>
          ) : (
            <div className="flex flex-col w-full gap-4 pb-2">
              {messages.map((msg, i) => {
                const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                
                return (
                  <div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mb-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`p-4 rounded-2xl shadow-sm ${
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-background border border-border text-foreground rounded-bl-sm"
                      }`}>
                        <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-2 font-medium tracking-wide ${isMe ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-background border-t border-border p-4 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={adminId ? "Type your message..." : "Support is offline"}
              disabled={!adminId || loading}
              className="flex-1 bg-muted/50 border border-border px-5 py-3.5 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !adminId || loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
