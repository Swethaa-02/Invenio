import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.knowledge_graph import KnowledgeGraph
from app.schemas.knowledge_graph import KnowledgeGraphCreate, KnowledgeGraphUpdate


class CRUDKnowledgeGraph(CRUDBase[KnowledgeGraph, KnowledgeGraphCreate, KnowledgeGraphUpdate]):
    async def get_by_project(self, db: AsyncSession, *, project_id: uuid.UUID) -> Optional[KnowledgeGraph]:
        query = select(KnowledgeGraph).where(KnowledgeGraph.project_id == project_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()


knowledge_graph = CRUDKnowledgeGraph(KnowledgeGraph)
