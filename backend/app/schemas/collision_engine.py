from typing import List, Optional
from pydantic import BaseModel


class CollisionOpportunity(BaseModel):
    domain1_id: str
    domain1_name: str
    domain2_id: str
    domain2_name: str
    semantic_similarity: float
    graph_distance: int
    collision_score: float
    synergy_notes: str


class OpportunityResponse(BaseModel):
    opportunities: List[CollisionOpportunity]


class CollisionEvaluationRequest(BaseModel):
    node1_id: str
    node2_id: str


class CollisionEvaluationResponse(BaseModel):
    node1_id: str
    node1_name: str
    node2_id: str
    node2_name: str
    semantic_similarity: float
    graph_distance: int
    collision_score: float
    explanation: str
