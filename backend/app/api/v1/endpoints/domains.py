from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import domain as crud_domain
from app.crud import project as crud_project
from app.models.user import User
from app.schemas.domain import Domain as DomainSchema, DomainCreate, DomainUpdate

router = APIRouter()


@router.get("/", response_model=List[DomainSchema])
async def read_domains(
    db: AsyncSession = Depends(deps.get_db),
    project_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve domains. If project_id is provided, checks permissions.
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
        return await crud_domain.get_multi_by_project(
            db, project_id=project_id, skip=skip, limit=limit
        )

    # If no project_id is provided, get all domains for all projects owned by user
    # For scalability and security, we only return domains that belong to user's projects
    projects = await crud_project.get_multi_by_owner(db, owner_id=current_user.id, limit=1000)
    project_ids = [p.id for p in projects]
    domains = []
    for pid in project_ids:
        p_domains = await crud_domain.get_multi_by_project(db, project_id=pid, limit=1000)
        domains.extend(p_domains)
    return domains[skip : skip + limit]


@router.post("/", response_model=DomainSchema, status_code=status.HTTP_201_CREATED)
async def create_domain(
    *,
    db: AsyncSession = Depends(deps.get_db),
    domain_in: DomainCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new domain.
    """
    project = await crud_project.get(db, id=domain_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    domain = await crud_domain.create(db, obj_in=domain_in)
    return domain


@router.get("/{domain_id}", response_model=DomainSchema)
async def read_domain(
    *,
    db: AsyncSession = Depends(deps.get_db),
    domain_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get domain by ID.
    """
    domain = await crud_domain.get(db, id=domain_id)
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    project = await crud_project.get(db, id=domain.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return domain


@router.put("/{domain_id}", response_model=DomainSchema)
async def update_domain(
    *,
    db: AsyncSession = Depends(deps.get_db),
    domain_id: uuid.UUID,
    domain_in: DomainUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a domain.
    """
    domain = await crud_domain.get(db, id=domain_id)
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    project = await crud_project.get(db, id=domain.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    domain = await crud_domain.update(db, db_obj=domain, obj_in=domain_in)
    return domain


@router.delete("/{domain_id}", response_model=DomainSchema)
async def delete_domain(
    *,
    db: AsyncSession = Depends(deps.get_db),
    domain_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a domain.
    """
    domain = await crud_domain.get(db, id=domain_id)
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    project = await crud_project.get(db, id=domain.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    domain = await crud_domain.remove(db, id=domain_id)
    return domain
