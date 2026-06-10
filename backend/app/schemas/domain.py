import uuid
from pydantic import BaseModel, ConfigDict


class DomainBase(BaseModel):
    name: str


class DomainCreate(DomainBase):
    project_id: uuid.UUID


class DomainUpdate(DomainBase):
    pass


class Domain(DomainBase):
    id: uuid.UUID
    project_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
