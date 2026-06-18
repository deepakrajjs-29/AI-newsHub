'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Sparkles, MessageSquare, ArrowRight, CornerDownLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function JarvisAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isArticlePage, setIsArticlePage] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  // Check if viewing an article
  useEffect(() => {
    setIsArticlePage(pathname?.startsWith('/news/') && pathname !== '/news');
  }, [pathname]);

  // Welcome message when history is empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          role: 'assistant',
          content: "Hello! I am **JARVIS**, your AI News Hub platform assistant. ⚡\n\nI can help you:\n* **Discover** the latest AI articles and publications.\n* **Navigate** search, bookmarks, or the music lounge.\n* **Explain** or **summarize** tech topics and articles you read.\n\nWhat would you like to explore today?"
        }
      ]);
    }
  }, [chatHistory]);

  // Handle starter prompt selections
  const handleStarterPrompt = (promptText: string) => {
    setMessage('');
    sendMessage(promptText);
  };

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    // Append user message
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(updatedHistory);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedHistory.slice(1).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            content: h.content
          })),
          currentUrl: window.location.href
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reply');
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error('JARVIS Chat error:', err);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: `I'm having trouble connecting right now. Please try again in a moment, or browse the [News Archive](/news) directly while I recover.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Simple parser for bold (**text**), bullet points (* point), and inline links ([text](/path))
    let html = text;
    
    // Bold tags
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points
    html = html.split('\n').map(line => {
      if (line.trim().startsWith('* ')) {
        return `<li class="ml-4 list-disc my-1">${line.trim().substring(2)}</li>`;
      }
      return line;
    }).join('\n');

    // Paragraph breaks
    html = html.split('\n\n').map(para => {
      if (para.trim().startsWith('<li')) {
        return `<ul class="my-1.5">${para}</ul>`;
      }
      return `<p class="mb-2 leading-relaxed">${para}</p>`;
    }).join('');

    // Handle markdown links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-400 font-bold hover:underline">$1</a>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Hide on auth pages or if not logged in
  if (pathname?.startsWith('/auth') || !session) {
    return null;
  }

  return (
    <>
      {/* Floating JARVIS Toggle Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-zinc-950/90 text-indigo-400 backdrop-blur-xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ${
          isOpen ? 'ring-2 ring-indigo-500/50 text-indigo-300' : ''
        }`}
        title="Ask JARVIS Assistant"
      >
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur animate-pulse" />
        {isOpen ? <X className="h-5 w-5 relative" /> : <Bot className="h-5.5 w-5.5 relative" />}
      </button>

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="absolute -inset-0.5 rounded-full bg-emerald-500 opacity-50 blur animate-ping" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">JARVIS Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/10 bg-indigo-500/5 text-indigo-400">Gemini</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Logs Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 rounded-tl-none'
                }`}>
                  {formatMarkdown(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 select-none font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips Selector */}
          <div className="px-4 py-2 border-t border-zinc-800/30 bg-zinc-950/50 flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto shrink-0 select-none">
            {isArticlePage ? (
              <>
                <button
                  onClick={() => handleStarterPrompt('Summarize this article')}
                  className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-yellow-500" /> Summarize this article
                </button>
                <button
                  onClick={() => handleStarterPrompt('Why does this news matter?')}
                  className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3 text-indigo-400" /> Why does this news matter?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleStarterPrompt("What are today's top AI stories?")}
                  className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                >
                  🔥 Top AI stories
                </button>
                <button
                  onClick={() => handleStarterPrompt('How do I search for AI news?')}
                  className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                >
                  🔍 How do I search?
                </button>
                <button
                  onClick={() => handleStarterPrompt('Explain the background music experience')}
                  className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                >
                  🎵 Background music
                </button>
              </>
            )}
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(message);
              }}
              className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950 px-3 py-1.5 focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask JARVIS about AI news..."
                className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none py-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 active:scale-95 transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
