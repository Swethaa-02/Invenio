import math
import re
from typing import Any, Dict, List, Set, Tuple
from app.services.knowledge_graph import graph_engine

# Minimal set of english stopwords for cleaning descriptions
STOPWORDS: Set[str] = {
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "arent",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "cant",
    "cannot",
    "could",
    "couldnt",
    "did",
    "didnt",
    "do",
    "does",
    "doesnt",
    "doing",
    "dont",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "hadnt",
    "has",
    "hasnt",
    "have",
    "havent",
    "having",
    "he",
    "hed",
    "hell",
    "hes",
    "her",
    "here",
    "heres",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "hows",
    "i",
    "id",
    "ill",
    "im",
    "ive",
    "if",
    "in",
    "into",
    "is",
    "isnt",
    "it",
    "its",
    "itself",
    "lets",
    "me",
    "more",
    "most",
    "mustnt",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "ought",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "shant",
    "she",
    "shed",
    "shell",
    "shes",
    "should",
    "shouldnt",
    "so",
    "some",
    "such",
    "than",
    "that",
    "thats",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "theres",
    "these",
    "they",
    "theyd",
    "theyll",
    "theyre",
    "theyve",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "wasnt",
    "we",
    "wed",
    "well",
    "were",
    "weve",
    "werent",
    "what",
    "whats",
    "when",
    "whens",
    "where",
    "wheres",
    "which",
    "while",
    "who",
    "whos",
    "whom",
    "why",
    "whys",
    "with",
    "wont",
    "would",
    "wouldnt",
    "you",
    "youd",
    "youll",
    "youre",
    "youve",
    "your",
    "yours",
    "yourself",
    "yourselves",
}


class TFIDFEmbeddingSystem:
    """Lightweight in-memory TF-IDF Vectorizer to compute node text embeddings."""

    @staticmethod
    def preprocess(text: str) -> List[str]:
        # Lowercase, clean symbols, and tokenize
        text = text.lower()
        words = re.findall(r"\b[a-z]{2,}\b", text)
        return [w for w in words if w not in STOPWORDS]

    def __init__(self, documents: List[str]):
        self.doc_tokens = [self.preprocess(doc) for doc in documents]
        self.num_docs = len(self.doc_tokens)

        # Build vocabulary
        self.vocab = sorted(list(set(w for tokens in self.doc_tokens for w in tokens)))
        self.vocab_index = {word: i for i, word in enumerate(self.vocab)}

        # Compute document frequencies
        self.df = {w: 0 for w in self.vocab}
        for tokens in self.doc_tokens:
            unique_tokens = set(tokens)
            for w in unique_tokens:
                self.df[w] += 1

        # Compute IDFs
        self.idf = {}
        for w, df_val in self.df.items():
            # Add-1 smoothing to prevent division by zero
            self.idf[w] = math.log((1 + self.num_docs) / (1 + df_val)) + 1.0

    def embed(self, text: str) -> List[float]:
        tokens = self.preprocess(text)
        vector = [0.0] * len(self.vocab)

        # Calculate TF (Term Frequency)
        tf = {}
        for w in tokens:
            if w in self.vocab:
                tf[w] = tf.get(w, 0) + 1

        # Calculate TF-IDF
        for w, count in tf.items():
            idx = self.vocab_index[w]
            vector[idx] = count * self.idf[w]

        # L2 Normalization
        magnitude = math.sqrt(sum(val * val for val in vector))
        if magnitude > 0:
            vector = [val / magnitude for val in vector]

        return vector


class SimilarityEngine:
    """Computes Cosine Similarity between vectors."""

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if len(vec1) != len(vec2) or len(vec1) == 0:
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        mag1 = math.sqrt(sum(a * a for a in vec1))
        mag2 = math.sqrt(sum(b * b for b in vec2))

        if mag1 == 0 or mag2 == 0:
            return 0.0

        return dot_product / (mag1 * mag2)


