import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeFixIt - Nepal's Premier Repair Service",
  description: "Book professional repair services for your electronics, appliances, and home. Expert technicians at your toorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
        <Navbar />
        <main className="flex-1 flex flex-col pt-20">
          {children}
        </main>
        <Footer />
        <ChatbotWidget />
        <LiveChatWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
