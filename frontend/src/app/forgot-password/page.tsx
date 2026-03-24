"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      toast.success(response.data.message || "OTP sent to your email.");
      // We push them to reset-password explicitly 
      // where they can enter their OTP
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-foreground mb-2">Forgot Password</h2>
        <p className="text-muted-foreground text-center mb-8">
          Enter your email address and we'll send you a custom code to reset your password.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" 
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
