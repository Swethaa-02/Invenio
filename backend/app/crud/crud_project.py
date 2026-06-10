import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: ProjectCreate, owner_id: uuid.UUID
    ) -> Project:
        db_obj = Project(name=obj_in.name, owner_id=owner_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi_by_owner(
        self, db: AsyncSession, *, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        query = select(Project).where(Project.owner_id == owner_id).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


project = CRUDProject(Project)
