import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.domain import Domain
from app.schemas.domain import DomainCreate, DomainUpdate


class CRUDDomain(CRUDBase[Domain, DomainCreate, DomainUpdate]):
    async def get_multi_by_project(
        self, db: AsyncSession, *, project_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Domain]:
        query = select(Domain).where(Domain.project_id == project_id).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


domain = CRUDDomain(Domain)
