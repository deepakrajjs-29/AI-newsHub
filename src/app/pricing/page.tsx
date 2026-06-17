"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Check, Cpu, Sparkles, CreditCard, Lock, ShieldCheck, CheckCircle } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.access_token);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeClick = () => {
    if (!session) {
      router.push("/auth?redirect=/pricing");
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError(null);

    // Simple validation mocks
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setCheckoutError("Invalid card number. Must be 16 digits.");
      setCheckoutLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "upgrade" })
      });

      if (!res.ok) {
        throw new Error("Billing sync failure.");
      }

      setCheckoutSuccess(true);
      setTimeout(() => {
        setShowCheckout(false);
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setCheckoutError(err.message || "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const features = [
    { name: "Live RSS Feed Aggregation", free: true, pro: true },
    { name: "Executive AI Summaries (~100 words)", free: true, pro: true },
    { name: "Interactive Bookmarks Portal", free: true, pro: true },
    { name: "In-Depth Detailed Analysis (~300 words)", free: false, pro: true },
    { name: "Interactive AI Article Chat Assistant", free: false, pro: true },
    { name: "AI Narrator Player (Web Text-to-Speech)", free: false, pro: true },
    { name: "Custom Private RSS Source Feeds", free: false, pro: true },
    { name: "One-Click Export to Notion & PDF", free: false, pro: true }
  ];

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 relative min-h-[85vh] bg-background">
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none opacity-25 select-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]"></div>
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10 reveal-on-scroll">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border bg-card/60 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
          <span>Flexible Plans for AI Professionals</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Supercharge Your <span className="bg-gradient-to-r from-neutral-950 to-neutral-600 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Upgrade to unlock deep research summaries, custom feeds tracking, narration audio, and interactive chat.
        </p>
      </div>

      {/* Plans comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
        {/* FREE PLAN */}
        <div className="p-8 rounded-2xl border border-border bg-card/45 hover-card-bounce backdrop-blur-sm flex flex-col justify-between transition shadow-lg reveal-on-scroll">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold tracking-tight">Free Aggregator</h3>
              <p className="text-xs text-muted-foreground">Keep track of basic AI feeds & bookmarks.</p>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-xs text-muted-foreground ml-1">/ month</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-border/60">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start text-xs sm:text-sm gap-2">
                  {feat.free ? (
                    <Check className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feat.free ? "text-foreground" : "text-muted-foreground line-through decoration-border"}>
                    {feat.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            disabled={true}
            className="w-full mt-8 py-3 rounded-xl border border-border bg-muted/20 font-semibold text-xs text-muted-foreground cursor-not-allowed"
          >
            {profile?.tier === "pro" ? "Free Tier" : "Default Plan"}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="p-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] dark:bg-indigo-950/[0.02] hover-card-bounce backdrop-blur-sm flex flex-col justify-between relative shadow-xl ring-1 ring-indigo-500/20 reveal-on-scroll">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-foreground text-background text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> RECOMMENDED
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold tracking-tight">Hub Pro</h3>
              <p className="text-xs text-muted-foreground">For researchers, developers, and AI investors.</p>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-extrabold">$9.99</span>
              <span className="text-xs text-muted-foreground ml-1">/ month</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-indigo-500/10">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start text-xs sm:text-sm gap-2">
                  <Check className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-foreground">{feat.name}</span>
                </li>
              ))}
            </ul>
          </div>


          <button
            onClick={handleSubscribeClick}
            disabled={loading || profile?.tier === "pro"}
            className="w-full mt-8 py-3 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Loading..." : profile?.tier === "pro" ? "Already Subscribed" : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      {/* MOCK CHECKOUT MODAL OVERLAY */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-4 animate-scale-in relative">
            
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>

            {checkoutSuccess ? (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Upgrade Complete!</h3>
                  <p className="text-xs text-muted-foreground">Welcome to AI News Hub Pro.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center gap-1.5 border-b border-border pb-3">
                  <CreditCard className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-extrabold text-base">Secure Stripe Checkout</h3>
                </div>

                <div className="text-xs text-muted-foreground p-3 rounded-lg border border-indigo-500/10 bg-indigo-500/5 flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <span>This is a mock sandbox environment. Use any dummy credentials.</span>
                </div>

                {checkoutError && (
                  <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold">
                    {checkoutError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      // Simple formatter for card separation spaces
                      const val = e.target.value.replace(/\s?/g, "");
                      if (/^\d*$/.test(val)) {
                        const parts = val.match(/.{1,4}/g);
                        setCardNumber(parts ? parts.join(" ") : "");
                      }
                    }}
                    placeholder="4000 1234 5678 9010"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expiration Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 4) {
                          setCardExpiry(val.length >= 3 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
                        }
                      }}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CVC / CVV</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={cardCVC}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCardCVC(val);
                      }}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="px-6 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90 transition"
                  >
                    {checkoutLoading ? "Authorizing..." : "Pay $9.99"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
