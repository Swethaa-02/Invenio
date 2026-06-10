import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { docTitle, docBody, prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt parameter" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `
      You are an expert technical AI copilot.
      The user is working on a document called "${docTitle}".
      Document Content:
      """
      ${docBody}
      """

      User instruction: "${prompt}"

      Provide your suggestions, specifications, or comments clearly and concisely. Format your response in clean Markdown.
    `;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContentStream(systemPrompt);

      // Create a ReadableStream from the Gemini async iterator
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              controller.enqueue(encoder.encode(text));
            }
          } catch (err) {
            console.error("Stream generation error:", err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    } else {
      // Fallback Simulator Mode (Streams mock technical responses with typing interval)
      console.log("GEMINI_API_KEY is missing. Running copilot simulator stream.");

      const responseText = `### AI Copilot Suggestion (Simulated)

Based on your prompt *"${prompt}"* for the document **"${docTitle}"**, here is the suggested specification addition:

#### Technical Architecture Update
1. **Optimize Thread Safety**: Ensure the WebAssembly modules compiled under background worker threads utilize isolated memory structures. Use \`SharedArrayBuffer\` only with strict lock guards.
2. **Reconciliation Latencies**: Benchmark clock tree synchronization rates. Under simulated node failures (e.g. poor network), latency spikes should not exceed **35ms**.
3. **Identity Handshake**: Anchor the decentralized validation keys inside local worker cache allocations to prevent round-trip auth validation delays.

\`\`\`typescript
// Suggested worker listener snippet
self.onmessage = async (e) => {
  const { type, payload } = e.data;
  if (type === 'SYNC_TRANSACTIONS') {
    const syncResults = await reconcileClockTree(payload);
    self.postMessage({ type: 'SYNC_COMPLETE', results: syncResults });
  }
};
\`\`\`

*This is an AI-generated mock response. To enable live Gemini responses, configure your key in \`.env.local\`.*
`;

      const encoder = new TextEncoder();
      const words = responseText.split(" ");
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for (let i = 0; i < words.length; i++) {
              const text = words[i] + " ";
              controller.enqueue(encoder.encode(text));
              // Sleep 35ms between words to simulate streaming typing
              await new Promise((resolve) => setTimeout(resolve, 35));
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }
  } catch (error: any) {
    console.error("Error in copilot route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
