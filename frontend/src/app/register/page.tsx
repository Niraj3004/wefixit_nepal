"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  
  // Step 1: User Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  
  // Step 2: OTP & Password validation
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", { 
        firstName, lastName, phone, email, currentAddress 
      });
      
      toast.success(response.data.message || "OTP sent to your email!");
      setStep(2); // Move to OTP step
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { 
        email, 
        otp, 
        password,
        confirmPassword 
      });
      toast.success(response.data.message || "Account created successfully! You can now log in.");
      
      // Redirect to login
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP or request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-background">
      {/* Visual / Branding Side */}
      <div className="hidden md:flex flex-1 relative bg-secondary/30 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-lg text-left">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl w-fit mb-8 shadow-sm cursor-pointer" onClick={() => router.push('/')}>
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            Join the <span className="text-primary">WeFixIt</span> Network
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create an account in seconds to access Nepal's finest home maintenance and repair professionals.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-card border-r border-border relative">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-10 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              WeFix<span className="text-primary">It</span>
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-muted-foreground">
              {step === 1 ? "Fill in the details to get started." : `Enter the OTP sent to ${email} and set your password.`}
            </p>
          </div>

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ram" 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Shrestha" 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <input 
                  type="email" 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ram@example.com" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="9800000000" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Address</label>
                <input 
                  type="text" 
                  value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="Kathmandu, Nepal" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleVerifyOtp}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp} onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  maxLength={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground tracking-widest text-center text-xl font-bold"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Set New Password</label>
                <input 
                  type="password" 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground pt-1">Must be at least 8 characters long.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-1/3 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-2/3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Complete Signup <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in directly
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
