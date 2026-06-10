from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    projects,
    domains,
    innovations,
    collisions,
    roadmaps,
    knowledge_graphs,
    saved_ideas,
    knowledge_graph_neo4j,
    collision_engine,
    innovation_generator,
    novelty_detector,
    feasibility_analyzer,
    startup_analyzer,
    roadmap_generator,
    investor_demo,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(domains.router, prefix="/domains", tags=["domains"])
api_router.include_router(
    innovations.router, prefix="/innovations", tags=["innovations"]
)
api_router.include_router(
    collisions.router, prefix="/collisions", tags=["collisions"]
)
api_router.include_router(roadmaps.router, prefix="/roadmaps", tags=["roadmaps"])
api_router.include_router(
    knowledge_graphs.router, prefix="/knowledge-graphs", tags=["knowledge-graphs"]
)
api_router.include_router(
    saved_ideas.router, prefix="/saved-ideas", tags=["saved-ideas"]
)
api_router.include_router(
    knowledge_graph_neo4j.router,
    prefix="/knowledge-graph-neo4j",
    tags=["knowledge-graph-neo4j"],
)
api_router.include_router(
    collision_engine.router,
    prefix="/collision-engine",
    tags=["collision-engine"],
)
api_router.include_router(
    innovation_generator.router,
    prefix="/innovation-generator",
    tags=["innovation-generator"],
)
api_router.include_router(
    novelty_detector.router,
    prefix="/novelty-detector",
    tags=["novelty-detector"],
)
api_router.include_router(
    feasibility_analyzer.router,
    prefix="/feasibility-analyzer",
    tags=["feasibility-analyzer"],
)
api_router.include_router(
    startup_analyzer.router,
    prefix="/startup-analyzer",
    tags=["startup-analyzer"],
)
api_router.include_router(
    roadmap_generator.router,
    prefix="/roadmap-generator",
    tags=["roadmap-generator"],
)
api_router.include_router(
    investor_demo.router,
    prefix="/investor-demo",
    tags=["investor-demo"],
)
