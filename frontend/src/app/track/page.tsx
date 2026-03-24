"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, CheckCircle2, Clock, Wrench, Package, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface TimelineEvent {
  status: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
  notes?: string;
}

interface TrackingData {
  _id: string;
  bookingId: string;
  trackingId: string;
  currentStatus: string;
  timeline: TimelineEvent[];
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [trackingId, setTrackingId] = useState(initialId || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (queryId?: string) => {
    const idToSearch = queryId || trackingId;
    if (!idToSearch.trim()) return;

    setLoading(true);
    setData(null);

    try {
      const response = await api.get(`/tracking/${idToSearch}`);
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        toast.error("Tracking details not found for this ID.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid Tracking ID or server error.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in progress': return <Wrench className="w-6 h-6 text-blue-500" />;
      case 'pending': return <Clock className="w-6 h-6 text-orange-400" />;
      default: return <Package className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 px-4 md:px-8 pb-24">
      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Track Your Repair</h1>
        <p className="text-lg text-muted-foreground">Enter your unique tracking ID below to see the latest status of your service request.</p>
      </div>

      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-2 shadow-sm flex items-center mb-12">
        <div className="pl-4 text-muted-foreground">
          <Search className="w-6 h-6" />
        </div>
        <input 
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="e.g. TRK-ABC123XYZ"
          className="flex-1 bg-transparent px-4 py-4 focus:outline-none text-foreground text-lg font-mono placeholder:font-sans uppercase"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={() => handleSearch()}
          disabled={loading || !trackingId.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
        </button>
      </div>

      {data && (
        <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-muted px-8 py-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tracking ID</p>
              <p className="text-2xl font-mono font-bold text-foreground">{data.trackingId}</p>
            </div>
            <div className="px-5 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold inline-flex items-center gap-2 w-fit">
              {getStatusIcon(data.currentStatus)} {data.currentStatus}
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-foreground mb-8">Timeline History</h3>
            
            <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-10">
              {data.timeline.map((event, index) => (
                <div key={index} className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[27px] bg-card p-1 rounded-full border-2 border-border">
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h4 className="text-lg font-bold text-foreground">{event.status}</h4>
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(event.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground">{event.description}</p>
                  {event.notes && (
                    <div className="mt-3 bg-muted/50 border border-border p-4 rounded-xl text-sm italic text-muted-foreground flex gap-3">
                      <Send className="w-4 h-4 mt-0.5 text-primary" />
                      <div>
                        <span className="font-semibold text-foreground not-italic block mb-1">Tech Update:</span>
                        "{event.notes}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <TrackContent />
    </Suspense>
  );
}
