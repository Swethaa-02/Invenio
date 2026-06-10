import uuid
from typing import Any, Dict, TYPE_CHECKING
from sqlalchemy import ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.project import Project


class KnowledgeGraph(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    
    # Store nodes coordinates and links array
    graph_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="knowledge_graph")
