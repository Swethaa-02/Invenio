from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.services.innovation_generator import generator_runner
from app.schemas.innovation_generator import GenerateRequest, GenerateResponse

router = APIRouter()


@router.post(
    "/generate",
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_innovation(
    *,
    req: GenerateRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Trigger the multi-agent LangGraph pipeline to generate a detailed innovation concept.
    """
    if not req.domains or len(req.domains) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least two domains are required to trigger an innovation collision.",
        )

    try:
        concept = generator_runner.generate(domains=req.domains)
        return concept
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Innovation generation failed: {str(e)}",
        )
