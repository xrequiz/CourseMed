import { auth } from "@/lib/auth";
import { anthropic, MEDICAL_SYSTEM_PROMPT } from "@/lib/anthropic";
import { db } from "@/lib/db";
import { z } from "zod";

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, message } = parsed.data;

  const chatSession = await db.chatSession.findUnique({
    where: { id: sessionId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });

  if (!chatSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  await db.chatMessage.create({
    data: { sessionId, role: "USER", content: message },
  });

  const history = chatSession.messages.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: MEDICAL_SYSTEM_PROMPT,
    messages: [...history, { role: "user", content: message }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullResponse += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      await db.chatMessage.create({
        data: { sessionId, role: "ASSISTANT", content: fullResponse },
      });
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
