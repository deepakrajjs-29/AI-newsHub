import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AudioProvider } from "@/lib/AudioContext";
import FloatingMusicControl from "@/components/audio/FloatingMusicControl";
import ScrollReveal from "@/components/common/ScrollReveal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI News Hub - Automated AI RSS News Aggregator",
  description: "Get the latest, AI-summarized insights and research papers from trusted industry sources, fetched automatically and updated hourly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "AI News Hub - AI RSS News Aggregator",
    description: "Get the latest, AI-summarized insights and research papers from trusted industry sources.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI News Hub - AI RSS News Aggregator",
    description: "Get the latest, AI-summarized insights and research papers from trusted industry sources.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Anti-flicker script for dark/light themes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200`}
      >
        <AudioProvider>
          <ScrollReveal />
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingMusicControl />
        </AudioProvider>
      </body>
    </html>
  );
}


