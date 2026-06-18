"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  BrainCircuit,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface InteractiveArticlePortalProps {
  article: {
    id: string;
    title: string;
    summary: string | null;
    summaryLong: string | null;
    content: string;
    sourceName: string;
    tags: Array<{ tag: { name: string } }>;
  };
}

export default function InteractiveArticlePortal({ article }: InteractiveArticlePortalProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Exporters States
  const [copied, setCopied] = useState(false);

  // Audio TTS States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [audioProgress, setAudioProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Chat States
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfileAndBookmarkState(session.access_token);
      } else {
        setLoading(false);
      }
    });

    return () => {
      // Clean up speech synthesis on unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  const fetchProfileAndBookmarkState = async (token: string) => {
    try {
      // Fetch Profile
      const profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.profile) {
        setProfile(profileData.profile);
      }

      // Fetch Bookmarks to check bookmark state
      const bookmarksRes = await fetch("/api/user/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookmarksData = await bookmarksRes.json();
      if (bookmarksRes.ok && bookmarksData.bookmarks) {
        const found = bookmarksData.bookmarks.some((b: any) => b.articleId === article.id);
        setIsBookmarked(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bookmark toggler
  const toggleBookmark = async () => {
    if (!session) {
      router.push(`/auth?redirect=/news/${article.id}`);
      return;
    }

    try {
      const method = isBookmarked ? "DELETE" : "POST";
      const url = isBookmarked
        ? `/api/user/bookmarks?articleId=${article.id}`
        : "/api/user/bookmarks";
      
      const headers: any = {
        Authorization: `Bearer ${session.access_token}`
      };
      
      let body = undefined;
      if (method === "POST") {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ articleId: article.id });
      }

      const res = await fetch(url, { method, headers, body });
      if (res.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  // Text-To-Speech (TTS)
  const handleTTS = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    const textToRead = `${article.title}. Summary: ${article.summary}. Detailed analysis: ${article.summaryLong}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;
    
    utterance.rate = ttsSpeed;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setAudioProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Calculate progress (mocked character indexes reading tracker)
    utterance.onboundary = (event) => {
      if (event.charIndex) {
        const pct = Math.round((event.charIndex / textToRead.length) * 100);
        setAudioProgress(pct);
      }
    };

    window.speechSynthesis.cancel(); // cancel any active speech
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setAudioProgress(0);
  };

  const handleStopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setAudioProgress(0);
    }
  };

  useEffect(() => {
    // Adjust speed on the fly if playing
    if (isPlaying && utteranceRef.current && window.speechSynthesis) {
      const progress = audioProgress;
      handleStopTTS();
      // Resume from estimated progress character index
      const textToRead = `${article.title}. Summary: ${article.summary}. Detailed analysis: ${article.summaryLong}`;
      const charIndex = Math.floor((progress / 100) * textToRead.length);
      const remainingText = textToRead.slice(charIndex);
      
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utteranceRef.current = utterance;
      utterance.rate = ttsSpeed;
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setAudioProgress(100);
      };
      utterance.onboundary = (event) => {
        if (event.charIndex) {
          const totalChar = charIndex + event.charIndex;
          const pct = Math.round((totalChar / textToRead.length) * 100);
          setAudioProgress(pct);
        }
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [ttsSpeed]);

  // Exporters
  const copyToNotionFormat = () => {
    const tagsStr = article.tags.map(t => `#${t.tag.name}`).join(" ");
    const markdown = `# ${article.title}
*Source: ${article.sourceName}*
*Tags: ${tagsStr}*

## Executive Summary
> ${article.summary}

## Detailed In-Depth Analysis
${article.summaryLong || "No long summary available."}

---
*Generated via AI News Hub Premium*`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    window.print();
  };

  // AI Chat Terminal
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = chatMessage.trim();
    setChatMessage("");
    setChatHistory([...chatHistory, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          message: userMsg,
          history: chatHistory
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to query AI assistant");

      setChatHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: `System Error: ${err.message || "Could not reach assistant. Please try again."}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const isPro = !!session;

  return (
    <div className="space-y-10 w-full">
      {/* Top action row: Bookmarks, Audio, Export Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border">
        {/* Bookmarking */}
        <button
          onClick={toggleBookmark}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-xs font-bold transition shadow-sm"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500/25" />
              <span>Bookmarked</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4.5 w-4.5 text-muted-foreground" />
              <span>Bookmark Summary</span>
            </>
          )}
        </button>

        {/* Gated Pro Exporters */}
        <div className="flex items-center gap-3">
          {isPro ? (
            <>
              <button
                onClick={copyToNotionFormat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                <span>{copied ? "Copied!" : "Notion Markdown"}</span>
              </button>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>PDF Print</span>
              </button>
            </>
          ) : (
            /* Locked exporter tools */
            <div className="relative group">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border bg-muted/20 select-none">
                <Lock className="h-3.5 w-3.5" />
                <span>Export Tools</span>
              </div>
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 rounded-lg border border-border bg-card text-[10px] text-muted-foreground text-center shadow-lg font-semibold z-20">
                Unlock Notion & PDF export by upgrading to <Link href="/pricing" className="text-indigo-500 hover:underline">Pro Plan</Link>.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Playback Narration Player (Pro gated) */}
      <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        {!isPro && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-card/90 backdrop-blur-sm text-center space-y-3">
            <Lock className="h-5 w-5 text-indigo-500" />
            <h4 className="font-bold text-sm">AI Voice Narration Locked</h4>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              Listen to summaries narrated using premium text-to-speech engine. Available on Pro tier.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90"
            >
              Upgrade to Unlock
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-foreground">
              <Volume2 className="h-4.5 w-4.5 text-indigo-500" /> AI Audiobook Reader
            </h4>
            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              Web Speech Player
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTTS}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-95 transition"
              >
                {isPlaying && !isPaused ? <Pause className="h-4.5 w-4.5 fill-background" /> : <Play className="h-4.5 w-4.5 fill-background pl-0.5" />}
              </button>
              <button
                onClick={handleStopTTS}
                disabled={!isPlaying}
                className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition disabled:opacity-40"
              >
                <VolumeX className="h-4.5 w-4.5 text-foreground" />
              </button>
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-2 w-full sm:w-max">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Speed:</span>
              <select
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold focus:outline-none"
              >
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>

            {/* Progress bar */}
            <div className="flex-1 w-full space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                <span>PROGRESS</span>
                <span>{audioProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${audioProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gated Detailed Analysis Summary */}
      {isPro ? (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg sm:text-xl">In-Depth Analysis</h3>
          </div>
          <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-4">
            {article.summaryLong ? (
              article.summaryLong.split("\n").map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))
            ) : (
              <p>Full detailed summary will be processed shortly by the background ingestion workers.</p>
            )}
          </div>
        </div>
      ) : (
        /* Lock State overlay */
        <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/10 text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-sm">Detailed Analysis Locked</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Upgrade to a premium membership to access the full 300-word deep research analysis and insights summaries.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-block px-5 py-2.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90 shadow-md"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Interactive AI Chat Terminal */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm flex flex-col h-[400px] shadow-sm relative">
        <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
            <h4 className="font-extrabold text-sm text-foreground">Interactive Research Assistant</h4>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Powered by Gemini
          </span>
        </div>

        {/* Message logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 space-y-2">
              <BrainCircuit className="h-10 w-10 text-muted-foreground/35 animate-pulse" />
              <div className="space-y-1 max-w-xs">
                <p className="font-bold text-foreground">Ask questions about this article</p>
                <p className="text-xs">
                  "What are the core technical achievements?", "Summarize the limits mentioned", or "Explain the research methodology".
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${
                    chat.role === "user"
                      ? "bg-foreground text-background font-semibold"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {chat.content}
                </div>
              </div>
            ))
          )}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-2.5 text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                <span>Assistant is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input box */}
        <form onSubmit={sendChatMessage} className="p-3 border-t border-border bg-card/60 flex items-center gap-2">
          <input
            type="text"
            required
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask a question about this article..."
            className="flex-grow px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatMessage.trim()}
            className="p-2 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
