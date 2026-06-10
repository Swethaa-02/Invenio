import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt parameter" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Initialize Gemini SDK
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const systemPrompt = `
        You are an expert R&D technical evaluator for a startup innovation portal.
        Evaluate the following user concept and generate a highly detailed evaluation JSON object.
        User concept: "${prompt}"

        You MUST respond with a JSON object in this EXACT schema:
        {
          "title": "A short, catchy, professional 3-6 word title for the innovation",
          "category": "AI" | "Core Platform" | "Web3" | "Spatial UI",
          "score": a number from 7.0 to 9.8 representing confidence/feasibility,
          "desc": "A concise 1-2 sentence high-level summary of the idea.",
          "details": "A detailed 2-3 sentence technical walkthrough of the proposed architecture and implementation strategy.",
          "goals": ["Goal 1 (specific step)", "Goal 2 (specific step)", "Goal 3 (specific step)"]
        }

        Make sure the category is strictly one of the 4 strings: "AI", "Core Platform", "Web3", or "Spatial UI".
      `;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const data = JSON.parse(text);

      // Save generated card to shared in-memory database
      const randomOffset = () => Math.floor(Math.random() * 100) - 50;
      const newIdea = db.addIdea({
        title: data.title,
        desc: data.desc,
        category: data.category === "Core Platform" ? "Core Platform" : data.category || "General",
        score: data.score || 8.0,
        details: data.details || "",
        x: 350 + randomOffset(),
        y: 200 + randomOffset(),
        status: "Prototype",
      });

      return NextResponse.json(newIdea);
    } else {
      // Fallback Simulator Mode (High Fidelity)
      console.log("GEMINI_API_KEY is missing. Running in high-fidelity simulator mode.");
      
      // Select category based on keywords
      const lowerPrompt = prompt.toLowerCase();
      let category: "AI" | "Core Platform" | "Web3" | "Spatial UI" = "Core Platform";
      if (lowerPrompt.includes("ai") || lowerPrompt.includes("model") || lowerPrompt.includes("learning") || lowerPrompt.includes("gpt") || lowerPrompt.includes("llm")) {
        category = "AI";
      } else if (lowerPrompt.includes("web3") || lowerPrompt.includes("chain") || lowerPrompt.includes("ledger") || lowerPrompt.includes("crypto") || lowerPrompt.includes("token")) {
        category = "Web3";
      } else if (lowerPrompt.includes("vision") || lowerPrompt.includes("spatial") || lowerPrompt.includes("gesture") || lowerPrompt.includes("ar") || lowerPrompt.includes("vr") || lowerPrompt.includes("display")) {
        category = "Spatial UI";
      }

      // Generate title
      const words = prompt.split(" ");
      const nameSeed = words.length > 2 ? `${words[0]} ${words[1]} ${words[2]}` : prompt;
      const title = nameSeed.charAt(0).toUpperCase() + nameSeed.slice(1) + " System";

      // Score
      const score = Math.round((7.8 + Math.random() * 1.8) * 10) / 10;

      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const randomOffset = () => Math.floor(Math.random() * 100) - 50;
      const newIdea = db.addIdea({
        title,
        desc: `AI-Simulated breakdown of: "${prompt}". A next-generation architectural solution for SaaS integration.`,
        category,
        score,
        details: `Architected utilizing modular clusters. Leverages edge computing layers to decrease data path latencies, sync local state nodes, and optimize cache allocations.`,
        x: 350 + randomOffset(),
        y: 200 + randomOffset(),
        status: "Prototype",
      });

      return NextResponse.json(newIdea);
    }
  } catch (error: any) {
    console.error("Error in generate-idea route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
