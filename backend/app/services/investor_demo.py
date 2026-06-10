import json
import logging
from typing import Any, Dict, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class InvestorDemoEngine:
    def generate(
        self, title: str, summary: str, technologies: List[str]
    ) -> Dict[str, Any]:
        """Generates a startup pitch deck, highlights, and executive summaries."""

        # AI-based generation
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                prompt = f"""
                You are a venture capitalist, CTO, and pitch designer.
                Generate a complete startup pitch deck, executive summary, and highlights for:
                Title: {title}
                Summary: {summary}
                Technologies: {', '.join(technologies)}
                
                The pitch deck MUST consist of exactly 8 slides covering:
                1. Problem
                2. Solution
                3. Market
                4. Technology
                5. Business Model
                6. Competition
                7. Roadmap
                8. Revenue
                
                You MUST respond with a JSON object conforming exactly to this JSON schema:
                {{
                    "executive_summary": "Detailed, professional 3-4 sentence business pitch and summary",
                    "investment_highlights": [
                        "Highlight 1 (e.g. $45B TAM)",
                        "Highlight 2 (e.g. 10x query performance)",
                        "Highlight 3 (e.g. 85% gross margins SaaS model)"
                    ],
                    "pitch_deck": [
                        {{
                            "slide_id": int (1 to 8),
                            "section": "Problem" | "Solution" | "Market" | "Technology" | "Business Model" | "Competition" | "Roadmap" | "Revenue",
                            "title": "Catchy professional slide title",
                            "subtitle": "Short descriptive slide subtitle",
                            "bullet_points": ["Point 1", "Point 2", "Point 3"],
                            "chart_type": "pie" | "bar" | "radar" | "list",
                            "chart_data": [
                                {{
                                    "label" or "name": "Label text (e.g. 'Year 1' or 'TAM')",
                                    "value": float (data value, e.g. 1.2 or 45000),
                                    "color": "Optional color string (e.g. '#00f2fe' or '#9b5de5')"
                                }}
                            ]
                        }}
                    ]
                }}
                Ensure the pitch_deck array has exactly 8 elements corresponding sequentially to the sections listed.
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
                logger.error(f"Gemini Investor Demo failed: {e}")

        # Fallback / Simulation Mode
        tech_list_str = ", ".join(technologies) if technologies else "cloud tools"
        executive_summary = (
            f"Managed venture proposal for '{title}'. By packaging local sandboxes, async syncing architectures, "
            f"and specialized {tech_list_str} integrations, we establish an unfair speed moat in SaaS infrastructure. "
            f"We resolve key query delays, offering sub-15ms local latency profiles while keeping data structures fully compliant."
        )

        investment_highlights = [
            f"Highly scaleable B2B SaaS infrastructure targeting a $45B market opportunity",
            f"Proprietary local WASM worker compilation layer offering 10x performance gains",
            f"85% Gross Margin target via decentralized off-chain ledger sync models",
        ]

        pitch_deck = [
            {
                "slide_id": 1,
                "section": "Problem",
                "title": "The Infrastructure Scaling Pain",
                "subtitle": "Centralized database syncing bottlenecks delay enterprise developers.",
                "bullet_points": [
                    "Query latency spikes exceed 150ms over standard networks",
                    "High database compute fees compromise operating margins",
                    "Offline synchronization failures trigger data merge conflicts",
                ],
                "chart_type": "bar",
                "chart_data": [
                    {"label": "Standard SaaS", "value": 150},
                    {"label": f"{title} App", "value": 15},
                ],
            },
            {
                "slide_id": 2,
                "section": "Solution",
                "title": f"Introducing {title}",
                "subtitle": f"A localized WASM runtime layer auto-reconciling node files.",
                "bullet_points": [
                    "Sub-15ms local query execution speeds utilizing client memory indexes",
                    "Decentralized Merkle clock tree conflict-resolution protocols",
                    "Zero-config sandboxing requiring no local server installations",
                ],
                "chart_type": "list",
                "chart_data": [],
            },
            {
                "slide_id": 3,
                "section": "Market",
                "title": "Addressable Global Footprint",
                "subtitle": "Positioned at the intersection of developer tools and cloud storage.",
                "bullet_points": [
                    "TAM: $45B Global Database & Data Integration markets",
                    "SAM: $8.5B SaaS developer utility subscriptions",
                    "SOM: $1.2B initial focus on active Web3/AI platform builders",
                ],
                "chart_type": "pie",
                "chart_data": [
                    {"name": "TAM", "value": 45000.0, "color": "#00f2fe"},
                    {"name": "SAM", "value": 8500.0, "color": "#9b5de5"},
                    {"name": "SOM", "value": 1200.0, "color": "#00f5d4"},
                ],
            },
            {
                "slide_id": 4,
                "section": "Technology",
                "title": "Core Architectural Defensibility",
                "subtitle": f"Leveraging advanced client compiling and async syncing stacks.",
                "bullet_points": [
                    f"WASM compiler sandboxing executing safe client-side code execution",
                    "FastAPI async endpoint routers managing distributed node state configurations",
                    f"Seamless optimization layers targeting specialized {tech_list_str} integrations",
                ],
                "chart_type": "list",
                "chart_data": [],
            },
            {
                "slide_id": 5,
                "section": "Business Model",
                "title": "Developer-First SaaS Monetization",
                "subtitle": "Scales recurring base subscriptions with usage-based volume add-ons.",
                "bullet_points": [
                    "Developer Tier: $29/seat monthly entry subscription",
                    "Volume API: Usage-based billing per 1M synchronized data operations",
                    "Enterprise Tier: Premium licensing, SLA support, and dedicated validator nodes",
                ],
                "chart_type": "list",
                "chart_data": [],
            },
            {
                "slide_id": 6,
                "section": "Competition",
                "title": "Competitive Advantage Moat",
                "subtitle": "Offering structural cost savings and offline-first runtime capabilities.",
                "bullet_points": [
                    f"Resilient local synchronization compared to legacy server query lag-times",
                    "Significantly lower server overhead utilizing client compute cycles",
                    "Technical barriers protect proprietary compilation assets",
                ],
                "chart_type": "radar",
                "chart_data": [
                    {"label": "Sync Speed", "value": 95},
                    {"label": "Cost Moat", "value": 90},
                    {"label": "Offline Safety", "value": 98},
                ],
            },
            {
                "slide_id": 7,
                "section": "Roadmap",
                "title": "Chronological Product Roadmap",
                "subtitle": "A rapid rollout plan scaling from local prototype to public regional nodes.",
                "bullet_points": [
                    "Phase 1-2: Establish PRD schemas and finalize local WASM compilation sandboxes",
                    "Phase 3-4: Launch central APIs and run stress E2E automated test checkups",
                    "Phase 5-6: Scale auto-scaled node clusters across multi-region Kubernetes",
                ],
                "chart_type": "list",
                "chart_data": [],
            },
            {
                "slide_id": 8,
                "section": "Revenue",
                "title": "Venture Revenue Forecast",
                "subtitle": "Targeting high exponential SaaS ARR expansion.",
                "bullet_points": [
                    "Year 1: $1.2M ARR (targeting 500 early-adopter startups)",
                    "Year 3: $8.5M ARR (expanding to mid-market enterprise teams)",
                    "Year 5: $24.0M ARR (scaling globally across developer ecosystems)",
                ],
                "chart_type": "bar",
                "chart_data": [
                    {"label": "Year 1", "value": 1.2},
                    {"label": "Year 3", "value": 8.5},
                    {"label": "Year 5", "value": 24.0},
                ],
            },
        ]

        return {
            "executive_summary": executive_summary,
            "investment_highlights": investment_highlights,
            "pitch_deck": pitch_deck,
        }


investor_demo = InvestorDemoEngine()
