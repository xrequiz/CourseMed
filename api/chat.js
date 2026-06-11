import Anthropic from "@anthropic-ai/sdk";
import { resolvePrompt } from "./_prompts.js";

// Server-side proxy to the Anthropic API.
// - The API key lives only in the ANTHROPIC_API_KEY environment variable.
// - The client sends a promptId, never a system prompt — all prompts are
//   resolved server-side (api/_prompts.js), so the endpoint can't be abused
//   as a general-purpose Claude proxy.
// - Responses are streamed as plain text.

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// Hard limits to keep abuse of the public endpoint bounded
const MAX_TOKENS_CAP = 1500;
const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 60_000;

// Best-effort rate limit, per IP per warm serverless instance. A determined
// attacker can still rotate IPs — the Anthropic spend limit is the backstop.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 15;
const buckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  if (buckets.size > 5_000) buckets.clear();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > RATE_MAX_REQUESTS;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: "השרת לא הוגדר עדיין: חסר משתנה סביבה ANTHROPIC_API_KEY" });
  }

  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return json(429, { error: "יותר מדי בקשות — המתינו דקה ונסו שוב" });
  }

  const body = await request.json().catch(() => null);
  const { promptId, messages, maxTokens } = body || {};

  const prompt = resolvePrompt(promptId);
  if (!prompt) return json(400, { error: "Invalid promptId" });

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json(400, { error: "Invalid messages" });
  }

  let totalChars = 0;
  const apiMessages = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return json(400, { error: "Invalid message format" });
    }
    totalChars += m.content.length;
    apiMessages.push({ role: m.role, content: m.content });
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return json(400, { error: "Conversation too long" });
  }

  // Simulations open with an assistant message; the API requires the first
  // message to be from the user.
  if (apiMessages[0].role !== "user") {
    apiMessages.unshift({ role: "user", content: "התחל/י את השיחה בהתאם להנחיות." });
  }

  const client = new Anthropic();

  let stream;
  try {
    stream = await client.messages.create({
      model: MODEL,
      max_tokens: Math.min(Number(maxTokens) || 1000, MAX_TOKENS_CAP),
      system: prompt.system,
      messages: apiMessages,
      stream: true,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json(429, { error: "עומס זמני — נסו שוב בעוד רגע" });
    }
    if (err instanceof Anthropic.APIError) {
      return json(502, { error: `שגיאת API (${err.status})` });
    }
    return json(500, { error: "שגיאה פנימית" });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      stream.controller?.abort();
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
