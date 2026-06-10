from typing import Any, Dict, List
from pydantic import BaseModel


class SlideSchema(BaseModel):
    slide_id: int
    section: str  # Problem, Solution, Market, Technology, Business Model, Competition, Roadmap, Revenue
    title: str
    subtitle: str
    bullet_points: List[str]
    chart_type: str  # e.g., "pie", "bar", "radar", "list"
    chart_data: List[Dict[str, Any]]


class InvestorDemoRequest(BaseModel):
    title: str
    summary: str
    technologies: List[str]


class InvestorDemoResponse(BaseModel):
    executive_summary: str
    investment_highlights: List[str]
    pitch_deck: List[SlideSchema]
