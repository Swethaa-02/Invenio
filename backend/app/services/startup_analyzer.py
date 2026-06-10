import json
import logging
from typing import Any, Dict, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class StartupAnalyzerEngine:
    def _run_rule_based_evaluation(
        self, title: str, summary: str, technologies: List[str]
    ) -> Dict[str, Any]:
        """Calculates base startup potential scores using standard keywords."""
        text = f"{title} {summary} {' '.join(technologies)}".lower()

        # 1. Base Score Calculations
        market_size = 50.0
        competition = 60.0  # High score means favorable (less competition)
        revenue_potential = 50.0
        scalability = 50.0
        customer_demand = 45.0

        # Market Size
        if "saas" in text or "platform" in text or "cloud" in text:
            market_size += 10.0
        if (
            "consumer" in text
            or "marketplace" in text
            or "social" in text
            or "b2c" in text
        ):
            market_size += 20.0
        if "healthcare" in text or "medical" in text or "biotech" in text:
            market_size += 20.0
        if "ai" in text or "llm" in text or "agent" in text or "learning" in text:
            market_size += 15.0

        # Competition (Favorable vs Crowded)
        if "ai" in text or "llm" in text or "agent" in text or "learning" in text:
            competition -= 15.0  # Highly competitive
        if (
            "consumer" in text
            or "social" in text
            or "b2c" in text
            or "marketplace" in text
        ):
            competition -= 10.0
        if "zkp" in text or "cryptography" in text or "cryptographic" in text:
            competition += 15.0  # Strong technical moats, less copycats
        if "drone" in text or "robot" in text or "hardware" in text:
            competition += 10.0  # Hardware barrier to entry

        # Revenue Potential
        if "b2b" in text or "enterprise" in text:
            revenue_potential += 20.0
        if "saas" in text or "platform" in text:
            revenue_potential += 15.0
        if "blockchain" in text or "ledger" in text or "token" in text:
            revenue_potential += 10.0

        # Scalability
        if "saas" in text or "platform" in text or "api" in text or "cloud" in text:
            scalability += 20.0
        if "drone" in text or "robot" in text or "hardware" in text:
            scalability -= 15.0  # Hardware scaling constraints
        if "zkp" in text or "cryptography" in text:
            scalability += 10.0

        # Customer Demand
        if "ai" in text or "llm" in text or "agent" in text or "learning" in text:
            customer_demand += 20.0
        if "healthcare" in text or "medical" in text or "wellness" in text:
            customer_demand += 15.0
        if "saas" in text or "productivity" in text:
            customer_demand += 10.0

        # Clamp all sub-scores between 15 and 95
        market_size = float(max(15, min(95, market_size)))
        competition = float(max(15, min(95, competition)))
        revenue_potential = float(max(15, min(95, revenue_potential)))
        scalability = float(max(15, min(95, scalability)))
        customer_demand = float(max(15, min(95, customer_demand)))

        # 2. Weighted Startup Potential Score
        # Market Size (25%), Competition (15%), Revenue Potential (20%), Scalability (20%), Customer Demand (20%)
        potential_score = (
            (market_size * 0.25)
            + (competition * 0.15)
            + (revenue_potential * 0.20)
            + (scalability * 0.20)
            + (customer_demand * 0.20)
        )
        potential_score = float(max(10, min(98, potential_score)))

        return {
            "startup_potential_score": potential_score,
            "market_size_score": market_size,
            "competition_score": competition,
            "revenue_potential_score": revenue_potential,
            "scalability_score": scalability,
            "customer_demand_score": customer_demand,
        }

    def analyze(
        self, title: str, summary: str, technologies: List[str]
    ) -> Dict[str, Any]:
        """Analyzes startup potential using hybrid rule-based engine and AI refinement."""
        base_eval = self._run_rule_based_evaluation(title, summary, technologies)

        # AI Refinement
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                prompt = f"""
                You are a venture capitalist and startup incubator analyst.
                Evaluate the startup potential of this innovation concept:
                Title: {title}
                Summary: {summary}
                Technologies: {', '.join(technologies)}
                
                We have computed these baseline indicators (0-100):
                - Startup Potential Score: {base_eval['startup_potential_score']}/100
                - Market Size: {base_eval['market_size_score']}/100
                - Competition (Moat/Barriers): {base_eval['competition_score']}/100
                - Revenue Potential: {base_eval['revenue_potential_score']}/100
                - Scalability: {base_eval['scalability_score']}/100
                - Customer Demand: {base_eval['customer_demand_score']}/100
                
                Refine these scores to be realistic and generate a detailed business structure report.
                You MUST respond with a JSON object conforming exactly to this JSON schema:
                {{
                    "startup_potential_score": float (0-100),
                    "market_size_score": float (0-100),
                    "competition_score": float (0-100),
                    "revenue_potential_score": float (0-100),
                    "scalability_score": float (0-100),
                    "customer_demand_score": float (0-100),
                    "business_model": "Detailed 2-3 sentence explanation of the business model and value prop",
                    "target_customers": ["Segment 1", "Segment 2", "Segment 3", "Segment 4"],
                    "revenue_streams": ["Revenue stream 1", "Revenue stream 2", "Revenue stream 3"],
                    "go_to_market_strategy": ["Phase 1 Strategy", "Phase 2 Strategy", "Phase 3 Strategy"],
                    "explanation": "A comprehensive paragraph detailing the venture potential, risk profile, and investment thesis."
                }}
                """
                res = model.generate_content(prompt)
                res_text = res.text
                if "```json" in res_text:
                    res_text = res_text.split("```json")[1].split("```")[0].strip()
                elif "```" in res_text:
                    res_text = res_text.split("```")[1].split("```")[0].strip()
                final_data = json.loads(res_text)
                return final_data
            except Exception as e:
                logger.error(f"Gemini Startup Potential Analyzer failed: {e}")

        # Fallback / Simulation Mode
        tech_list_str = ", ".join(technologies)
        business_model = (
            f"B2B SaaS and technical licensing business model. We package {title} as "
            f"a managed API service and enterprise cloud runtime layer, charging recurring licensing fees."
        )

        target_customers = [
            f"Enterprise software engineering organizations deploying {tech_list_str}",
            "R&D directors and CTOs auditing cloud resource allocations",
            "Mid-market scaling companies requiring low-latency infrastructure nodes",
        ]

        revenue_streams = [
            "Tiered Subscription SaaS licenses (monthly developer seats)",
            "Usage-based API calls and transaction processing volume billing",
            "Custom enterprise deployment licenses with SLA support agreements",
        ]

        go_to_market_strategy = [
            f"Phase 1: Developer advocacy campaigns showcasing integration of {tech_list_str}",
            "Phase 2: Product-Led Growth (PLG) free tier offering local sandboxes",
            "Phase 3: Direct sales targeting enterprise security/scalability compliance buyers",
        ]

        explanation = (
            f"Venture potential evaluation for '{title}'. With a core score of {base_eval['startup_potential_score']}%, "
            f"the venture shows solid scalability ({base_eval['scalability_score']}%) and market opportunity ({base_eval['market_size_score']}%). "
            f"Competitively, specialized integration of {tech_list_str} provides a defensible moat ({base_eval['competition_score']}% moat score). "
            f"Monetization routes are clear via direct usage fees, although customer acquisition cycles will depend on dev tools adoption."
        )

        return {
            "startup_potential_score": base_eval["startup_potential_score"],
            "market_size_score": base_eval["market_size_score"],
            "competition_score": base_eval["competition_score"],
            "revenue_potential_score": base_eval["revenue_potential_score"],
            "scalability_score": base_eval["scalability_score"],
            "customer_demand_score": base_eval["customer_demand_score"],
            "business_model": business_model,
            "target_customers": target_customers,
            "revenue_streams": revenue_streams,
            "go_to_market_strategy": go_to_market_strategy,
            "explanation": explanation,
        }


startup_analyzer = StartupAnalyzerEngine()
