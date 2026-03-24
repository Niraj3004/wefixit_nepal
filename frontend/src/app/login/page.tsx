"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      
      // The backend returns { user: {...}, token } for normal clients
      // BUT it returns { role: 'admin', token } for the hardcoded Admin login
      if (response.data && response.data.token && (response.data.user || response.data.role === 'admin')) {
        
        const role = response.data.role || response.data.user?.role;
        const loggedInUser = response.data.user || {
          _id: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          email: email,
          role: 'admin'
        };

        setAuth(loggedInUser, response.data.token);
        toast.success(response.data.message || "Login successful!");
        
        // Redirect securely based on role
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error("Invalid response format from server.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to login. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Visual / Branding Side */}
      <div className="hidden md:flex flex-1 relative bg-primary/5 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-lg text-left">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl w-fit mb-8 shadow-sm cursor-pointer" onClick={() => router.push('/')}>
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            Welcome back to <span className="text-primary">WeFixIt</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Log in to manage your active bookings, view invoices, or schedule a new professional repair service today.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-card border-l border-border relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo Only visible on small screens */}
          <div className="md:hidden flex items-center gap-2 mb-10 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              WeFix<span className="text-primary">It</span>
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign in</h2>
            <p className="text-muted-foreground">Enter your details and start booking.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">Remember me</label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
