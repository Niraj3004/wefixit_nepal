"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        const userData = res.data.data;
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setPhone(userData.phone || "");
        setCurrentAddress(userData.currentAddress || "");
      } catch (error: any) {
        toast.error("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put("/users/me", {
        firstName, lastName, phone, currentAddress
      });
      toast.success(res.data.message || "Profile updated successfully!");
      // Update local store user context
      if (res.data.data) {
        setAuth(res.data.data, localStorage.getItem('wefixit-auth') ? JSON.parse(localStorage.getItem('wefixit-auth')!).state.token : "");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setPasswordLoading(true);
    try {
      const res = await api.put("/users/change-password", {
        currentPassword, newPassword, confirmNewPassword
      });
      toast.success(res.data.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
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

        <h1 className="text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PROFILE UPDATE FORM */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <User className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Personal Info</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input 
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input 
                    type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input 
                  type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Address</label>
                <input 
                  type="text" value={currentAddress} onChange={e => setCurrentAddress(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                />
              </div>

              <button 
                type="submit" disabled={profileLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 mt-4"
              >
                {profileLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-4 h-4"/> Update Profile</>}
              </button>
            </form>
          </div>

          {/* PASSWORD CHANGE FORM */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500/10 p-2.5 rounded-xl">
                <Lock className="text-amber-500 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <input 
                  type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <input 
                  type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <input 
                  type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none" required
                />
              </div>

              <button 
                type="submit" disabled={passwordLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-3 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 mt-4"
              >
                {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Lock className="w-4 h-4"/> Update Password</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
