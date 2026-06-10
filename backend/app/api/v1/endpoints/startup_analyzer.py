from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.services.startup_analyzer import startup_analyzer
from app.schemas.startup_analyzer import StartupRequest, StartupResponse

router = APIRouter()


@router.post(
    "/analyze",
    response_model=StartupResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_startup(
    *,
    req: StartupRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Perform a hybrid rule-based and AI-based startup potential analysis of a proposed innovation concept.
    """
    try:
        analysis = startup_analyzer.analyze(
            title=req.title,
            summary=req.summary,
            technologies=req.technologies,
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Startup potential analysis failed: {str(e)}",
        )
