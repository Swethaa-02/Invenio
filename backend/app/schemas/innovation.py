import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict


class InnovationBase(BaseModel):
    title: str
    desc: str
    details: str = ""
    score: float = 7.0
    status: str = "Draft"
    x: int = 200
    y: int = 200


class InnovationCreate(InnovationBase):
    project_id: uuid.UUID
    domain_id: Optional[uuid.UUID] = None


class InnovationUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    details: Optional[str] = None
    score: Optional[float] = None
    status: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    domain_id: Optional[uuid.UUID] = None


class Innovation(InnovationBase):
    id: uuid.UUID
    project_id: uuid.UUID
    domain_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)
