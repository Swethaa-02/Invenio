import uuid
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.innovation import Innovation
from app.services.collision_engine import TFIDFEmbeddingSystem, SimilarityEngine

logger = logging.getLogger(__name__)


class NoveltyDetectorEngine:
    async def calculate_novelty(
        self, db: AsyncSession, title: str, desc: str, project_id: uuid.UUID
    ) -> Dict[str, Any]:
        """
        Retrieves stored innovations for the project and evaluates the proposed idea's novelty.
        """
        # 1. Fetch stored innovations for the project
        query = select(Innovation).where(Innovation.project_id == project_id)
        result = await db.execute(query)
        stored_innovations = list(result.scalars().all())

        # 2. Handle empty database fallback
        if not stored_innovations:
            return {
                "novelty_score": 100.0,
                "uniqueness_score": 100.0,
                "similarity_score": 0.0,
                "is_duplicate": False,
                "is_near_duplicate": False,
                "most_similar_id": None,
                "most_similar_title": None,
                "reasoning": (
                    "There are no existing stored innovations for this project to compare against. "
                    "The proposed idea is 100% novel."
                ),
            }

        # 3. Create document corpus and initialize TF-IDF Vectorizer
        stored_texts = [f"{i.title} {i.desc}" for i in stored_innovations]
        new_text = f"{title} {desc}"

        # Initialize vectorizer with full corpus
        vectorizer = TFIDFEmbeddingSystem(stored_texts + [new_text])

        new_vector = vectorizer.embed(new_text)
        stored_vectors = [vectorizer.embed(t) for t in stored_texts]

        # 4. Calculate similarities
        similarities = [
            SimilarityEngine.cosine_similarity(new_vector, vec)
            for vec in stored_vectors
        ]

        max_similarity = max(similarities)
        max_idx = similarities.index(max_similarity)
        most_similar_node = stored_innovations[max_idx]

        # Average similarity of the top 3 most similar innovations
        sorted_sims = sorted(similarities, reverse=True)
        top_3_sims = sorted_sims[:3]
        avg_similarity = sum(top_3_sims) / len(top_3_sims)

        # 5. Calculate final scores (0-100 scale)
        similarity_score = float(round(max_similarity * 100.0, 2))
        uniqueness_score = float(round((1.0 - avg_similarity) * 100.0, 2))
        novelty_score = float(round((1.0 - max_similarity) * 100.0, 2))

        # Classify duplicates
        is_duplicate = max_similarity >= 0.95
        is_near_duplicate = 0.85 <= max_similarity < 0.95

        # 6. Formulate detailed reasoning explanation
        if is_duplicate:
            reasoning = (
                f"The proposed concept is classified as a duplicate. It shares extremely high "
                f"semantic similarity ({similarity_score}%) with the existing innovation "
                f"'{most_similar_node.title}'."
            )
        elif is_near_duplicate:
            reasoning = (
                f"The proposed concept is classified as a near-duplicate. It shares high semantic "
                f"similarity ({similarity_score}%) with '{most_similar_node.title}', suggesting "
                f"low original differentiation."
            )
        else:
            reasoning = (
                f"The proposed concept is highly original. The maximum similarity to any existing "
                f"stored innovation is {similarity_score}% (closest match: '{most_similar_node.title}'), "
                f"yielding a strong novelty score of {novelty_score}%."
            )

        return {
            "novelty_score": novelty_score,
            "uniqueness_score": uniqueness_score,
            "similarity_score": similarity_score,
            "is_duplicate": is_duplicate,
            "is_near_duplicate": is_near_duplicate,
            "most_similar_id": most_similar_node.id,
            "most_similar_title": most_similar_node.title,
            "reasoning": reasoning,
        }


novelty_detector = NoveltyDetectorEngine()
