import uuid
from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    name: str


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class Project(ProjectBase):
    id: uuid.UUID
    owner_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
