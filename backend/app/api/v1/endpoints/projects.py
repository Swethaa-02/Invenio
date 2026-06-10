from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import project as crud_project
from app.models.user import User
from app.schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate

router = APIRouter()


@router.get("/", response_model=List[ProjectSchema])
async def read_projects(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve projects owned by user.
    """
    projects = await crud_project.get_multi_by_owner(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return projects


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new project.
    """
    project = await crud_project.create_with_owner(
        db, obj_in=project_in, owner_id=current_user.id
    )
    return project


@router.get("/{project_id}", response_model=ProjectSchema)
async def read_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get project by ID.
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
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: uuid.UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a project.
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
    project = await crud_project.update(db, db_obj=project, obj_in=project_in)
    return project


@router.delete("/{project_id}", response_model=ProjectSchema)
async def delete_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a project.
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
    project = await crud_project.remove(db, id=project_id)
    return project
