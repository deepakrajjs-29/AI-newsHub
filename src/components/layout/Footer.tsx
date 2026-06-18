"use client";

import Link from "next/link";
import { Cpu, Rss, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-card/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
              <div className="p-1 rounded-md bg-foreground text-background">
                <Cpu className="h-4 w-4" />
              </div>
              <span>AI News Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Automatically aggregating and summarizing the latest in AI & technology from trusted sources — updated every hour.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "All News", href: "/news" },
                { label: "Pricing", href: "/pricing" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RSS / Sources */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Data Sources</h3>
            <ul className="space-y-2.5">
              {[
                { label: "OpenAI Blog", href: "https://openai.com/blog" },
                { label: "Google DeepMind", href: "https://deepmind.google/discover/blog/" },
                { label: "Hugging Face Blog", href: "https://huggingface.co/blog" },
                { label: "TechCrunch AI", href: "https://techcrunch.com/category/artificial-intelligence/" },
              ].map((src) => (
                <li key={src.href}>
                  <a
                    href={src.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    {src.label}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition" />
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/news"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              <Rss className="h-3.5 w-3.5" />
              View all aggregated feeds
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <span>© {new Date().getFullYear()} AI News Hub. Built with Gemini AI.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
