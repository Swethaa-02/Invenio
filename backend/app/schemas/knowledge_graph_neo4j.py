from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NodeLabel(str, Enum):
    DOMAIN = "Domain"
    TECHNOLOGY = "Technology"
    INDUSTRY = "Industry"
    PROBLEM = "Problem"
    SOLUTION = "Solution"


class NodeCreate(BaseModel):
    label: NodeLabel
    name: Optional[str] = None  # For Domain, Technology, Industry
    title: Optional[str] = None  # For Problem, Solution
    description: str


class NodeResponse(BaseModel):
    id: str
    label: NodeLabel
    properties: Dict[str, Any]


class RelationshipCreate(BaseModel):
    source_id: str
    target_id: str
    type: str  # e.g., "APPLIED_IN", "SOLVES", "IN_INDUSTRY", "RELATED_TO"
    properties: Optional[Dict[str, Any]] = None


class RelationshipResponse(BaseModel):
    source_id: str
    target_id: str
    type: str
    properties: Dict[str, Any]


class VizNode(BaseModel):
    id: str
    label: str  # Display name (name or title)
    type: NodeLabel
    properties: Dict[str, Any]


class VizLink(BaseModel):
    source: str
    target: str
    type: str


class VizResponse(BaseModel):
    nodes: List[VizNode]
    links: List[VizLink]


class SearchResponse(BaseModel):
    nodes: List[NodeResponse]


class NearestDomainResult(BaseModel):
    id: str
    name: str
    strength: int


class NearestDomainsResponse(BaseModel):
    domain_id: str
    nearest: List[NearestDomainResult]


class UncommonCombinationResult(BaseModel):
    domain1_id: str
    domain1_name: str
    domain2_id: str
    domain2_name: str
    distance: Optional[int] = None


class UncommonCombinationsResponse(BaseModel):
    combinations: List[UncommonCombinationResult]
