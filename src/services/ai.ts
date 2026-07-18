import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "placeholder-key";
const baseURL = process.env.GEMINI_API_KEY
  ? "https://generativelanguage.googleapis.com/v1beta/openai/"
  : undefined;

const openai = new OpenAI({
  apiKey,
  baseURL,
});

export const AiProcessedSchema = z.object({
  summaryShort: z.string(),
  summaryLong: z.string(),
  categoryName: z.string(),
  tags: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export type AiProcessedResult = z.infer<typeof AiProcessedSchema>;

/**
 * Generates short/long summaries, categories, tags, and SEO metadata using OpenAI or Gemini.
 */
export async function summarizeArticleWithAI(
  title: string,
  content: string,
  categoriesList: string[]
): Promise<AiProcessedResult | null> {
  const activeKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!activeKey) {
    console.warn("Missing GEMINI_API_KEY or OPENAI_API_KEY. Skipping AI summarization.");
    return null;
  }

  // Pre-process content to avoid sending excessively long texts (cap at ~4000 words/16k characters)
  const trimmedContent = content.slice(0, 16000);

  const systemPrompt = `You are a professional AI news editor and technical summary generator.
Given an article's title and contents, you must analyze and return a JSON object containing:
1. summaryShort: A concise, engaging summary of the article (maximum 40 words, around 2 sentences).
2. summaryLong: A comprehensive, detailed summary of the article outlining key insights, methodology, and significance (minimum 150 words, around 8-10 sentences).
3. categoryName: Choose the most fitting category for this article from this exact list: [${categoriesList.join(", ")}].
4. tags: An array of 3 to 6 highly relevant lowercase tags/keywords.
5. seoTitle: A search-engine optimized title (maximum 60 characters).
6. seoDescription: A search-engine optimized description meta tag (maximum 160 characters).

Return ONLY the JSON object. Do not include markdown code block formatting (like \`\`\`json ... \`\`\`).`;

  const userPrompt = `Title: ${title}\n\nContent:\n${trimmedContent}`;

  try {
    const defaultModel = process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "gpt-4o-mini";
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const contentText = response.choices[0]?.message?.content;
    if (!contentText) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedJson = JSON.parse(contentText);
    const validatedResult = AiProcessedSchema.parse(parsedJson);

    return validatedResult;
  } catch (error: any) {
    console.warn(`Gemini/OpenAI API failed or rate-limited: ${error.message || error}. Using local fallback summarizer.`);
    return generateFallbackSummary(title, content, categoriesList);
  }
}

/**
 * High-quality fallback summarizer using local rule-based text extraction.
 * Keeps the ingestion running successfully even when API key is exhausted.
 */
export function generateFallbackSummary(
  title: string,
  content: string,
  categoriesList: string[]
): AiProcessedResult {
  // 1. Clean HTML tags
  const cleanContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Extract sentences
  const sentences = cleanContent.split(/[.!?]\s+/).filter((s) => s.length > 5);

  const summaryShort = sentences.slice(0, 2).join(". ") + ".";
  const summaryLong = sentences.slice(0, 8).join(". ") + ".";

  // 3. Map category using keyword matching
  let categoryName = categoriesList[0] || "Technology";
  const lowerTitle = title.toLowerCase();
  const lowerContent = cleanContent.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    "Artificial Intelligence": ["artificial intelligence", "openai", "anthropic", "gpt-4", "gpt-5", "sora", "llm", "claude", "gemini", "deepmind", "copilot", "chatgpt", "cohere", "mistral", "llama", "deepseek"],
    "Machine Learning": ["machine learning", "neural network", "transformer", "pytorch", "tensorflow", "training", "weights", "fine-tuning", "inference", "reinforcement learning", "supervised"],
    "Generative AI": ["generative ai", "midjourney", "stable diffusion", "dall-e", "text-to-image", "text-to-video", "diffusion model", "image generation", "video generation"],
    "Cloud Computing": ["cloud", "aws", "amazon web services", "azure", "google cloud", "serverless", "s3", "lambda", "infrastructure", "kubernetes", "docker"],
    "Cybersecurity": ["cybersecurity", "security", "vulnerability", "malware", "ransomware", "exploit", "hack", "breach", "cve", "phishing", "firewall"],
    "Developer Tools": ["developer tools", "git", "github", "npm", "visual studio", "vscode", "coding", "debugging", "database", "postgres", "mongodb", "rust", "typescript", "framework"],
    "Startups": ["startup", "funding", "venture", "acquisition", "funding round", "ipo", "founder", "y combinator", "raised", "accelerator"],
    "Data Science": ["data science", "analytics", "scraping", "pandas", "numpy", "dataframe", "matplotlib", "tableau", "bi", "visualisation"],
    "Technology": ["technology", "consumer electronics", "smartphone", "wired", "gadget", "chips", "hardware"]
  };

  for (const cat of categoriesList) {
    const keywords = categoryKeywords[cat];
    if (keywords) {
      const match = keywords.some((kw) => lowerTitle.includes(kw) || lowerContent.includes(kw));
      if (match) {
        categoryName = cat;
        break;
      }
    }
  }

  // 4. Extract tags
  const titleWords = lowerTitle
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["with", "from", "that", "this", "your", "what", "their", "about", "uses"].includes(w));

  const tags = Array.from(new Set([
    categoryName.toLowerCase(),
    ...titleWords.slice(0, 4)
  ])).slice(0, 5);

  // 5. Generate SEO meta tags
  const seoTitle = `${title.slice(0, 45)} | AI News Hub`;
  const seoDescription = cleanContent.slice(0, 150) + "...";

  return {
    summaryShort: summaryShort.slice(0, 200),
    summaryLong: summaryLong.slice(0, 600),
    categoryName,
    tags,
    seoTitle: seoTitle.slice(0, 60),
    seoDescription: seoDescription.slice(0, 160),
  };
}
