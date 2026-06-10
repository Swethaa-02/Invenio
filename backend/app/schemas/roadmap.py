import uuid
from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict


class RoadmapBase(BaseModel):
    tracks_data: List[Dict[str, Any]] = []


class RoadmapCreate(RoadmapBase):
    project_id: uuid.UUID


class RoadmapUpdate(RoadmapBase):
    pass


class Roadmap(RoadmapBase):
    id: uuid.UUID
    project_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
