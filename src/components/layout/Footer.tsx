"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Cpu } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card/40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-lg">
              <div className="p-1 rounded-md bg-foreground text-background">
                <Cpu className="h-4 w-4" />
              </div>
              <span>AI News Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Automatically aggregating, summarizing, and translating the latest breakthroughs in Artificial Intelligence from trusted RSS feeds using advanced AI models.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  All News
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get weekly summaries of key AI developments directly in your inbox.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20 text-center animate-fade-in">
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2 text-sm text-foreground bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-foreground transition-all duration-200"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} AI News Hub. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
