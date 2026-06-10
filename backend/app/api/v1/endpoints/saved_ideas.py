from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.api import deps
from app.crud import saved_idea as crud_saved_idea
from app.crud import innovation as crud_innovation
from app.models.user import User
from app.schemas.saved_idea import SavedIdea as SavedIdeaSchema, SavedIdeaCreate

router = APIRouter()


@router.get("/", response_model=List[SavedIdeaSchema])
async def read_saved_ideas(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve saved ideas for the current user.
    """
    return await crud_saved_idea.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post("/", response_model=SavedIdeaSchema, status_code=status.HTTP_201_CREATED)
async def create_saved_idea(
    *,
    db: AsyncSession = Depends(deps.get_db),
    saved_idea_in: SavedIdeaCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Save/bookmark an innovation.
    """
    innovation = await crud_innovation.get(db, id=saved_idea_in.innovation_id)
    if not innovation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Innovation not found"
        )
    existing_saved = await crud_saved_idea.get_by_user_and_innovation(
        db, user_id=current_user.id, innovation_id=saved_idea_in.innovation_id
    )
    if existing_saved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Innovation is already bookmarked by the user",
        )
    saved = await crud_saved_idea.create_with_user(
        db, obj_in=saved_idea_in, user_id=current_user.id
    )
    return saved


@router.delete("/{saved_idea_id}", response_model=SavedIdeaSchema)
async def delete_saved_idea(
    *,
    db: AsyncSession = Depends(deps.get_db),
    saved_idea_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove saved/bookmarked innovation.
    """
    saved = await crud_saved_idea.get(db, id=saved_idea_id)
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Saved idea not found"
        )
    if saved.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    saved = await crud_saved_idea.remove(db, id=saved_idea_id)
    return saved
