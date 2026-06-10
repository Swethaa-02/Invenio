from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.services.roadmap_generator import roadmap_generator
from app.schemas.roadmap_generator import RoadmapGeneratorRequest, RoadmapGeneratorResponse

router = APIRouter()


@router.post(
    "/generate",
    response_model=RoadmapGeneratorResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_roadmap(
    *,
    req: RoadmapGeneratorRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Perform AI-based or simulated chronological 6-phase roadmap generation for a proposed concept.
    """
    try:
        roadmap = roadmap_generator.generate(
            title=req.title,
            summary=req.summary,
        )
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Roadmap generation failed: {str(e)}",
        )
