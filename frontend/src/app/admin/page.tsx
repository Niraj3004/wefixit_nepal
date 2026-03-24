"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Calendar, Banknote, Settings, LayoutDashboard, Wrench, Menu, Search, Edit, CheckCircle2, ChevronDown, Package, ShieldCheck, Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Booking {
  _id: string;
  deviceType: string;
  deviceModel: string;
  currentStatus: string;
  trackingId: string;
  createdAt: string;
  user: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return router.push("/login");
    if (user?.role !== "admin") {
      toast.error("Unauthorized: Admin access required.");
      router.push("/dashboard");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const response = await api.get("/admin/bookings");
        if (response.data?.data) {
          setBookings(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, user, router]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setUpdating(true);
    try {
      await api.put(`/admin/tracking/${selectedBooking.trackingId}`, {
        status: newStatus,
        notes: updateNotes
      });
      
      toast.success("Tracking timeline updated successfully!");
      
      // Update local state perfectly
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, currentStatus: newStatus } : b));
      setSelectedBooking(null);
      setUpdateNotes("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update tracking timeline");
    } finally {
      setUpdating(false);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen fixed z-20 shadow-sm">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              WeFix<span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>
        
        <div className="p-6">
          <nav className="flex flex-col gap-2">
            {[
              { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
              { name: "Users", href: "/admin/users", icon: Users },
              { name: "Live Support", href: "/admin/chat", icon: MessageSquare },
            ].map((item) => {
              const isActive = item.name === "Dashboard";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 sm:p-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">System Administration</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage platform bookings, users, and oversee operations.</p>
          </div>
          <button className="md:hidden p-2 rounded-xl bg-card border border-border">
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Total Bookings", value: bookings.length.toString(), increase: "+12%" },
                { label: "Pending Requests", value: bookings.filter(b => b.currentStatus?.toLowerCase() === 'pending').length.toString(), increase: "+5%" },
                { label: "Repairs Completed", value: bookings.filter(b => b.currentStatus?.toLowerCase() === 'completed').length.toString(), increase: "-2%" },
                { label: "System Revenue", value: "Rs. 240K", increase: "+18%" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-primary/30 transition-colors">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{stat.label}</p>
                  <h3 className="text-4xl font-extrabold text-foreground mb-3">{stat.value}</h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-sm font-semibold border border-border">
                    <span className={`${stat.increase.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.increase}
                    </span>
                    <span className="text-muted-foreground font-medium text-xs">from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings Table Wrapper */}
            <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Global Bookings Pool</h2>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search tracking ID..." 
                      className="pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-medium w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-sm text-muted-foreground">
                      <th className="py-5 px-6 font-semibold">Tracking ID</th>
                      <th className="py-5 px-6 font-semibold">Device</th>
                      <th className="py-5 px-6 font-semibold">Date Received</th>
                      <th className="py-5 px-6 font-semibold">Current Status</th>
                      <th className="py-5 px-6 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? bookings.map((b) => (
                      <tr key={b._id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                        <td className="py-4 px-6 font-mono text-sm font-bold">{b.trackingId}</td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{b.deviceModel}</p>
                          <p className="text-xs text-muted-foreground">{b.deviceType}</p>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-foreground">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(b.currentStatus)}`}>
                            {b.currentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.currentStatus?.toLowerCase() === 'completed' && (
                              <button 
                                onClick={async () => {
                                  try {
                                    const toastId = toast.loading("Generating Invoice...");
                                    await api.post("/admin/invoice", { bookingId: b._id });
                                    toast.success("Invoice generated successfully!", { id: toastId });
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.message || "Failed to generate invoice", { id: 'toastId' });
                                  }
                                }}
                                className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                              >
                                <Banknote className="w-4 h-4" /> Invoice
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedBooking(b);
                                setNewStatus(b.currentStatus);
                              }}
                              className="text-sm font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No bookings found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Update Status Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-xl font-bold text-foreground">Update Timeline Option</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-6">
              <div className="bg-background border border-border p-4 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Target Booking</p>
                <p className="font-mono font-bold text-foreground truncate">{selectedBooking.trackingId}</p>
                <p className="text-sm text-foreground mt-1">{selectedBooking.deviceModel}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">New Status State</label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary appearance-none font-medium"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Technician Notes (Optional)</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Screen replaced, successfully tested..."
                  className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/60"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedBooking(null)}
                  className="w-1/3 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-2/3 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Push Update to Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
