from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.services.investor_demo import investor_demo
from app.schemas.investor_demo import InvestorDemoRequest, InvestorDemoResponse

router = APIRouter()


@router.post(
    "/generate",
    response_model=InvestorDemoResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_pitch(
    *,
    req: InvestorDemoRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Perform AI-based or simulated pitch deck and investor dossier generation for a proposed concept.
    """
    try:
        pitch = investor_demo.generate(
            title=req.title,
            summary=req.summary,
            technologies=req.technologies,
        )
        return pitch
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investor demo generation failed: {str(e)}",
        )
