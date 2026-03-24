import Link from "next/link";
import { Wrench, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                WeFix<span className="text-primary">It</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nepal's premier home repair and maintenance service. We connect you with verified professionals for all your needs.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors font-bold text-xs">
                FB
              </a>
              <a href="#" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors font-bold text-xs">
                TW
              </a>
              <a href="#" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors font-bold text-xs">
                IG
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            {["Home", "Our Services", "How it Works", "About Us", "Contact Support"].map((link) => (
              <Link key={link} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block">
                {link}
              </Link>
            ))}
          </div>

          {/* Top Services */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Top Services</h4>
            {["Plumbing", "Electrical", "Appliance Repair", "Carpentry", "Painting"].map((service) => (
              <Link key={service} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block">
                {service}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +977 9800000000
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@wefixit.com.np
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Kathmandu, Nepal
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WeFixIt. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
