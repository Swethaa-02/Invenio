import json
import logging
from typing import Any, Dict, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class FeasibilityAnalyzerEngine:
    def _run_rule_based_evaluation(
        self, title: str, summary: str, technologies: List[str]
    ) -> Dict[str, Any]:
        """Calculates base scores and lists using standard keywords and list lengths."""
        text = f"{title} {summary} {' '.join(technologies)}".lower()

        # 1. Complexity Score Calculation
        complexity = 30
        skills = ["Fullstack Web Development", "System Architecture Integration"]
        infra = []

        if "zkp" in text or "cryptographic" in text or "cryptography" in text:
            complexity += 20
            skills.append("Applied Cryptography & ZKPs")
            infra.append("Decentralized Validator Nodes")

        if "swarm" in text or "multi-agent" in text:
            complexity += 15
            skills.append("Multi-Agent Systems Design")

        if "gpu" in text or "shader" in text or "webgl" in text or "glsl" in text:
            complexity += 15
            skills.append("GPU Shader Programming (GLSL)")
            infra.append("High-Performance GPU Instances")

        if (
            "drone" in text
            or "drones" in text
            or "robot" in text
            or "hardware" in text
        ):
            complexity += 20
            skills.append("Robotics & Embedded Hardware Engineering")
            infra.append("Physical IoT/Robot Fleet Gateway")

        if "blockchain" in text or "ledger" in text or "smart contract" in text:
            complexity += 10
            skills.append("Smart Contract Security Development")
            infra.append("Distributed Ledger Infrastructure")

        if (
            "reinforcement" in text
            or "neural" in text
            or "ai" in text
            or "learning" in text
        ):
            complexity += 15
            skills.append("Machine Learning & Model Triage Optimization")

        # Additional complexity based on tech stack size
        if len(technologies) > 3:
            complexity += (len(technologies) - 3) * 5

        # Clamp complexity
        complexity = float(max(15, min(95, complexity)))

        # 2. Map Complexity to Difficulty
        if complexity > 70:
            difficulty = "High"
        elif complexity > 40:
            difficulty = "Medium"
        else:
            difficulty = "Low"

        # Mapped Infrastructure
        if not infra:
            infra.append("Standard Cloud Application Hosting (AWS/GCP)")

        # 3. Calculate Scores
        feasibility_score = float(max(10, min(95, 100.0 - complexity)))

        # Risk Score Calculation
        risk = 15
        if complexity > 70:
            risk += 30
        elif complexity > 45:
            risk += 15

        if any(
            "Robotics" in s or "Cryptography" in s or "Contract" in s
            for s in skills
        ):
            risk += 20

        risk = float(max(10, min(90, risk)))

        # 4. Map Timeline and Cost
        if complexity > 75:
            time_to_build = "9 - 12 Months"
            development_cost = "$250,000 - $500,000"
        elif complexity > 45:
            time_to_build = "6 - 9 Months"
            development_cost = "$100,000 - $250,000"
        elif complexity > 25:
            time_to_build = "3 - 6 Months"
            development_cost = "$50,000 - $100,000"
        else:
            time_to_build = "1 - 3 Months"
            development_cost = "$10,000 - $50,000"

        technical_complexity = (
            f"Complexity rated at {complexity}%. Mapped to {difficulty} difficulty "
            f"reflecting the integration overhead of {', '.join(technologies)}."
        )

        return {
            "feasibility_score": feasibility_score,
            "risk_score": risk,
            "implementation_difficulty": difficulty,
            "technical_complexity": technical_complexity,
            "development_cost": development_cost,
            "required_skills": list(set(skills)),
            "infrastructure_requirements": list(set(infra)),
            "time_to_build": time_to_build,
        }

    def analyze(
        self, title: str, summary: str, technologies: List[str]
    ) -> Dict[str, Any]:
        """Performs hybrid rule-based and AI-based feasibility analysis."""
        # Step A: Run rule-based scoring first
        base_eval = self._run_rule_based_evaluation(title, summary, technologies)

        # Step B: AI Refinement (if key exists)
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                prompt = f"""
                You are a systems analyst and feasibility analyzer.
                Analyze the feasibility of this generated innovation concept:
                Title: {title}
                Summary: {summary}
                Technologies: {', '.join(technologies)}
                
                We have computed these base metrics:
                - Feasibility Score: {base_eval['feasibility_score']}/100
                - Risk Score: {base_eval['risk_score']}/100
                - Difficulty: {base_eval['implementation_difficulty']}
                - Time to build: {base_eval['time_to_build']}
                - Cost range: {base_eval['development_cost']}
                - Infrastructure: {', '.join(base_eval['infrastructure_requirements'])}
                - Skills: {', '.join(base_eval['required_skills'])}
                
                Please refine these scores and output a detailed report.
                You MUST respond with a JSON object conforming exactly to this JSON schema:
                {{
                    "feasibility_score": float (0-100),
                    "risk_score": float (0-100),
                    "implementation_difficulty": "Low" | "Medium" | "High",
                    "technical_complexity": "A detailed 1-2 sentence description explaining the architectural complexity",
                    "development_cost": "Estimated cost range (e.g. '$120,000 - $280,000')",
                    "required_skills": ["List", "of", "4-5", "required", "skills"],
                    "infrastructure_requirements": ["List", "of", "infrastructure", "needs"],
                    "time_to_build": "Estimated timeline (e.g. '7 - 10 Months')",
                    "explanation": "A comprehensive paragraph summarizing your architectural reasoning"
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
                logger.error(f"Gemini Feasibility Analyzer failed: {e}")

        # Fallback / Simulation Mode
        explanation = (
            f"Detailed feasibility analysis for the concept '{title}'. "
            f"Based on rule-based parameters, the technical feasibility is rated at {base_eval['feasibility_score']}% "
            f"with a risk rating of {base_eval['risk_score']}% ({base_eval['implementation_difficulty']} difficulty). "
            f"The project will require a timeline of {base_eval['time_to_build']} with a cost range of "
            f"{base_eval['development_cost']}. Special skills needed: {', '.join(base_eval['required_skills'])}."
        )

        return {
            "feasibility_score": base_eval["feasibility_score"],
            "risk_score": base_eval["risk_score"],
            "implementation_difficulty": base_eval["implementation_difficulty"],
            "technical_complexity": base_eval["technical_complexity"],
            "development_cost": base_eval["development_cost"],
            "required_skills": base_eval["required_skills"],
            "infrastructure_requirements": base_eval["infrastructure_requirements"],
            "time_to_build": base_eval["time_to_build"],
            "explanation": explanation,
        }


feasibility_analyzer = FeasibilityAnalyzerEngine()
