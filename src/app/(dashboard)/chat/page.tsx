import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/ai/chat-interface";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let chatSession = await db.chatSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!chatSession) {
    chatSession = await db.chatSession.create({
      data: { userId: session.user.id, title: "New Chat" },
    });
  }

  const messages = await db.chatMessage.findMany({
    where: { sessionId: chatSession.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Medical Tutor</h1>
      <ChatInterface sessionId={chatSession.id} initialMessages={messages} />
    </div>
  );
}
