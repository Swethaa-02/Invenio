from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import knowledge_graph as crud_knowledge_graph
from app.crud import project as crud_project
from app.models.user import User
from app.schemas.knowledge_graph import KnowledgeGraph as KnowledgeGraphSchema, KnowledgeGraphCreate, KnowledgeGraphUpdate

router = APIRouter()


@router.get("/project/{project_id}", response_model=KnowledgeGraphSchema)
async def read_knowledge_graph_by_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get knowledge graph by project ID.
    """
    project = await crud_project.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    knowledge_graph = await crud_knowledge_graph.get_by_project(db, project_id=project_id)
    if not knowledge_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge graph not found for this project"
        )
    return knowledge_graph


@router.post("/", response_model=KnowledgeGraphSchema, status_code=status.HTTP_201_CREATED)
async def create_knowledge_graph(
    *,
    db: AsyncSession = Depends(deps.get_db),
    knowledge_graph_in: KnowledgeGraphCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new knowledge graph for a project.
    """
    project = await crud_project.get(db, id=knowledge_graph_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    existing_graph = await crud_knowledge_graph.get_by_project(db, project_id=knowledge_graph_in.project_id)
    if existing_graph:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Knowledge graph already exists for this project",
        )
    knowledge_graph = await crud_knowledge_graph.create(db, obj_in=knowledge_graph_in)
    return knowledge_graph


@router.put("/{graph_id}", response_model=KnowledgeGraphSchema)
async def update_knowledge_graph(
    *,
    db: AsyncSession = Depends(deps.get_db),
    graph_id: uuid.UUID,
    knowledge_graph_in: KnowledgeGraphUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a knowledge graph.
    """
    knowledge_graph = await crud_knowledge_graph.get(db, id=graph_id)
    if not knowledge_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge graph not found"
        )
    project = await crud_project.get(db, id=knowledge_graph.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    knowledge_graph = await crud_knowledge_graph.update(db, db_obj=knowledge_graph, obj_in=knowledge_graph_in)
    return knowledge_graph


@router.delete("/{graph_id}", response_model=KnowledgeGraphSchema)
async def delete_knowledge_graph(
    *,
    db: AsyncSession = Depends(deps.get_db),
    graph_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a knowledge graph.
    """
    knowledge_graph = await crud_knowledge_graph.get(db, id=graph_id)
    if not knowledge_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge graph not found"
        )
    project = await crud_project.get(db, id=knowledge_graph.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    knowledge_graph = await crud_knowledge_graph.remove(db, id=graph_id)
    return knowledge_graph
