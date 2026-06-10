from typing import List
from pydantic import BaseModel


class FeasibilityRequest(BaseModel):
    title: str
    summary: str
    technologies: List[str]


class FeasibilityResponse(BaseModel):
    feasibility_score: float  # 0 to 100
    risk_score: float  # 0 to 100
    implementation_difficulty: str  # "Low", "Medium", "High"
    technical_complexity: str  # Detailed explanation of complexity
    development_cost: str  # e.g., "$100,000 - $250,000"
    required_skills: List[str]
    infrastructure_requirements: List[str]
    time_to_build: str  # e.g., "6 - 9 Months"
    explanation: str  # Detailed hybrid reasoning summary
