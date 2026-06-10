import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.innovation import Innovation


class SavedIdea(Base):
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    innovation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("innovation.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="saved_ideas")
    innovation: Mapped["Innovation"] = relationship(back_populates="saved_ideas")
