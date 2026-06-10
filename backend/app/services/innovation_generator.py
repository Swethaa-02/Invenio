import json
import logging
import os
from typing import Any, Dict, List, TypedDict
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


# 1. Define LangGraph Agent State
class AgentState(TypedDict):
    domains: List[str]
    research_notes: str
    discovered_problem: str
    proposed_solution: str
    final_innovation: Dict[str, Any]
    reasoning_log: List[str]


# Helper to run Gemini models using google-generativeai SDK
def call_gemini(prompt: str) -> str:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set.")

    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text


# 2. Node Functions for Agents

# --- A. Research Agent ---
def research_agent_node(state: AgentState) -> Dict[str, Any]:
    domains = state["domains"]
    reasoning = list(state.get("reasoning_log", []))

    reasoning_entry = (
        f"[Research Agent] Analyzing intersecting concepts between domains: {', '.join(domains)}. "
        "Identifying technology bridges and shared system constraints."
    )
    reasoning.append(reasoning_entry)

    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
            You are a Research Agent in a multi-agent system.
            Analyze the technological intersection between these domains: {', '.join(domains)}.
            Identify:
            1. Potential synergies.
            2. Core technological elements of each that can be integrated.
            3. Existing touchpoints or analogous integrations.
            
            Write your research notes in detail.
            """
            notes = call_gemini(prompt)
            return {"research_notes": notes, "reasoning_log": reasoning}
        except Exception as e:
            logger.error(f"Gemini Research Node failed: {e}")

    # Fallback / Simulation Mode
    notes = (
        f"Research Analysis for {', '.join(domains)}:\n"
        f"- Synergistic Opportunities: Leveraging the operational primitives of the domains to "
        "resolve systemic bottlenecks.\n"
        f"- Technical Bridge: Translating core concepts from {domains[-1]} to create a new mechanism "
        f"for {domains[0]} environments.\n"
        f"- Target Application: A combined system architecture resolving efficiency or scale constraints."
    )
    return {"research_notes": notes, "reasoning_log": reasoning}


# --- B. Problem Discovery Agent ---
def problem_discovery_node(state: AgentState) -> Dict[str, Any]:
    domains = state["domains"]
    research_notes = state["research_notes"]
    reasoning = list(state.get("reasoning_log", []))

    reasoning_entry = (
        "[Problem Discovery Agent] Evaluating research notes. Identifying a critical pain point, "
        "bottleneck, or inefficiency at the intersection that is currently unsolved."
    )
    reasoning.append(reasoning_entry)

    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
            You are a Problem Discovery Agent.
            Based on the following research notes about {', '.join(domains)}, identify and specify ONE high-impact, specific, real-world problem that exists at this intersection.
            
            Research Notes:
            {research_notes}
            
            Format your response by describing the problem, its scope, and why it is critical to solve.
            """
            problem = call_gemini(prompt)
            return {"discovered_problem": problem, "reasoning_log": reasoning}
        except Exception as e:
            logger.error(f"Gemini Problem Discovery Node failed: {e}")

    # Fallback / Simulation Mode
    d1 = domains[0]
    d2 = domains[1] if len(domains) > 1 else "Advanced Tech"

    if "healthcare" in d1.lower() or "healthcare" in d2.lower():
        problem = (
            "Decentralized critical care patient sorting and task prioritization in emergency departments "
            "during mass casualty events. Existing triaging models are slow, static, and centralized, "
            "leading to queue bottlenecks and increased casualty rates."
        )
    elif "agriculture" in d1.lower() or "agriculture" in d2.lower():
        problem = (
            "Inefficient micro-resource allocation (water, fertilizer, and pest treatment) in large-scale crop fields. "
            "Traditional models apply treatments uniformly, leading to high chemical waste and localized crop failures."
        )
    else:
        problem = (
            f"Operational coordination bottlenecks in {d1} environments. Traditional systems rely on static "
            f"centralized models that fail to adapt in real time to dynamic challenges, causing performance loss."
        )

    return {"discovered_problem": problem, "reasoning_log": reasoning}


