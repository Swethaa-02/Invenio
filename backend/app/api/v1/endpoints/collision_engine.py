from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api import deps
from app.models.user import User
from app.services.collision_engine import collision_engine
from app.schemas.collision_engine import (
    OpportunityResponse,
    CollisionEvaluationRequest,
    CollisionEvaluationResponse,
)

router = APIRouter()


@router.get("/discover", response_model=OpportunityResponse)
async def discover_collisions(
    *,
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Run collision pipeline over graph nodes to find unexpected tech intersections.
    """
    try:
        opportunities = collision_engine.discover_collisions(limit=limit)
        return {"opportunities": opportunities}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to discover collisions: {str(e)}",
        )


@router.post("/evaluate", response_model=CollisionEvaluationResponse)
async def evaluate_collision(
    *,
    req: CollisionEvaluationRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Evaluate collision score and synergy details for a specific pair of node IDs.
    """
    try:
        evaluation = collision_engine.evaluate_pair(id1=req.node1_id, id2=req.node2_id)
        return evaluation
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate collision: {str(e)}",
        )
