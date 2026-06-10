import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.crud.base import CRUDBase
from app.models.collision import Collision
from app.schemas.collision import CollisionCreate, CollisionUpdate


class CRUDCollision(CRUDBase[Collision, CollisionCreate, CollisionUpdate]):
    async def get_multi_by_innovation(
        self, db: AsyncSession, *, innovation_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Collision]:
        query = select(Collision).where(
            or_(
                Collision.source_id == innovation_id,
                Collision.target_id == innovation_id
            )
        ).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


collision = CRUDCollision(Collision)
