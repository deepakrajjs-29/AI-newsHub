import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
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
1. summaryShort: A concise, engaging summary of the article (maximum 100 words).
2. summaryLong: A detailed summary of the article outlining key insights, methodology, and significance (maximum 300 words).
3. categoryName: Choose the most fitting category for this article from this exact list: [${categoriesList.join(", ")}].
4. tags: An array of 3 to 6 highly relevant lowercase tags/keywords.
5. seoTitle: A search-engine optimized title (maximum 60 characters).
6. seoDescription: A search-engine optimized description meta tag (maximum 160 characters).

Return ONLY the JSON object. Do not include markdown code block formatting (like \`\`\`json ... \`\`\`).`;

  const userPrompt = `Title: ${title}\n\nContent:\n${trimmedContent}`;

  try {
    const defaultModel = process.env.GEMINI_API_KEY ? "gemini-1.5-flash" : "gpt-4o-mini";
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
  } catch (error) {
    console.error("Error during OpenAI article summarization:", error);
    return null;
  }
}
