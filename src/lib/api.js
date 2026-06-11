// קריאה לשרת — המפתח של Anthropic וכל ה-system prompts נשמרים בצד השרת בלבד
// (api/chat.js + api/_prompts.js). הלקוח שולח רק promptId.
// התשובה מוזרמת (streaming); onText מקבל את הטקסט המצטבר תוך כדי.
export async function callClaude(promptId, messages, { maxTokens = 1000, onText } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    let received = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          maxTokens,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += decoder.decode(value, { stream: true });
        if (onText && received.trim()) onText(received.trim());
      }
      received += decoder.decode();
      const text = received.trim();
      if (!text) throw new Error("empty response");
      return text;
    } catch (e) {
      lastErr = e;
      // אם כבר התקבל חלק מהתשובה — לא מנסים שוב (כדי לא לשכפל שיחה בצד השרת)
      if (received.trim()) throw e;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 900));
    }
  }
  throw lastErr;
}
