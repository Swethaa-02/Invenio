from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import innovation as crud_innovation
from app.crud import project as crud_project
from app.crud import domain as crud_domain
from app.models.user import User
from app.schemas.innovation import Innovation as InnovationSchema, InnovationCreate, InnovationUpdate

router = APIRouter()


@router.get("/", response_model=List[InnovationSchema])
async def read_innovations(
    db: AsyncSession = Depends(deps.get_db),
    project_id: Optional[uuid.UUID] = None,
    domain_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve innovations. If project_id is provided, checks permissions.
    """
    if project_id:
        project = await crud_project.get(db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
        if project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        return await crud_innovation.get_multi_by_project(
            db, project_id=project_id, domain_id=domain_id, skip=skip, limit=limit
        )

    # If no project_id is provided, return all innovations belonging to the user's projects
    projects = await crud_project.get_multi_by_owner(db, owner_id=current_user.id, limit=1000)
    project_ids = [p.id for p in projects]
    innovations = []
    for pid in project_ids:
        p_innovations = await crud_innovation.get_multi_by_project(
            db, project_id=pid, domain_id=domain_id, limit=1000
        )
        innovations.extend(p_innovations)
    return innovations[skip : skip + limit]


@router.post("/", response_model=InnovationSchema, status_code=status.HTTP_201_CREATED)
async def create_innovation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    innovation_in: InnovationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new innovation.
    """
    project = await crud_project.get(db, id=innovation_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    if innovation_in.domain_id:
        domain = await crud_domain.get(db, id=innovation_in.domain_id)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
            )
        if domain.project_id != innovation_in.project_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain does not belong to the specified project",
            )
    innovation = await crud_innovation.create(db, obj_in=innovation_in)
    return innovation


@router.get("/{innovation_id}", response_model=InnovationSchema)
async def read_innovation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    innovation_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get innovation by ID.
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
    return innovation


@router.put("/{innovation_id}", response_model=InnovationSchema)
async def update_innovation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    innovation_id: uuid.UUID,
    innovation_in: InnovationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an innovation.
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
    if innovation_in.domain_id:
        domain = await crud_domain.get(db, id=innovation_in.domain_id)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
            )
        if domain.project_id != innovation.project_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain does not belong to the innovation's project",
            )
    innovation = await crud_innovation.update(db, db_obj=innovation, obj_in=innovation_in)
    return innovation


@router.delete("/{innovation_id}", response_model=InnovationSchema)
async def delete_innovation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    innovation_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an innovation.
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
    innovation = await crud_innovation.remove(db, id=innovation_id)
    return innovation