class CollisionEngine:
    def __init__(self):
        self.max_distance = 5

    def _get_shortest_path_distance(
        self, nodes: List[Dict[str, Any]], links: List[Dict[str, Any]], src_id: str, tgt_id: str
    ) -> int:
        # Adjacency list
        adj = {n["id"]: set() for n in nodes}
        for link in links:
            src, tgt = link["source"], link["target"]
            if src in adj and tgt in adj:
                adj[src].add(tgt)
                adj[tgt].add(src)

        # BFS shortest path search
        from collections import deque

        queue = deque([(src_id, 0)])
        visited = {src_id}

        while queue:
            curr, dist = queue.popleft()
            if curr == tgt_id:
                return dist
            for neighbor in adj[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, dist + 1))

        return self.max_distance

    def _generate_synergy_notes(self, score: float) -> str:
        if score > 7.5:
            return (
                "High unexpected synergy potential. These fields are completely disconnected "
                "in your knowledge graph and represent a major blue-ocean opportunity."
            )
        elif score > 5.0:
            return (
                "Moderate opportunity. The domains are distinct and have some shared bridges, "
                "suggesting a viable, targetable intersection."
            )
        else:
            return (
                "Low unexpected potential. Either these concepts are already closely linked "
                "in the graph, or they are too semantically similar to yield a novel collision."
            )

    def evaluate_pair(self, id1: str, id2: str) -> Dict[str, Any]:
        """Evaluate collision scoring for a specific pair of nodes."""
        viz_data = graph_engine.visualize_graph()
        nodes = viz_data["nodes"]
        links = viz_data["links"]

        node1 = next((n for n in nodes if n["id"] == id1), None)
        node2 = next((n for n in nodes if n["id"] == id2), None)

        if not node1 or not node2:
            raise ValueError("One or both node IDs were not found in the graph.")

        # Compute TF-IDF similarity
        corpus = [
            f"{n['label']} {n['properties'].get('description', '')}"
            for n in nodes
        ]
        vectorizer = TFIDFEmbeddingSystem(corpus)

        text1 = f"{node1['label']} {node1['properties'].get('description', '')}"
        text2 = f"{node2['label']} {node2['properties'].get('description', '')}"

        vec1 = vectorizer.embed(text1)
        vec2 = vectorizer.embed(text2)

        similarity = SimilarityEngine.cosine_similarity(vec1, vec2)
        distance = self._get_shortest_path_distance(nodes, links, id1, id2)

        # Calculate score
        score = (1.0 - similarity) * (distance / self.max_distance) * 10.0

        explanation = (
            f"Evaluated collision between '{node1['label']}' and '{node2['label']}'. "
            f"The semantic cosine similarity is {similarity:.2f} and the topological path "
            f"distance is {distance} nodes. Score: {score:.2f}."
        )

        return {
            "node1_id": id1,
            "node1_name": node1["label"],
            "node2_id": id2,
            "node2_name": node2["label"],
            "semantic_similarity": float(round(similarity, 4)),
            "graph_distance": distance,
            "collision_score": float(round(score, 2)),
            "explanation": explanation,
        }

    def discover_collisions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Run collision pipeline across all nodes to find top innovation overlaps."""
        viz_data = graph_engine.visualize_graph()
        nodes = viz_data["nodes"]
        links = viz_data["links"]

        if len(nodes) < 2:
            return []

        # Build TF-IDF vectors for all nodes
        corpus = [
            f"{n['label']} {n['properties'].get('description', '')}"
            for n in nodes
        ]
        vectorizer = TFIDFEmbeddingSystem(corpus)

        node_vectors = {}
        for n in nodes:
            text = f"{n['label']} {n['properties'].get('description', '')}"
            node_vectors[n["id"]] = vectorizer.embed(text)

        opportunities = []

        # Compare pairs (order-independent)
        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                n1 = nodes[i]
                n2 = nodes[j]

                # We focus collisions between:
                # - Domain + Domain
                # - Domain + Technology
                # This focuses on finding tech overlaps in technological domains.
                allowed_labels = {"Domain", "Technology"}
                if n1["type"] not in allowed_labels or n2["type"] not in allowed_labels:
                    continue

                id1, id2 = n1["id"], n2["id"]
                vec1 = node_vectors[id1]
                vec2 = node_vectors[id2]

                similarity = SimilarityEngine.cosine_similarity(vec1, vec2)
                distance = self._get_shortest_path_distance(nodes, links, id1, id2)

                # Calculate collision score
                score = (1.0 - similarity) * (distance / self.max_distance) * 10.0

                opportunities.append(
                    {
                        "domain1_id": id1,
                        "domain1_name": n1["label"],
                        "domain2_id": id2,
                        "domain2_name": n2["label"],
                        "semantic_similarity": float(round(similarity, 4)),
                        "graph_distance": distance,
                        "collision_score": float(round(score, 2)),
                        "synergy_notes": self._generate_synergy_notes(score),
                    }
                )

        # Sort opportunities in descending order of collision score
        opportunities.sort(key=lambda x: x["collision_score"], reverse=True)
        return opportunities[:limit]


collision_engine = CollisionEngine()
