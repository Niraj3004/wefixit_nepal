"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Download, ArrowLeft, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Invoice {
  _id: string;
  booking: any;
  amount: number;
  status: string;
  paymentProofUrl?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoices");
        if (response.data && response.data.data) {
          setInvoices(response.data.data);
        }
      } catch (error: any) {
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [isAuthenticated, router]);

  const handleDownloadPdf = async (bookingId: string) => {
    try {
      const response = await api.get(`/booking/${bookingId}/invoice`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Failed to download invoice PDF.");
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", paymentFile);

      const res = await api.post(`/invoices/${selectedInvoice._id}/upload-payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success(res.data.message || "Payment proof uploaded!");
      setInvoices(prev => prev.map(inv => 
        inv._id === selectedInvoice._id 
          ? { ...inv, status: 'VERIFICATION_REQUIRED', paymentProofUrl: 'pending' } 
          : inv
      ));
      setSelectedInvoice(null);
      setPaymentFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'VERIFICATION_REQUIRED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.push("/dashboard")} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoices & Payments</h1>
            <p className="text-muted-foreground mt-2">Manage your billing and upload payment receipts.</p>
          </div>
          <div className="hidden sm:flex bg-primary/10 p-4 rounded-2xl">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="pb-4 font-semibold px-4">Invoice Details</th>
                      <th className="pb-4 font-semibold px-4">Amount</th>
                      <th className="pb-4 font-semibold px-4">Status</th>
                      <th className="pb-4 font-semibold text-right px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                        <td className="py-5 px-4">
                          <p className="font-bold text-foreground">
                            {invoice.booking?.deviceModel || "Unknown Device"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {invoice.booking?.trackingId || "N/A"} • {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-5 px-4 text-foreground font-bold">
                          Rs. {invoice.amount?.toLocaleString()}
                        </td>
                        <td className="py-5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right flex items-center justify-end gap-3">
                          {invoice.status.toUpperCase() === 'PENDING' && (
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <UploadCloud className="w-3.5 h-3.5" /> Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPdf(invoice.booking?._id)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Invoices Found</h3>
                <p className="text-muted-foreground">You don't have any pending or paid invoices yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Upload Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-foreground mb-2">Upload Payment Proof</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please scan our QR code using eSewa or Khalti and upload the screenshot of your successful transaction.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-xl border border-border mb-6">
              <p className="text-sm font-medium text-foreground flex justify-between">
                <span>Amount Due:</span>
                <span className="font-bold text-primary">Rs. {selectedInvoice.amount?.toLocaleString()}</span>
              </p>
            </div>

            <form onSubmit={handleUploadPayment} className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="payment-upload"
                  required 
                />
                <label htmlFor="payment-upload" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-primary mb-3" />
                  <span className="text-sm font-medium text-foreground">
                    {paymentFile ? paymentFile.name : "Click to select screenshot"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG, JPEG</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setSelectedInvoice(null); setPaymentFile(null); }}
                  className="w-1/3 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || !paymentFile}
                  className="w-2/3 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
