import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "placeholder-key";
const baseURL = process.env.GEMINI_API_KEY
  ? "https://generativelanguage.googleapis.com/v1beta/openai/"
  : undefined;

const openai = new OpenAI({
  apiKey,
  baseURL,
});

export async function POST(request: Request) {
  try {
    const activeKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!activeKey) {
      return NextResponse.json(
        { error: "JARVIS AI services are temporarily unavailable (missing API keys)" },
        { status: 503 }
      );
    }

    const { message, history = [], currentUrl = "", currentArticleId = null } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Missing user message" }, { status: 400 });
    }

    // 1. Fetch categories and active sources
    const [categories, sources] = await Promise.all([
      prisma.category.findMany({ select: { name: true, slug: true } }),
      prisma.source.findMany({ where: { active: true }, select: { name: true } })
    ]);

    // 2. Fetch current article if user is reading one
    let currentArticle = null;
    if (currentArticleId) {
      currentArticle = await prisma.article.findUnique({
        where: { id: currentArticleId },
        select: { title: true, sourceName: true, summary: true, content: true }
      });
    } else if (currentUrl && currentUrl.includes("/news/")) {
      const parts = currentUrl.split("/news/");
      const slug = parts[parts.length - 1]?.split(/[?#]/)[0];
      if (slug && slug !== "" && slug !== "page") {
        currentArticle = await prisma.article.findUnique({
          where: { slug },
          select: { title: true, sourceName: true, summary: true, content: true }
        });
      }
    }

    // 3. Smart dynamic database search based on message context
    let articlesList: any[] = [];
    const searchTriggerWords = ["story", "stories", "news", "article", "find", "about", "search", "latest", "happen", "recent"];
    const hasSearchIntent = searchTriggerWords.some(word => message.toLowerCase().includes(word));

    if (hasSearchIntent) {
      // Clean query text
      const cleanMsg = message.toLowerCase().replace(/jarvis|please|find|search|news|articles?|stories?|about|latest|on|for|show|me/g, "").trim();
      const keywords = cleanMsg.split(/\s+/).filter((w: string) => w.length > 2);
      
      if (keywords.length > 0) {
        articlesList = await prisma.article.findMany({
          where: {
            status: { not: "failed" },
            OR: keywords.map((kw: string) => ({
              OR: [
                { title: { contains: kw, mode: "insensitive" } },
                { summary: { contains: kw, mode: "insensitive" } }
              ]
            }))
          },
          orderBy: { publishedAt: "desc" },
          take: 5,
          select: { title: true, slug: true, sourceName: true }
        });
      }
    }

    // Fallback if search has no intent or no results: get latest 5 articles
    if (articlesList.length === 0) {
      articlesList = await prisma.article.findMany({
        where: { status: { not: "failed" } },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, sourceName: true }
      });
    }

    // 4. System prompt instructing JARVIS
    const systemPrompt = `You are JARVIS, a helpful, intelligent, friendly, professional, and concise AI assistant for AI News Hub.
Your goals:
1. Website Guide: Help users understand how to search for news, create bookmarks, upgrade tiers, or import feeds.
2. News Discovery Assistant: Recommend articles, sources, or categories based on user requests.
3. Platform Navigation Assistant: Guide users around dashboard, vault, custom feeds, music lounge.
4. AI & Tech News Helper: Explain concepts, summarize news, or explain why news matters.

PLATFORM INFORMATION:
- We aggregate RSS feeds from OpenAI, Anthropic, Google, Hugging Face, TechCrunch, The Verge, and arXiv.
- We have 9 categories: AI (artificial-intelligence), ML (machine-learning), GenAI (generative-ai), Cloud (cloud-computing), Security (cybersecurity), DevTools (developer-tools), Startups, DataSci (data-science), Tech (technology).
- Pro features include: Detailed 300-word summaries, Custom Private RSS Feeds monitoring, AI Audiobook Voice Reader, Interactive AI Research Assistant chat.
- Background Music: Controlled via "Music Lounge" in the User Dashboard or the floating player at the bottom-right of the page.

CONTEXTUAL INFORMATION:
- Current Page URL: ${currentUrl || "Unknown"}
${currentArticle ? `\n- Current Article:\n  Title: ${currentArticle.title}\n  Source: ${currentArticle.sourceName}\n  Summary: ${currentArticle.summary}\n  Content Preview: ${currentArticle.content.slice(0, 2500)}` : ""}
- Available Categories: ${categories.map(c => c.name).join(", ")}
- Active Sources: ${sources.map(s => s.name).join(", ")}
- Relevant / Latest Database Articles:
${articlesList.map(a => `- [${a.title}](/news/${a.slug}) (Source: ${a.sourceName})`).join("\n")}

INSTRUCTIONS:
- Prioritize platform content (categories, sources, and the articles listed above) before generic AI responses.
- Be concise, helpful, and friendly. Avoid lengthy robotic responses. Keep answers brief (typically 2-4 sentences unless explaining).
- When referencing articles, ALWAYS use markdown links in the format [Title](/news/slug) so the user can easily click and navigate directly to the article page on AI News Hub.
- If the user asks about platform features (like billing, bookmarks, custom feeds, background music), guide them to the appropriate pages (/pricing, /dashboard, etc.).
- Keep responses short, clear, and direct.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const defaultModel = process.env.GEMINI_API_KEY ? "gemini-1.5-flash" : "gpt-4o-mini";
    
    // Call AI completions API with exponential retry logic on rate limits (429)
    let response = null;
    let retries = 3;
    let backoffDelay = 1500;
    
    while (retries > 0) {
      try {
        response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || defaultModel,
          messages: formattedMessages as any,
          temperature: 0.45,
          max_tokens: 600,
        });
        break;
      } catch (err: any) {
        if (err.status === 429 && retries > 1) {
          console.warn(`Gemini rate limit 429 hit. Retrying in ${backoffDelay}ms... (${retries - 1} retries remaining)`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          retries--;
          backoffDelay *= 2;
        } else {
          console.error("Non-retryable completions error:", err);
          break;
        }
      }
    }

    if (!response) {
      // Local fallback responses for offline support or key rate limits
      let fallbackReply = "I am currently experiencing higher request rates than usual. Here is some general information:\n\n* To search news, use the Search bar in the **[News Archive](/news)** page.\n* You can change background music in the **[Music Lounge](/dashboard)** tab.\n* For the latest updates, please try again in a few seconds!";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("music") || lowerMsg.includes("song") || lowerMsg.includes("play")) {
        fallbackReply = "You can manage ambient background tracks in the **[Music Lounge](/dashboard)** in your dashboard, or use the floating control badge at the bottom-right corner.";
      } else if (lowerMsg.includes("search") || lowerMsg.includes("find")) {
        fallbackReply = "To look up specific topics, navigate to the **[News Archive](/news)** page and enter keywords in the search bar.";
      } else if (lowerMsg.includes("pricing") || lowerMsg.includes("pro") || lowerMsg.includes("upgrade")) {
        fallbackReply = "Upgrade options can be simulated in the **[Pricing & Plans](/pricing)** page to unlock detailed summaries, custom RSS monitoring, and speech narration.";
      } else if (lowerMsg.includes("name") || lowerMsg.includes("who are you")) {
        fallbackReply = "My name is **JARVIS**, your AI assistant here at AI News Hub! ⚡ How can I help you navigate the site?";
      } else if (lowerMsg.includes("date") || lowerMsg.includes("today")) {
        fallbackReply = `Today's date is **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`;
      }
      
      return NextResponse.json({ reply: fallbackReply });
    }

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("JARVIS chat error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
