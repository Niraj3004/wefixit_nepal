"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                WeFix<span className="text-primary">It</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Services", "How it Works", "About Us", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTA & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/book"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Book Service
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border absolute w-full left-0 top-20 flex flex-col px-4 py-6 gap-4 shadow-xl">
          {["Services", "How it Works", "About Us", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-base font-medium text-foreground p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <Link
            href="/login"
            className="text-base font-medium text-foreground p-2 rounded-md hover:bg-muted"
            onClick={() => setMobileMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/book"
            className="w-full bg-primary text-primary-foreground text-center p-3 rounded-full font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Book Service
          </Link>
        </div>
      )}
    </header>
  );
}
