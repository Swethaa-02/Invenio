import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const ideas = db.getIdeas();
    const apiKey = process.env.GEMINI_API_KEY;

    // Compile active ideas into list for prompt
    const ideasSummary = ideas.map((idea, idx) => 
      `${idx + 1}. [${idea.category}] ${idea.title} (Score: ${idea.score}, Status: ${idea.status}) - ${idea.desc}`
    ).join("\n");

    const systemPrompt = `
      You are an expert Chief Technology Officer (CTO) and R&D portfolio auditor.
      Analyze the following startup innovation database portfolio and perform a visual R&D SWOT Analysis.
      
      Innovation Portfolio:
      """
      ${ideasSummary}
      """

      Provide your R&D Audit Report using clean Markdown formatting. Include:
      - **R&D STRENGTHS**: Analyze where the team has high confidence (e.g. scores >= 9.0) and high-density tracks.
      - **PORTFOLIO WEAKNESSES**: Highlight gaps in tracks or low-progress/draft modules.
      - **EMERGING OPPORTUNITIES**: Advise on how the tracks can link together to capture new SaaS markets.
      - **COMPLEXITY RISKS**: Evaluate technical risks (e.g. security audits, Vision interface gesture tracking latencies).
      - **ACTION PLAN**: Outline 3 clear, sequential R&D tasks for Q3.

      Make the tone professional, strategic, and concise.
    `;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContentStream(systemPrompt);

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              controller.enqueue(encoder.encode(text));
            }
          } catch (err) {
            console.error("SWOT stream generation error:", err);
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
      // Fallback Simulator Mode (Streams mock CTO dashboard analysis)
      console.log("GEMINI_API_KEY is missing. Running dashboard-insights simulator stream.");

      const simulatedReport = `### R&D SWOT Diagnostic Report (Simulated)

Based on the **${ideas.length} active innovations** in the database, here is the R&D portfolio audit:

#### 1. R&D STRENGTHS (Core Competencies)
- **High-Performance Core Systems**: Projects like *Client-side WASM SQLite* (Score: 9.5) and *Vector Cache* (Score: 9.4) show top-tier engineering maturity.
- **AI Domain Dominance**: The R&D pipeline is heavily weighted towards embedding retrieval latency mitigations.

#### 2. PORTFOLIO WEAKNESSES (Gaps)
- **Spatial UI Maturity**: The *Apple Vision Gesture Binding* remains in "Draft" state (Score: 7.6) with significant gesture tracking latency hurdles.
- **Web3 Scaling Bottlenecks**: High reliance on Solana logging contract validations (Score: 8.2) without fallback registry mechanisms.

#### 3. EMERGING OPPORTUNITIES (Bridges)
- **AI-Powered Local Databases**: Merge the SQLite WASM compiler directly with localized vector search caches. This creates a zero-network local inference sandbox.
- **Spatial Whiteboard Canvas**: Bind visual nodes in the whiteboard canvas directly to the gesture trackers for spatial spatial configuration dashboards.

#### 4. COMPLEXITY RISKS (Threats)
- **Shared Worker Safety**: Thread safety blockages in shared worker scopes may compromise localized sync logs.
- **Event Gas Fees**: High Solana transaction logging frequency could spike indexing compute overheads.

#### 5. ACTION PLAN (Q3 Sprint)
1. *Compile stable WASM worker pools* to handle concurrency.
2. *Integrate off-chain Merkle registries* to hedge against gas cost spikes.
3. *Run gesture binding benchmarks* to secure low-latency UI redraws.

*To query the live Gemini model, set your API key in \`.env.local\`.*
`;

      const encoder = new TextEncoder();
      const words = simulatedReport.split(" ");

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for (let i = 0; i < words.length; i++) {
              const text = words[i] + " ";
              controller.enqueue(encoder.encode(text));
              // Stream word by word
              await new Promise((resolve) => setTimeout(resolve, 25));
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
    console.error("Error in dashboard-insights route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
