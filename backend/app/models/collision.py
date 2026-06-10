import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.innovation import Innovation


class Collision(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("innovation.id", ondelete="CASCADE"), nullable=False)
    target_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("innovation.id", ondelete="CASCADE"), nullable=False)
    
    score: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Relationships
    source_innovation: Mapped["Innovation"] = relationship(
        back_populates="collisions_source", foreign_keys=[source_id]
    )
    target_innovation: Mapped["Innovation"] = relationship(
        back_populates="collisions_target", foreign_keys=[target_id]
    )
