import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { title, summary, technologies } = await req.json();
    if (!title || !summary) {
      return NextResponse.json({ error: "Missing title or summary parameter" }, { status: 400 });
    }

    const techList = technologies || [];
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
        You are an expert venture capitalist and startup incubator analyst.
        Evaluate the startup potential of this innovation concept:
        Title: "${title}"
        Summary: "${summary}"
        Technologies: "${techList.join(", ")}"

        You MUST respond with a JSON object in this EXACT schema:
        {
          "startup_potential_score": a number from 0 to 100,
          "market_size_score": a number from 0 to 100,
          "competition_score": a number from 0 to 100 (high represents favorable, i.e., low competition/barriers),
          "revenue_potential_score": a number from 0 to 100,
          "scalability_score": a number from 0 to 100,
          "customer_demand_score": a number from 0 to 100,
          "business_model": "Detailed 2-3 sentence explanation of the business model and value prop",
          "target_customers": ["Segment 1", "Segment 2", "Segment 3", "Segment 4"],
          "revenue_streams": ["Monetization stream 1", "Monetization stream 2", "Monetization stream 3"],
          "go_to_market_strategy": ["Phase 1 Strategy", "Phase 2 Strategy", "Phase 3 Strategy"],
          "explanation": "A comprehensive paragraph detailing the venture potential, risk profile, and investment thesis."
        }
      `;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const data = JSON.parse(text);

      return NextResponse.json(data);
    } else {
      // Fallback Simulator Mode
      console.log("GEMINI_API_KEY is missing. Running startup analyzer simulator.");
      
      const text = `${title} ${summary} ${techList.join(" ")}`.toLowerCase();

      let marketSize = 50.0;
      let competition = 60.0;
      let revenuePotential = 50.0;
      let scalability = 50.0;
      let customerDemand = 45.0;

      if (text.includes("saas") || text.includes("platform") || text.includes("cloud")) {
        marketSize += 10.0;
        scalability += 20.0;
        revenuePotential += 15.0;
      }
      if (text.includes("consumer") || text.includes("marketplace") || text.includes("social") || text.includes("b2c")) {
        marketSize += 20.0;
        customerDemand += 10.0;
        competition -= 10.0;
      }
      if (text.includes("healthcare") || text.includes("medical") || text.includes("biotech")) {
        marketSize += 20.0;
        customerDemand += 15.0;
        competition -= 10.0;
      }
      if (text.includes("ai") || text.includes("llm") || text.includes("agent") || text.includes("learning")) {
        marketSize += 15.0;
        customerDemand += 20.0;
        competition -= 15.0;
      }
      if (text.includes("zkp") || text.includes("cryptography") || text.includes("cryptographic")) {
        competition += 15.0;
        scalability += 10.0;
      }
      if (text.includes("drone") || text.includes("robot") || text.includes("hardware")) {
        competition += 10.0;
        scalability -= 15.0;
      }
      if (text.includes("b2b") || text.includes("enterprise")) {
        revenuePotential += 20.0;
      }

      // Clamp
      const clamp = (val: number) => Math.max(15, Math.min(95, val));
      marketSize = clamp(marketSize);
      competition = clamp(competition);
      revenuePotential = clamp(revenuePotential);
      scalability = clamp(scalability);
      customerDemand = clamp(customerDemand);

      const startupPotentialScore = Math.round(
        (marketSize * 0.25) +
        (competition * 0.15) +
        (revenuePotential * 0.20) +
        (scalability * 0.20) +
        (customerDemand * 0.20)
      );

      const techListStr = techList.length > 0 ? techList.join(", ") : "modern cloud infrastructure layers";

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json({
        startup_potential_score: startupPotentialScore,
        market_size_score: marketSize,
        competition_score: competition,
        revenue_potential_score: revenuePotential,
        scalability_score: scalability,
        customer_demand_score: customerDemand,
        business_model: `Managed B2B SaaS and developer tools model. Charging recurring enterprise licensing fees for accessing specialized ${title} systems.`,
        target_customers: [
          `CTOs and software engineers using ${techListStr} modules`,
          `R&D directors auditing workflow bottleneck solutions`,
          `High-growth technology companies scaling infrastructure layers`
        ],
        revenue_streams: [
          `Monthly developer seat subscriptions (Enterprise SaaS)`,
          `Usage-based billing on processed computation cycles`,
          `Premium custom integration support plans`
        ],
        go_to_market_strategy: [
          `Phase 1: Developer advocacy tutorials highlighting integration speed`,
          `Phase 2: Product-Led Growth (PLG) self-serve sandboxes for local testing`,
          `Phase 3: Sales outreach pointing to enterprise security and scale compliance benefits`
        ],
        explanation: `Venture diagnostics for '${title}'. At ${startupPotentialScore}%, this is a strong candidate for development. Favorable scalability (${scalability}%) combined with clean monetization outlines make this highly attractive. Technical moats (${competition}% moat score) protect the concept from quick emulation.`
      });
    }
  } catch (error: any) {
    console.error("Error in startup-analyzer route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
