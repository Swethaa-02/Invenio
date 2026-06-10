from typing import List
from pydantic import BaseModel


class StartupRequest(BaseModel):
    title: str
    summary: str
    technologies: List[str]


class StartupResponse(BaseModel):
    startup_potential_score: float  # 0 to 100
    market_size_score: float  # 0 to 100
    competition_score: float  # 0 to 100 (high = favorable/low barriers)
    revenue_potential_score: float  # 0 to 100
    scalability_score: float  # 0 to 100
    customer_demand_score: float  # 0 to 100
    business_model: str
    target_customers: List[str]
    revenue_streams: List[str]
    go_to_market_strategy: List[str]
    explanation: str
