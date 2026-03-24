import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 lg:py-36 overflow-hidden">
        {/* Background gradient elements */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/50 rounded-full blur-3xl z-0" />
        
        <div className="container mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Serving whole Nepal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6 leading-tight">
            Expert Repairs, Right at Your <span className="text-primary relative inline-block">Doorstep.<span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 rounded-sm"></span></span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            The easiest way to book trusted, background-checked professionals for all your home and appliance repair needs. 100% satisfaction guaranteed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
            <Link href="/book" className="flex-1 flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-medium shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              Book a Service <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="flex-1 flex justify-center items-center gap-2 bg-card hover:bg-muted text-foreground border border-border px-8 py-4 rounded-full text-lg font-medium shadow-sm transition-all hover:bg-secondary">
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Verified Experts</h3>
              <p className="text-muted-foreground">Every technician goes through a strict background check and skill verification process.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">On-Time Service</h3>
              <p className="text-muted-foreground">We value your time. Our professionals arrive exactly at the scheduled time bracket.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-6 shadow-inner">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Quality Guarantee</h3>
              <p className="text-muted-foreground">We offer up to 30 days of warranty on parts and labor for all completed repairs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Highlight */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Services</h2>
            <p className="text-muted-foreground">Choose from our wide range of professional repair and maintanance services.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["AC Repair", "Plumbing", "Electrical", "Carpentry"].map((service, i) => (
              <div key={i} className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-foreground">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{service}</h3>
                <p className="text-sm text-muted-foreground mb-4">Professional {service.toLowerCase()} services at affordable rates.</p>
                <span className="text-primary font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
