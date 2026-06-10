import uuid
from typing import List, TYPE_CHECKING, Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.domain import Domain
    from app.models.innovation import Innovation
    from app.models.roadmap import Roadmap
    from app.models.knowledge_graph import KnowledgeGraph


class Project(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="projects")
    
    domains: Mapped[List["Domain"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    innovations: Mapped[List["Innovation"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    roadmap: Mapped[Optional["Roadmap"]] = relationship(
        back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    knowledge_graph: Mapped[Optional["KnowledgeGraph"]] = relationship(
        back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
