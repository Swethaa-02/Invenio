import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.saved_idea import SavedIdea
from app.schemas.saved_idea import SavedIdeaCreate


class CRUDSavedIdea(CRUDBase[SavedIdea, SavedIdeaCreate, SavedIdeaCreate]):
    async def create_with_user(
        self, db: AsyncSession, *, obj_in: SavedIdeaCreate, user_id: uuid.UUID
    ) -> SavedIdea:
        db_obj = SavedIdea(
            user_id=user_id,
            innovation_id=obj_in.innovation_id,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi_by_user(
        self, db: AsyncSession, *, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[SavedIdea]:
        query = (
            select(SavedIdea)
            .where(SavedIdea.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_user_and_innovation(
        self, db: AsyncSession, *, user_id: uuid.UUID, innovation_id: uuid.UUID
    ) -> Optional[SavedIdea]:
        query = select(SavedIdea).where(
            SavedIdea.user_id == user_id,
            SavedIdea.innovation_id == innovation_id,
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()


saved_idea = CRUDSavedIdea(SavedIdea)
