import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt parameter" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const systemPrompt = `
        You are an expert systems architect. Design a technical system node-link relationship diagram representing the user's concept: "${prompt}".
        
        Generate exactly 7 to 9 nodes and 7 to 10 linking connections. Make sure coordinates (x, y) place them nicely on an 800x550 canvas space (keep x between 150 and 700, and y between 100 and 480).

        You MUST respond with a JSON object conforming exactly to this schema:
        {
          "nodes": [
            {
              "id": "a short unique string ID (e.g. 'engine', 'wasm', 'llm')",
              "label": "A clean 2-3 word human-readable name",
              "group": "ai" | "core" | "web3" | "spatial",
              "x": an integer from 150 to 700 indicating positioning,
              "y": an integer from 100 to 480 indicating positioning,
              "r": an integer radius from 12 to 24 representing relative node size,
              "details": "A detailed 1-2 sentence specification summary of this system component",
              "status": "Draft" | "Research" | "Prototype" | "Ready",
              "confidence": a number from 6.5 to 9.8 representing its design integrity score
            }
          ],
          "links": [
            {
              "source": "the source node id matching one in nodes array",
              "target": "the target node id matching one in nodes array"
            }
          ]
        }
      `;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const data = JSON.parse(text);

      return NextResponse.json(data);
    } else {
      // Fallback Simulator Mode
      console.log("GEMINI_API_KEY is missing. Running graph compiler simulator.");
      
      const lowerPrompt = prompt.toLowerCase();
      let focusGroup: "ai" | "core" | "web3" | "spatial" = "core";
      let focusLabel = "Core Service";

      if (lowerPrompt.includes("ai") || lowerPrompt.includes("model")) {
        focusGroup = "ai";
        focusLabel = "AI Inference";
      } else if (lowerPrompt.includes("web3") || lowerPrompt.includes("ledger") || lowerPrompt.includes("chain")) {
        focusGroup = "web3";
        focusLabel = "Token Registry";
      } else if (lowerPrompt.includes("vision") || lowerPrompt.includes("spatial") || lowerPrompt.includes("gest")) {
        focusGroup = "spatial";
        focusLabel = "Vision Overlay";
      }

      await new Promise((resolve) => setTimeout(resolve, 900));

      const simulatedGraph = {
        nodes: [
          { id: "root_hub", label: `${focusLabel} Hub`, group: focusGroup, x: 400, y: 280, r: 24, details: `The root orchestration pipeline compiler designed for: ${prompt}.`, status: "Prototype", confidence: 9.0 },
          { id: "wasm_executor", label: "WASM Worker", group: "core", x: 260, y: 180, r: 18, details: "Client-side compilation layers processing tasks off main threads.", status: "Ready", confidence: 9.3 },
          { id: "db_cache", label: "SQLite Index Cache", group: "core", x: 250, y: 380, r: 16, details: "Local database sync layer holding active transactional log values.", status: "Ready", confidence: 9.6 },
          { id: "ai_router", label: "AI Route Agent", group: "ai", x: 550, y: 180, r: 20, details: "Determines model processing paths for vector indexing prompts.", status: "Research", confidence: 8.2 },
          { id: "context_quant", label: "Context Quantizer", group: "ai", x: 670, y: 120, r: 14, details: "Quantizes contextual tags to optimize memory bounds.", status: "Prototype", confidence: 7.9 },
          { id: "solana_tracker", label: "Ledger Router", group: "web3", x: 580, y: 390, r: 18, details: "Anchors logs on-chain using Solana transaction hashes.", status: "Draft", confidence: 7.0 },
          { id: "spatial_overlay", label: "Spatial Widget Canvas", group: "spatial", x: 420, y: 460, r: 16, details: "Translucent interface canvas rendering node links in WebGL.", status: "Prototype", confidence: 8.4 },
        ],
        links: [
          { source: "root_hub", target: "wasm_executor" },
          { source: "root_hub", target: "db_cache" },
          { source: "root_hub", target: "ai_router" },
          { source: "ai_router", target: "context_quant" },
          { source: "root_hub", target: "solana_tracker" },
          { source: "root_hub", target: "spatial_overlay" },
          { source: "db_cache", target: "solana_tracker" },
        ],
      };

      return NextResponse.json(simulatedGraph);
    }
  } catch (error: any) {
    console.error("Error in generate-graph route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
