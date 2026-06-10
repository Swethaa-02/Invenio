import uuid
from pydantic import BaseModel, ConfigDict


class SavedIdeaBase(BaseModel):
    innovation_id: uuid.UUID


class SavedIdeaCreate(SavedIdeaBase):
    pass


class SavedIdea(SavedIdeaBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
