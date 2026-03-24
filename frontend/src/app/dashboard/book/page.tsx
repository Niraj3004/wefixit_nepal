"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Wrench, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function BookRepairPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [deviceType, setDeviceType] = useState("Smartphone");
  const [deviceModel, setDeviceModel] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successTrackingId, setSuccessTrackingId] = useState<string | null>(null);

  // Protected route check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to book a service");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim() || !issueDescription.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      // Backend expects multipart/form-data because of multer upload.array
      const formData = new FormData();
      formData.append("deviceType", deviceType);
      formData.append("deviceModel", deviceModel);
      formData.append("issueDescription", issueDescription);

      const response = await api.post("/booking", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("Booking created successfully!");
      // Set tracking ID to show success state
      if (response.data?.data?.trackingId) {
        setSuccessTrackingId(response.data.data.trackingId);
      } else {
        router.push("/dashboard"); // Fallback
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (successTrackingId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="bg-card border border-border p-10 rounded-3xl max-w-md w-full text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">Your repair request has been successfully submitted to the WeFixIt team.</p>
          
          <div className="bg-muted p-4 rounded-xl mb-8">
            <p className="text-sm text-muted-foreground mb-1">Your Tracking ID</p>
            <p className="text-xl font-mono font-bold text-foreground tracking-wider">{successTrackingId}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/track?id=${successTrackingId}`} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-sm transition-all hover:bg-primary/90 flex justify-center items-center">
              Track Status
            </Link>
            <Link href="/dashboard" className="w-full bg-secondary text-foreground py-3 rounded-xl font-medium transition-all hover:bg-secondary/80 flex justify-center items-center">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Book a Service</h1>
            <p className="text-muted-foreground text-lg">Provide details about what needs fixing, and our professionals will handle the rest.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Service / Device Category
              </label>
              <select 
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground appearance-none"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop/PC">Laptop / PC</option>
                <option value="Home Appliance">Home Appliance (TV, Fridge, Washing Machine)</option>
                <option value="AC Repair">AC Repair & Service</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical Work</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" /> Brand / Model Name
              </label>
              <input 
                type="text" 
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. Samsung AC, iPhone 13, Kitchen Sink"
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Issue Description
              </label>
              <textarea 
                rows={5}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the problem in detail. When did it start? Are there any strange noises or error codes?"
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-border">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Service Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
