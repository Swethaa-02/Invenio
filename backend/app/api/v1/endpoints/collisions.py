from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import collision as crud_collision
from app.crud import innovation as crud_innovation
from app.crud import project as crud_project
from app.models.user import User
from app.schemas.collision import Collision as CollisionSchema, CollisionCreate, CollisionUpdate

router = APIRouter()


@router.get("/", response_model=List[CollisionSchema])
async def read_collisions(
    *,
    db: AsyncSession = Depends(deps.get_db),
    innovation_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve collisions for an innovation.
    """
    innovation = await crud_innovation.get(db, id=innovation_id)
    if not innovation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Innovation not found"
        )
    project = await crud_project.get(db, id=innovation.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return await crud_collision.get_multi_by_innovation(
        db, innovation_id=innovation_id, skip=skip, limit=limit
    )


@router.post("/", response_model=CollisionSchema, status_code=status.HTTP_201_CREATED)
async def create_collision(
    *,
    db: AsyncSession = Depends(deps.get_db),
    collision_in: CollisionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new collision.
    """
    source = await crud_innovation.get(db, id=collision_in.source_id)
    target = await crud_innovation.get(db, id=collision_in.target_id)
    if not source or not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Source or target innovation not found"
        )
    if source.project_id != target.project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and target innovations must belong to the same project",
        )
    project = await crud_project.get(db, id=source.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    collision = await crud_collision.create(db, obj_in=collision_in)
    return collision


@router.get("/{collision_id}", response_model=CollisionSchema)
async def read_collision(
    *,
    db: AsyncSession = Depends(deps.get_db),
    collision_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get collision by ID.
    """
    collision = await crud_collision.get(db, id=collision_id)
    if not collision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collision not found"
        )
    source = await crud_innovation.get(db, id=collision.source_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Source innovation not found"
        )
    project = await crud_project.get(db, id=source.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return collision


@router.put("/{collision_id}", response_model=CollisionSchema)
async def update_collision(
    *,
    db: AsyncSession = Depends(deps.get_db),
    collision_id: uuid.UUID,
    collision_in: CollisionUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a collision.
    """
    collision = await crud_collision.get(db, id=collision_id)
    if not collision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collision not found"
        )
    source = await crud_innovation.get(db, id=collision.source_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Source innovation not found"
        )
    project = await crud_project.get(db, id=source.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    collision = await crud_collision.update(db, db_obj=collision, obj_in=collision_in)
    return collision


@router.delete("/{collision_id}", response_model=CollisionSchema)
async def delete_collision(
    *,
    db: AsyncSession = Depends(deps.get_db),
    collision_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a collision.
    """
    collision = await crud_collision.get(db, id=collision_id)
    if not collision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collision not found"
        )
    source = await crud_innovation.get(db, id=collision.source_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Source innovation not found"
        )
    project = await crud_project.get(db, id=source.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    collision = await crud_collision.remove(db, id=collision_id)
    return collision
