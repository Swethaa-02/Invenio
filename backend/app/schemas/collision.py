import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CollisionBase(BaseModel):
    score: float = 5.0
    notes: str = ""


class CollisionCreate(CollisionBase):
    source_id: uuid.UUID
    target_id: uuid.UUID


class CollisionUpdate(BaseModel):
    score: Optional[float] = None
    notes: Optional[str] = None


class Collision(CollisionBase):
    id: uuid.UUID
    source_id: uuid.UUID
    target_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
