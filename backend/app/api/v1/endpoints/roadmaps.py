from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import roadmap as crud_roadmap
from app.crud import project as crud_project
from app.models.user import User
from app.schemas.roadmap import Roadmap as RoadmapSchema, RoadmapCreate, RoadmapUpdate

router = APIRouter()


@router.get("/project/{project_id}", response_model=RoadmapSchema)
async def read_roadmap_by_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get roadmap by project ID.
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
    roadmap = await crud_roadmap.get_by_project(db, project_id=project_id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found for this project"
        )
    return roadmap


@router.post("/", response_model=RoadmapSchema, status_code=status.HTTP_201_CREATED)
async def create_roadmap(
    *,
    db: AsyncSession = Depends(deps.get_db),
    roadmap_in: RoadmapCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new roadmap for a project.
    """
    project = await crud_project.get(db, id=roadmap_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    existing_roadmap = await crud_roadmap.get_by_project(db, project_id=roadmap_in.project_id)
    if existing_roadmap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roadmap already exists for this project",
        )
    roadmap = await crud_roadmap.create(db, obj_in=roadmap_in)
    return roadmap


@router.put("/{roadmap_id}", response_model=RoadmapSchema)
async def update_roadmap(
    *,
    db: AsyncSession = Depends(deps.get_db),
    roadmap_id: uuid.UUID,
    roadmap_in: RoadmapUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a roadmap.
    """
    roadmap = await crud_roadmap.get(db, id=roadmap_id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found"
        )
    project = await crud_project.get(db, id=roadmap.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    roadmap = await crud_roadmap.update(db, db_obj=roadmap, obj_in=roadmap_in)
    return roadmap


@router.delete("/{roadmap_id}", response_model=RoadmapSchema)
async def delete_roadmap(
    *,
    db: AsyncSession = Depends(deps.get_db),
    roadmap_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a roadmap.
    """
    roadmap = await crud_roadmap.get(db, id=roadmap_id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found"
        )
    project = await crud_project.get(db, id=roadmap.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    roadmap = await crud_roadmap.remove(db, id=roadmap_id)
    return roadmap
