import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.roadmap import Roadmap
from app.schemas.roadmap import RoadmapCreate, RoadmapUpdate


class CRUDRoadmap(CRUDBase[Roadmap, RoadmapCreate, RoadmapUpdate]):
    async def get_by_project(self, db: AsyncSession, *, project_id: uuid.UUID) -> Optional[Roadmap]:
        query = select(Roadmap).where(Roadmap.project_id == project_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()


roadmap = CRUDRoadmap(Roadmap)
