"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, CalendarClock, CreditCard, User, Wrench, Menu, Plus, Package, Clock, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
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
}

export default function UserDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get("/booking");
        if (response.data && response.data.data) {
          setBookings(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const activeBookings = bookings.filter(b => b.currentStatus?.toLowerCase() !== 'completed' && b.currentStatus?.toLowerCase() !== 'cancelled');
  const pastBookings = bookings.filter(b => b.currentStatus?.toLowerCase() === 'completed' || b.currentStatus?.toLowerCase() === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-[calc(100vh-80px)] sticky top-20 z-10">
        <div className="p-6 flex flex-col h-full">
          <nav className="flex flex-col gap-2 flex-grow">
            {[
              { name: "Overview", icon: LayoutDashboard, active: true, href: "/dashboard" },
              { name: "My Bookings", icon: CalendarClock, active: false, href: "/dashboard#bookings" },
              { name: "Invoices & Payments", icon: CreditCard, active: false, href: "/dashboard/invoices" },
              { name: "Profile Settings", icon: User, active: false, href: "/dashboard/profile" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-12 bg-primary/5 p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
            <div className="bg-background w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-border relative z-10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-bold text-foreground mb-1 relative z-10">Need a repair?</h4>
            <p className="text-xs text-muted-foreground mb-4 relative z-10">Book our verified professionals today.</p>
            <Link href="/dashboard/book" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 relative z-10">
              <Plus className="h-4 w-4" /> Book Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Welcome, {user?.firstName || 'User'}</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here is the status of your recent repair requests.</p>
          </div>
          <button className="md:hidden p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Active Bookings Section */}
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Active Repairs
            </h2>
            
            {activeBookings.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {activeBookings.map(booking => (
                  <div key={booking._id} className="bg-card border border-primary/20 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                    <div className="absolute top-6 right-6">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(booking.currentStatus)}`}>
                        {booking.currentStatus}
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1 pr-24">{booking.deviceModel}</h3>
                        <p className="text-muted-foreground text-sm font-medium">{booking.deviceType}</p>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-2xl p-4 mb-6 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Tracking ID</p>
                      <p className="font-mono text-foreground font-medium">{booking.trackingId}</p>
                    </div>

                    <Link href={`/track?id=${booking.trackingId}`} className="w-full bg-background border border-border hover:bg-muted hover:border-primary/50 text-foreground py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:text-primary">
                      View Live Status <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-3xl p-10 text-center mb-12">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Repairs</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">You don't have any ongoing service requests. Book a professional today if you need something fixed.</p>
                <Link href="/dashboard/book" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-sm transition-all">
                  <Plus className="w-4 h-4" /> Book a Service
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8" id="bookings">
              {/* Recent History Table */}
              <div className="xl:col-span-2 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground">Past History</h2>
                </div>
                
                {pastBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="pb-4 font-semibold px-2">Device</th>
                          <th className="pb-4 font-semibold px-2">Date</th>
                          <th className="pb-4 font-semibold px-2">Status</th>
                          <th className="pb-4 font-semibold text-right px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastBookings.map(b => (
                          <tr key={b._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                            <td className="py-4 px-2">
                              <p className="font-bold text-foreground">{b.deviceModel}</p>
                              <p className="text-xs text-muted-foreground">{b.deviceType}</p>
                            </td>
                            <td className="py-4 px-2 text-sm text-foreground font-medium">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(b.currentStatus)}`}>
                                {b.currentStatus}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <Link href={`/track?id=${b.trackingId}`} className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Details <ChevronRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    No past bookings found.
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6">Quick Links</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Update Profile', icon: User, href: "/dashboard/profile" },
                    { label: 'View Invoices', icon: CreditCard, href: "/dashboard/invoices" },
                    { label: 'Notifications', icon: CalendarClock, href: "/dashboard/notifications" },
                    { label: 'AI Support Chat', icon: Menu, href: "/dashboard/ai-chat" },
                    { label: 'Contact Live Agent', icon: Menu, href: "/dashboard/chat" },
                  ].map((action, i) => (
                    <Link key={i} href={action.href} className="flex items-center gap-3 p-4 border border-border rounded-2xl text-sm font-medium hover:bg-muted hover:border-primary/50 hover:text-primary transition-all text-foreground w-full text-left group">
                      <div className="bg-background p-2 rounded-xl group-hover:bg-primary/10 transition-colors shadow-sm">
                        <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