# --- C. Solution Agent ---
def solution_node(state: AgentState) -> Dict[str, Any]:
    domains = state["domains"]
    discovered_problem = state["discovered_problem"]
    reasoning = list(state.get("reasoning_log", []))

    reasoning_entry = (
        "[Solution Agent] Formulating a technical, innovative solution addressing the discovered problem. "
        f"Applying operational properties of {domains[-1]} to solve the constraint."
    )
    reasoning.append(reasoning_entry)

    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
            You are a Solution Agent.
            Formulate a detailed, innovative solution to resolve the following problem.
            The solution must directly apply concepts from the domains: {', '.join(domains)}.
            
            Problem:
            {discovered_problem}
            
            Describe the solution's mechanics, architectural framework, and technical feasibility.
            """
            solution = call_gemini(prompt)
            return {"proposed_solution": solution, "reasoning_log": reasoning}
        except Exception as e:
            logger.error(f"Gemini Solution Node failed: {e}")

    # Fallback / Simulation Mode
    d1 = domains[0]
    d2 = domains[1] if len(domains) > 1 else "Advanced Tech"

    if "healthcare" in d1.lower() or "healthcare" in d2.lower():
        solution = (
            "An autonomous decentralized dispatch system utilizing bio-inspired swarm routing algorithms "
            "(based on ant colony optimization) to dynamically route clinical resources (nurses, beds, diagnostics) "
            "directly to patient locations, resolving queuing bottlenecks dynamically without central coordination."
        )
    elif "agriculture" in d1.lower() or "agriculture" in d2.lower():
        solution = (
            "A decentralized mesh network of autonomous reinforcement learning agents deployed on micro-drones. "
            "Agents learn localized resource dispensing policies by continuously observing soil/crop states, "
            "dispensing the precise micro-dosage needed for each plant."
        )
    else:
        solution = (
            f"An adaptive decentralized orchestration protocol utilizing {d2} modeling. "
            f"Entities are treated as autonomous agents that communicate locally to self-organize, "
            f"dynamically optimizing {d1} resource pathways in real time."
        )

    return {"proposed_solution": solution, "reasoning_log": reasoning}


# --- D. Innovation Agent ---
def innovation_node(state: AgentState) -> Dict[str, Any]:
    domains = state["domains"]
    research_notes = state["research_notes"]
    discovered_problem = state["discovered_problem"]
    proposed_solution = state["proposed_solution"]
    reasoning = list(state.get("reasoning_log", []))

    reasoning_entry = (
        "[Innovation Agent] Synthesizing notes, problems, and solutions into a structured innovation profile. "
        "Compiling expected impacts, outlining required technologies, and generating the final JSON payload."
    )
    reasoning.append(reasoning_entry)

    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
            You are an Innovation Agent.
            Synthesize the following problem and solution into a structured innovation concept profile.
            
            Problem:
            {discovered_problem}
            
            Solution:
            {proposed_solution}
            
            You MUST respond with a JSON object conforming exactly to this JSON schema:
            {{
                "problem": "A clean 1-2 sentence description of the core problem",
                "solution": "A clean 1-2 sentence description of the proposed solution",
                "summary": "A detailed paragraph summarizing the innovation concept and its technical novelty",
                "impact": "A summary of the expected real-world impact and efficiency metrics",
                "technologies": ["List", "of", "4-5", "required", "technologies", "or", "libraries"]
            }}
            """
            res_text = call_gemini(prompt)
            # Clean possible markdown wrap
            if "```json" in res_text:
                res_text = res_text.split("```json")[1].split("```")[0].strip()
            elif "```" in res_text:
                res_text = res_text.split("```")[1].split("```")[0].strip()
            final_data = json.loads(res_text)
            return {"final_innovation": final_data, "reasoning_log": reasoning}
        except Exception as e:
            logger.error(f"Gemini Innovation Node failed: {e}")

    # Fallback / Simulation Mode
    d1 = domains[0]
    d2 = domains[1] if len(domains) > 1 else "Advanced Tech"

    if "healthcare" in d1.lower() or "healthcare" in d2.lower():
        final_data = {
            "problem": "Decentralized critical care patient sorting in emergency departments during mass casualty events.",
            "solution": "An autonomous decentralized dispatch system utilizing bio-inspired swarm routing algorithms.",
            "summary": (
                "A dynamic resource-routing swarm network linking emergency beds, clinical staff, and diagnostics. "
                "The system models patients as task nodes emitting simulated pheromones and clinicians as search agents "
                "who route themselves dynamically to optimize treatment latency."
            ),
            "impact": "Reduces ER triage bottlenecks by 42%, shortens average bed allocation time to under 90 seconds, and decreases clinical staff burnout.",
            "technologies": [
                "Swarm Routing Protocols",
                "Ant Colony Optimization (ACO)",
                "FastAPI Patient Gateways",
                "Edge Wearable Monitors",
            ],
        }
    elif "agriculture" in d1.lower() or "agriculture" in d2.lower():
        final_data = {
            "problem": "Inefficient micro-resource allocation of fertilizer and water in crop fields.",
            "solution": "A decentralized mesh network of autonomous reinforcement learning micro-drones.",
            "summary": (
                "An intelligent autonomous farming grid where micro-drones operate as self-learning agents. "
                "Using local multispectral sensors, drones dynamically adjust soil fertilization schedules "
                "through localized policy models to maximize crop yield."
            ),
            "impact": "Reduces chemical fertilizer usage by 35% while increasing localized crop yield by up to 18% per hectare.",
            "technologies": [
                "Deep Q-Networks (DQN)",
                "Multispectral Imaging Sensors",
                "Mesh Network Protocols",
                "Autonomous Flight Controllers",
            ],
        }
    else:
        final_data = {
            "problem": f"Operational coordination bottlenecks in {d1} environments.",
            "solution": f"An adaptive decentralized orchestration protocol utilizing {d2} modeling.",
            "summary": (
                f"An advanced integration framework combining {d1} operations with {d2} logic. "
                "It enables autonomous self-organization of system nodes to dynamically solve routing "
                "and scheduling bottlenecks."
            ),
            "impact": "Increases overall system throughput efficiency by 25% and reduces manual intervention overhead by 60%.",
            "technologies": [
                f"{d2} Engine Library",
                "Decentralized Messaging Gateways",
                "Event-Driven Schedulers",
                "Node Telemetry Agents",
            ],
        }

    return {"final_innovation": final_data, "reasoning_log": reasoning}


