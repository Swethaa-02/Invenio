import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.innovation import Innovation


class Domain(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("project.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship(back_populates="domains")
    innovations: Mapped[List["Innovation"]] = relationship(
        back_populates="domain", cascade="all, delete-orphan"
    )
