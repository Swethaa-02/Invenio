from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api import deps
from app.models.user import User
from app.services.knowledge_graph import graph_engine
from app.schemas.knowledge_graph_neo4j import (
    NodeCreate,
    NodeResponse,
    RelationshipCreate,
    RelationshipResponse,
    VizResponse,
    SearchResponse,
    NearestDomainsResponse,
    UncommonCombinationsResponse,
)

router = APIRouter()


@router.post("/nodes", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
async def create_node(
    *,
    node_in: NodeCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new node in the knowledge graph.
    """
    try:
        node = graph_engine.create_node(
            label=node_in.label,
            name=node_in.name,
            title=node_in.title,
            description=node_in.description,
        )
        return node
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create node: {str(e)}",
        )


@router.post(
    "/relationships",
    response_model=RelationshipResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_relationship(
    *,
    rel_in: RelationshipCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new relationship link in the knowledge graph.
    """
    try:
        rel = graph_engine.create_relationship(
            source_id=rel_in.source_id,
            target_id=rel_in.target_id,
            rel_type=rel_in.type,
            properties=rel_in.properties,
        )
        return rel
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create relationship: {str(e)}",
        )


@router.get("/search", response_model=SearchResponse)
async def search_graph(
    *,
    q: str = Query(..., min_length=1, description="Keyword query to search in graph"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Search nodes in the knowledge graph.
    """
    try:
        nodes = graph_engine.search_graph(keyword=q)
        return {"nodes": nodes}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Graph search failed: {str(e)}",
        )


@router.get("/visualize", response_model=VizResponse)
async def visualize_graph(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get full node-link graph visualization mapping.
    """
    try:
        viz_data = graph_engine.visualize_graph()
        return viz_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Graph visualization query failed: {str(e)}",
        )


@router.get("/nearest-domains/{domain_id}", response_model=NearestDomainsResponse)
async def read_nearest_domains(
    *,
    domain_id: str,
    limit: int = Query(5, ge=1, le=50),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get closest domains to a target domain using node path intersections strength.
    """
    try:
        nearest = graph_engine.find_nearest_domains(domain_id=domain_id, limit=limit)
        return {"domain_id": domain_id, "nearest": nearest}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Nearest domains query failed: {str(e)}",
        )


@router.get("/uncommon-combinations", response_model=UncommonCombinationsResponse)
async def read_uncommon_combinations(
    *,
    limit: int = Query(5, ge=1, le=50),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Discover uncommon domain combinations with high path distance.
    """
    try:
        combinations = graph_engine.find_uncommon_combinations(limit=limit)
        return {"combinations": combinations}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Uncommon combinations query failed: {str(e)}",
        )
