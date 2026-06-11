import Anthropic from "@anthropic-ai/sdk";

// Server-side proxy to the Anthropic API.
// The API key lives only in the ANTHROPIC_API_KEY environment variable on the
// server — it is never exposed to the browser.

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// Hard limits to keep abuse of the public endpoint bounded
const MAX_TOKENS_CAP = 1500;
const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 60_000;
const MAX_SYSTEM_CHARS = 8_000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({
      error: "השרת לא הוגדר עדיין: חסר משתנה סביבה ANTHROPIC_API_KEY",
    });
    return;
  }

  const { system, messages, maxTokens } = req.body || {};

  if (typeof system !== "string" || system.length > MAX_SYSTEM_CHARS) {
    res.status(400).json({ error: "Invalid system prompt" });
    return;
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    res.status(400).json({ error: "Invalid messages" });
    return;
  }

  let totalChars = system.length;
  const apiMessages = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }
    totalChars += m.content.length;
    apiMessages.push({ role: m.role, content: m.content });
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    res.status(400).json({ error: "Conversation too long" });
    return;
  }

  // Simulations open with an assistant message; the API requires the first
  // message to be from the user.
  if (apiMessages[0].role !== "user") {
    apiMessages.unshift({ role: "user", content: "התחל/י את השיחה בהתאם להנחיות." });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: Math.min(Number(maxTokens) || 1000, MAX_TOKENS_CAP),
      system,
      messages: apiMessages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ text });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: "עומס זמני — נסו שוב בעוד רגע" });
    } else if (err instanceof Anthropic.APIError) {
      res.status(502).json({ error: `שגיאת API (${err.status})` });
    } else {
      res.status(500).json({ error: "שגיאה פנימית" });
    }
  }
}
