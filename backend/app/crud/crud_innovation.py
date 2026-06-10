import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.innovation import Innovation
from app.schemas.innovation import InnovationCreate, InnovationUpdate


class CRUDInnovation(CRUDBase[Innovation, InnovationCreate, InnovationUpdate]):
    async def get_multi_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: uuid.UUID,
        domain_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Innovation]:
        query = select(Innovation).where(Innovation.project_id == project_id)
        if domain_id:
            query = query.where(Innovation.domain_id == domain_id)
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


innovation = CRUDInnovation(Innovation)
