"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Send, Bot, User, ChevronLeft, Loader2, Cpu } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function AIChatPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am WeFixIt's AI Assistant. You can ask me about our repair services, electronics troubleshooting, or device maintenance!",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chatbot/query", { message: userMessage.text });
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.data.reply || "I'm sorry, I didn't understand that.",
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I'm having trouble connecting right now. Please try again later.",
      }]);
    } finally {
      setLoading(false);
    }
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
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary relative shadow-sm">
                <Cpu className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
              </div>
              <div>
                <h2 className="font-bold text-foreground">AI Support Agent</h2>
                <p className="text-xs text-muted-foreground">Always Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30 flex justify-center">
          <div className="flex flex-col w-full gap-4 pb-2">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 shadow-sm ${
                      isUser ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`p-4 rounded-2xl shadow-sm ${
                      isUser 
                        ? "bg-foreground text-background rounded-br-sm" 
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    }`}>
                      <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mb-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border rounded-bl-sm flex items-center h-[52px]">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-background border-t border-border p-4 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about troubleshooting..."
              disabled={loading}
              className="flex-1 bg-muted/50 border border-border px-5 py-3.5 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-foreground hover:bg-foreground/90 text-background px-5 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