# 3. Create the LangGraph workflow
def get_compiled_workflow():
    from langgraph.graph import StateGraph, END

    # Initialize graph state
    workflow = StateGraph(AgentState)

    # Register nodes
    workflow.add_node("research", research_agent_node)
    workflow.add_node("problem_discovery", problem_discovery_node)
    workflow.add_node("solution", solution_node)
    workflow.add_node("innovation", innovation_node)

    # Establish sequence flow
    workflow.set_entry_point("research")
    workflow.add_edge("research", "problem_discovery")
    workflow.add_edge("problem_discovery", "solution")
    workflow.add_edge("solution", "innovation")
    workflow.add_edge("innovation", END)

    # Compile the graph
    return workflow.compile()


class AIInnovationGeneratorRunner:
    def __init__(self):
        self.app = get_compiled_workflow()

    def generate(self, domains: List[str]) -> Dict[str, Any]:
        """Runs the LangGraph multi-agent pipeline."""
        initial_state: AgentState = {
            "domains": domains,
            "research_notes": "",
            "discovered_problem": "",
            "proposed_solution": "",
            "final_innovation": {},
            "reasoning_log": [],
        }

        # Run pipeline
        final_state = self.app.invoke(initial_state)

        # Extract compiled innovation details and reasoning logs
        innovation = final_state.get("final_innovation", {})
        reasoning = final_state.get("reasoning_log", [])

        return {
            "problem": innovation.get("problem", "N/A"),
            "solution": innovation.get("solution", "N/A"),
            "summary": innovation.get("summary", "N/A"),
            "impact": innovation.get("impact", "N/A"),
            "technologies": innovation.get("technologies", []),
            "reasoning_log": reasoning,
        }


generator_runner = AIInnovationGeneratorRunner()
