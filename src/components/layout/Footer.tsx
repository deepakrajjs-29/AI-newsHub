"use client";

import Link from "next/link";
import { Rss, ExternalLink, Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) return null;

  return (
    <footer className="relative border-t border-border/50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-indigo-500/[0.04] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <img
                src="/logo.png"
                alt="AI News Hub"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Automatically aggregating and summarizing the latest breakthroughs in AI &amp; technology from the world's most trusted sources — refreshed hourly, zero noise.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Github, href: "#", label: "GitHub" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg border border-border bg-card hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 text-muted-foreground transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">Navigate</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "All News", href: "/news" },
                { label: "Pricing", href: "/pricing" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RSS Sources */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">Data Sources</h3>
            <ul className="space-y-3">
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
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              <Rss className="h-3.5 w-3.5" />
              View all aggregated feeds
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">AI News Hub</span>.
            Built with Gemini AI.
          </span>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="hover:text-foreground transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
