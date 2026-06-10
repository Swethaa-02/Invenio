from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.services.novelty_detector import novelty_detector
from app.schemas.novelty_detector import NoveltyRequest, NoveltyResponse

router = APIRouter()


@router.post(
    "/detect",
    response_model=NoveltyResponse,
    status_code=status.HTTP_200_OK,
)
async def detect_novelty(
    *,
    db: AsyncSession = Depends(deps.get_db),
    req: NoveltyRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Estimate the novelty of a proposed innovation concept by comparing it against stored innovations.
    """
    try:
        evaluation = await novelty_detector.calculate_novelty(
            db, title=req.title, desc=req.desc, project_id=req.project_id
        )
        return evaluation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate novelty: {str(e)}",
        )
