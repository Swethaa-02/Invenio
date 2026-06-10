from typing import List
from pydantic import BaseModel


class PhaseResponse(BaseModel):
    phase_name: str  # e.g., "Phase 1 Research", "Phase 2 Prototype", etc.
    timeline: str  # e.g., "Month 1 - 2"
    milestones: List[str]
    tasks: List[str]
    dependencies: List[str]
    deliverables: List[str]
    progress: float  # 0 to 100


class RoadmapGeneratorRequest(BaseModel):
    title: str
    summary: str


class RoadmapGeneratorResponse(BaseModel):
    phases: List[PhaseResponse]
