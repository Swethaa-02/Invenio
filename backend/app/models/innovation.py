import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.domain import Domain
    from app.models.saved_idea import SavedIdea
    from app.models.collision import Collision


class Innovation(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    desc: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[str] = mapped_column(Text, default="", nullable=False)
    score: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Draft", nullable=False)
    
    # Board position coordinates
    x: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    y: Mapped[int] = mapped_column(Integer, default=200, nullable=False)

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("project.id", ondelete="CASCADE"), nullable=False)
    domain_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("domain.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="innovations")
    domain: Mapped["Domain"] = relationship(back_populates="innovations")
    
    saved_ideas: Mapped[List["SavedIdea"]] = relationship(
        back_populates="innovation", cascade="all, delete-orphan"
    )

    collisions_source: Mapped[List["Collision"]] = relationship(
        back_populates="source_innovation",
        foreign_keys="[Collision.source_id]",
        cascade="all, delete-orphan"
    )
    collisions_target: Mapped[List["Collision"]] = relationship(
        back_populates="target_innovation",
        foreign_keys="[Collision.target_id]",
        cascade="all, delete-orphan"
    )
