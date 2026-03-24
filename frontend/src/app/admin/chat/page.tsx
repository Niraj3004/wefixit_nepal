"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { io, Socket } from "socket.io-client";
import { Send, User, ChevronLeft, Loader2, MessageSquare, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Message {
  _id: string;
  senderId: any;
  receiverId: any;
  content: string;
  createdAt: string;
}

interface ClientUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export default function AdminChatPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedUserRef = useRef<ClientUser | null>(null);

  // Keep a ref of selected user to access inside socket closures without re-binding
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initialize Data and Socket
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const initAdminChat = async () => {
      try {
        // Fetch all users
        const usersRes = await api.get("/admin/users");
        if (usersRes.data?.data) {
          setUsers(usersRes.data.data.filter((u: any) => u.role !== 'admin'));
        }

        // Connect to WebSocket using admin's info
        // Wait, admin object might not have _id because of JWT structure. Let's check user._id or use email if _id is missing
        // For socket, we need a unique identifier. We'll use user.email or user._id. The backend uses jwt decoded.id, but admin has email.
        const tokenData = localStorage.getItem('wefixit-auth');
        let adminId = user._id || "system_admin";
        
        // Let's get the admin's DB ID if possible via /users/admin endpoint
        try {
          const adminDBRes = await api.get("/users/admin");
          if (adminDBRes.data?.data?._id) {
            adminId = adminDBRes.data.data._id;
          }
        } catch (err) {
          console.warn("Could not fetch admin explicit DB id, falling back to local user store ID.");
        }

        const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000", {
          query: { userId: adminId }
        });

        socketRef.current = socket;

        // Attach listeners directly to the guaranteed socket instance
        socket.on("newMessage", (msg: Message) => {
          const senderId = msg.senderId?._id || msg.senderId;
          const currentSelected = selectedUserRef.current;
          if (currentSelected && senderId === currentSelected._id) {
            setMessages(prev => [...prev, msg]);
          } else if (msg.senderId?.role !== 'admin') {
            const name = msg.senderId?.firstName || "A client";
            toast.success(`New message from ${name}`);
          }
        });

        socket.on("messageSent", (msg: Message) => {
          const recId = msg.receiverId?._id || msg.receiverId;
          const currentSelected = selectedUserRef.current;
          if (currentSelected && recId === currentSelected._id) {
            setMessages(prev => [...prev, msg]);
          }
        });

        socket.on("messageError", (err) => {
          toast.error(err.error || "Failed to send message");
        });

      } catch (error: any) {
        toast.error(error.message || "Could not load clients.");
      } finally {
        setLoadingUsers(false);
      }
    };

    initAdminChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, router, user]);

  // Fetch chat history when selecting a user
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchHistory = async () => {
      setLoadingChat(true);
      try {
        const historyRes = await api.get(`/chat/${selectedUser._id}`);
        setMessages(historyRes.data.data || []);
      } catch (error) {
        toast.error("Failed to load chat history.");
      } finally {
        setLoadingChat(false);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!selectedUser) {
      toast.error("Please select a user first.");
      return;
    }

    if (!socketRef.current) {
      toast.error("Live WebSockets are completely disconnected! Please refresh the page.");
      // Attempt to forcibly re-init socket so it isn't permabroken
      const adminId = user?._id || "system_admin";
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000", {
        query: { userId: adminId }
      });
    }

    // Emit via socket
    socketRef.current.emit("sendMessage", {
      receiverId: selectedUser._id,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  const filteredUsers = users.filter(u => 
    (u.firstName + " " + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <div className="w-full h-screen bg-card border-x border-border flex flex-col overflow-hidden max-w-7xl mx-auto md:my-0 md:rounded-none md:border-y-0 shadow-lg">
        
        {/* Header (Mobile & Desktop) */}
        <div className="bg-background border-b border-border p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-foreground">Support Center</h1>
              <p className="text-xs text-muted-foreground">{users.length} Registered Clients</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Users List */}
          <div className={`w-full md:w-80 border-r border-border bg-background flex flex-col shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto hidden-scrollbar">
              {loadingUsers ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No clients found.</div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${selectedUser?._id === u._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {u.firstName?.[0] || 'U'}{u.lastName?.[0] || ''}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-foreground text-sm truncate">{u.firstName} {u.lastName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Area - Chat Window */}
          <div className={`flex-1 flex flex-col bg-muted/10 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
            {!selectedUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium text-foreground mb-1">Select a client to start chatting</h3>
                <p className="text-sm">Connect with users instantly to resolve issues.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-background border-b border-border p-4 flex items-center gap-3 shrink-0">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 hover:bg-muted rounded-full">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </p>
                      {selectedUser.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedUser.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                      <p>Start the conversation with {selectedUser.firstName}</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isAdminMessage = msg.senderId?._id 
                        ? msg.senderId.role === 'admin' 
                        : (msg.senderId !== selectedUser._id);
                      
                      return (
                        <div key={msg._id || i} className={`flex ${isAdminMessage ? "justify-end" : "justify-start"}`}>
                          <div className={`flex items-end gap-2 max-w-[75%] ${isAdminMessage ? "flex-row-reverse" : "flex-row"}`}>
                            {!isAdminMessage && (
                              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mb-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                              isAdminMessage 
                                ? "bg-primary text-primary-foreground rounded-br-sm" 
                                : "bg-white border border-border text-foreground rounded-bl-sm"
                            }`}>
                              <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                              <p className={`text-[10px] mt-2 font-medium tracking-wide ${isAdminMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-background border-t border-border p-4 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedUser.firstName}...`}
                      className="flex-1 bg-muted/50 border border-border pl-4 pr-14 py-3.5 rounded-xl focus:outline-none focus:border-primary transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
