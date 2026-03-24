"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Users, Calendar, Banknote, Settings, LayoutDashboard, Menu, ShieldCheck, Loader2, Trash2, Search, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

interface SystemUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return router.push("/login");
    if (user?.role !== "admin") {
      toast.error("Unauthorized: Admin access required.");
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        if (response.data?.data) {
          setSystemUsers(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load system users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user, router]);

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === user?._id) {
      toast.error("You cannot delete yourself.");
      return;
    }
    
    if (!confirm(`Are you sure you want to permanently delete user ${name}? This action cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setSystemUsers(prev => prev.filter(u => u._id !== id));
      toast.success(`${name} has been successfully deleted.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  const filteredUsers = systemUsers.filter(u => 
    (u.firstName + " " + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Live Support", href: "/admin/chat", icon: MessageSquare },
  ];

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
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
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
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Platform Users</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage registered clients and ensure platform safety.</p>
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
          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">Registered Accounts</h2>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-medium w-full md:w-64 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-sm text-muted-foreground">
                    <th className="py-5 px-6 font-semibold">User</th>
                    <th className="py-5 px-6 font-semibold">Contact Info</th>
                    <th className="py-5 px-6 font-semibold">Role</th>
                    <th className="py-5 px-6 font-semibold">Joined At</th>
                    <th className="py-5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground capitalize">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{u._id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-foreground">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.phone || 'No phone provided'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${u.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-green-100 text-green-700 border-green-200'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                          disabled={deletingId === u._id || u.role === 'admin'}
                          className="text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} 
                          {deletingId === u._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
