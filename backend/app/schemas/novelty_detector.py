import uuid
from typing import Optional
from pydantic import BaseModel


class NoveltyRequest(BaseModel):
    title: str
    desc: str
    project_id: uuid.UUID


class NoveltyResponse(BaseModel):
    novelty_score: float  # 0 to 100
    uniqueness_score: float  # 0 to 100
    similarity_score: float  # 0 to 100
    is_duplicate: bool
    is_near_duplicate: bool
    most_similar_id: Optional[uuid.UUID] = None
    most_similar_title: Optional[str] = None
    reasoning: str
