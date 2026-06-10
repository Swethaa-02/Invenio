from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.services.feasibility_analyzer import feasibility_analyzer
from app.schemas.feasibility_analyzer import FeasibilityRequest, FeasibilityResponse

router = APIRouter()


@router.post(
    "/analyze",
    response_model=FeasibilityResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_feasibility(
    *,
    req: FeasibilityRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Perform a hybrid rule-based and AI-based feasibility analysis of a proposed innovation concept.
    """
    try:
        # Since analyze is synchronous, we run it directly or wrap it if needed.
        # But FastAPI handles normal def functions by running them in an external threadpool.
        # Let's check how the service is structured: analyze is a standard synchronous method.
        # We can just call it synchronous or run it directly.
        analysis = feasibility_analyzer.analyze(
            title=req.title,
            summary=req.summary,
            technologies=req.technologies,
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feasibility analysis failed: {str(e)}",
        )
