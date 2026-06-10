import uuid
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict


class KnowledgeGraphBase(BaseModel):
    graph_data: Dict[str, Any] = {}


class KnowledgeGraphCreate(KnowledgeGraphBase):
    project_id: uuid.UUID


class KnowledgeGraphUpdate(KnowledgeGraphBase):
    pass


class KnowledgeGraph(KnowledgeGraphBase):
    id: uuid.UUID
    project_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
