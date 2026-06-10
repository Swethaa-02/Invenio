# Import all the models, so that Base has them before being
# imported by Alembic/env.py
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.project import Project  # noqa
from app.models.domain import Domain  # noqa
from app.models.innovation import Innovation  # noqa
from app.models.collision import Collision  # noqa
from app.models.roadmap import Roadmap  # noqa
from app.models.knowledge_graph import KnowledgeGraph  # noqa
from app.models.saved_idea import SavedIdea  # noqa
