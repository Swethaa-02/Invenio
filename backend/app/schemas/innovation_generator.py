from typing import List
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    domains: List[str]


class GenerateResponse(BaseModel):
    problem: str
    solution: str
    summary: str
    impact: str
    technologies: List[str]
    reasoning_log: List[str]
