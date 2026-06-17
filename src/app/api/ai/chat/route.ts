import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
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
      return NextResponse.json({ error: "AI services are temporarily unavailable (missing API keys)" }, { status: 503 });
    }

    const { articleId, message, history = [] } = await request.json();
    if (!articleId || !message) {
      return NextResponse.json({ error: "Missing articleId or message" }, { status: 400 });
    }

    // Fetch the article content to use as context
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const systemPrompt = `You are a helpful AI reading assistant for AI News Hub. You assist users in understanding technical articles, research papers, and news logs.
Below is the full text of the article the user is currently reading:

Title: ${article.title}
Publisher: ${article.sourceName}
Content:
${article.content.slice(0, 16000)}

Answer the user's questions about this article accurately and professionally, using the provided text as the primary source of context. Be concise and keep formatting clear.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const defaultModel = process.env.GEMINI_API_KEY ? "gemini-1.5-flash" : "gpt-4o-mini";
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || defaultModel,
      messages: formattedMessages as any,
      temperature: 0.4,
    });

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI article chat error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
