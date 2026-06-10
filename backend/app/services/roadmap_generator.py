import json
import logging
from typing import Any, Dict, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class RoadmapGeneratorEngine:
    def generate(self, title: str, summary: str) -> Dict[str, Any]:
        """Generates a structured 6-phase chronological product roadmap."""

        # AI-based generation
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                prompt = f"""
                You are a senior product manager and engineering director.
                Compile a structured 6-phase chronological product roadmap for this innovation concept:
                Title: {title}
                Summary: {summary}
                
                The roadmap MUST consist of exactly 6 phases in chronological order:
                1. "Phase 1 Research"
                2. "Phase 2 Prototype"
                3. "Phase 3 MVP"
                4. "Phase 4 Testing"
                5. "Phase 5 Deployment"
                6. "Phase 6 Scaling"
                
                You MUST respond with a JSON object conforming exactly to this JSON schema:
                {{
                    "phases": [
                        {{
                            "phase_name": "Phase 1 Research" | "Phase 2 Prototype" | "Phase 3 MVP" | "Phase 4 Testing" | "Phase 5 Deployment" | "Phase 6 Scaling",
                            "timeline": "Timeline range (e.g. 'Month 1' or 'Month 2 - 3')",
                            "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
                            "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
                            "dependencies": ["Prerequisite 1", "Prerequisite 2"],
                            "deliverables": ["Key Deliverable Document/Package 1", "Deliverable 2"],
                            "progress": float (0-100 indicating completion percentage)
                        }}
                    ]
                }}
                Ensure the array has exactly 6 elements, representing each of the 6 phases in order.
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
                logger.error(f"Gemini Roadmap Generator failed: {e}")

        # Fallback / Simulation Mode
        logger.info("GEMINI_API_KEY is missing. Running roadmap generator simulator.")

        phases = [
            {
                "phase_name": "Phase 1 Research",
                "timeline": "Month 1",
                "milestones": [
                    "Establish core parameters and constraints",
                    "Audit similar technical architectures",
                    "Review security compliance standards",
                ],
                "tasks": [
                    "Draft comprehensive product requirements document (PRD)",
                    "Establish baseline technology benchmark matrices",
                    "Perform initial database schema reviews",
                    "Conduct architecture review board validation",
                ],
                "dependencies": ["None (Venture Conception Phase)"],
                "deliverables": [
                    "Technical Specification Specification Sheet",
                    "Vulnerability Threat Model document",
                ],
                "progress": 100.0,
            },
            {
                "phase_name": "Phase 2 Prototype",
                "timeline": "Month 2 - 3",
                "milestones": [
                    "Build functional codebase sandbox",
                    "Validate local data synchronization loops",
                    "Achieve sub-50ms transaction latency benchmarks",
                ],
                "tasks": [
                    "Write SQLite local schemas and indexing loops",
                    "Implement background thread-safe worker scopes",
                    "Test validation models under edge simulated networks",
                    "Draft user flow mockups for dashboard widgets",
                ],
                "dependencies": ["Phase 1 Research specs and compliance documents"],
                "deliverables": [
                    "Working Local Sandbox codebase",
                    "Figma UI dashboard mockups",
                ],
                "progress": 60.0,
            },
            {
                "phase_name": "Phase 3 MVP",
                "timeline": "Month 4 - 5",
                "milestones": [
                    "Deploy first interactive web client",
                    "Integrate functional API routers",
                    "Onboard early alpha testers",
                ],
                "tasks": [
                    "Construct database migration and seed triggers",
                    "Establish user authentication and session tokens",
                    "Deploy central hosting application server",
                    "Set up transaction logging instrumentation",
                ],
                "dependencies": ["Phase 2 Prototype functional code blocks"],
                "deliverables": [
                    "First MVP deployment build package",
                    "Alpha user testing feedback log",
                ],
                "progress": 15.0,
            },
            {
                "phase_name": "Phase 4 Testing",
                "timeline": "Month 6",
                "milestones": [
                    "Complete automated code coverage tests",
                    "Pass vulnerability threat audits",
                    "Conduct stress test concurrency simulations",
                ],
                "tasks": [
                    "Write end-to-end integration test suites",
                    "Run stress testing for concurrent connections",
                    "Audit password encryption and JWT sessions",
                    "Fix UI layout bugs and page loading bottleneck traps",
                ],
                "dependencies": ["Phase 3 MVP hosting environment deployment"],
                "deliverables": [
                    "Vulnerability Scan and Test Coverage report",
                    "Bug Fix Changelog audit list",
                ],
                "progress": 0.0,
            },
            {
                "phase_name": "Phase 5 Deployment",
                "timeline": "Month 7 - 8",
                "milestones": [
                    "Provision production cloud infrastructure",
                    "Launch project live to public beta",
                    "Initiate automated monitoring alarms",
                ],
                "tasks": [
                    "Configure production load balancers and domain certificates",
                    "Execute production database migrations",
                    "Deploy containerized workloads to cloud clusters",
                    "Establish server health and error monitoring loops",
                ],
                "dependencies": ["Phase 4 Testing approvals and signature audits"],
                "deliverables": [
                    "Live Application production URL",
                    "SRE operations dashboard and runbook documentation",
                ],
                "progress": 0.0,
            },
            {
                "phase_name": "Phase 6 Scaling",
                "timeline": "Month 9 - 12",
                "milestones": [
                    "Optimize query latencies under 100k users",
                    "Establish geo-distributed node replication",
                    "Automate cost optimization structures",
                ],
                "tasks": [
                    "Configure database query caching pools",
                    "Deploy read-replicas in adjacent cloud regions",
                    "Analyze cluster compute costs and size nodes",
                    "Refactor hot-path operations to optimize CPU cycles",
                ],
                "dependencies": ["Phase 5 Deployment baseline telemetry"],
                "deliverables": [
                    "Auto-scaled multi-region Kubernetes setup",
                    "Performance Audit and cost analysis report",
                ],
                "progress": 0.0,
            },
        ]

        # Inject some context into the templates based on title/summary
        if title:
            phases[0]["tasks"][0] = f"Draft PRD for the '{title}' project"
            phases[1]["deliverables"][0] = f"Working '{title}' Prototype Build"
            phases[2]["deliverables"][0] = f"First stable '{title}' MVP deployment build"

        return {"phases": phases}


roadmap_generator = RoadmapGeneratorEngine()
