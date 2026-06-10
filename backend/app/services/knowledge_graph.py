import uuid
import logging
from typing import Dict, List, Any, Optional
from app.services.neo4j_service import neo4j_service
from app.schemas.knowledge_graph_neo4j import NodeLabel

logger = logging.getLogger(__name__)


class MockGraphEngine:
    """In-memory fallback graph database simulator for instant testing."""

    def __init__(self):
        self.nodes = {}
        self.relationships = []
        self._populate_defaults()

    def _populate_defaults(self):
        # Default nodes
        default_nodes = [
            {
                "id": "dom_ai",
                "label": NodeLabel.DOMAIN,
                "properties": {
                    "id": "dom_ai",
                    "name": "Artificial Intelligence",
                    "description": "Adaptive neural reasoning systems.",
                },
            },
            {
                "id": "dom_web3",
                "label": NodeLabel.DOMAIN,
                "properties": {
                    "id": "dom_web3",
                    "name": "Web3 Ledgers",
                    "description": "Decentralized trust protocols.",
                },
            },
            {
                "id": "dom_spatial",
                "label": NodeLabel.DOMAIN,
                "properties": {
                    "id": "dom_spatial",
                    "name": "Spatial Computing",
                    "description": "Immersive 3D user interfaces.",
                },
            },
            {
                "id": "tech_llm",
                "label": NodeLabel.TECHNOLOGY,
                "properties": {
                    "id": "tech_llm",
                    "name": "Large Language Models",
                    "description": "Generative autoregressive text transformers.",
                },
            },
            {
                "id": "tech_zkp",
                "label": NodeLabel.TECHNOLOGY,
                "properties": {
                    "id": "tech_zkp",
                    "name": "Zero Knowledge Proofs",
                    "description": "Cryptographic authentication without exposing secret parameters.",
                },
            },
            {
                "id": "tech_webgl",
                "label": NodeLabel.TECHNOLOGY,
                "properties": {
                    "id": "tech_webgl",
                    "name": "WebGL Rendering",
                    "description": "Low-level GPU-accelerated graphic drawings on canvas.",
                },
            },
            {
                "id": "ind_healthcare",
                "label": NodeLabel.INDUSTRY,
                "properties": {
                    "id": "ind_healthcare",
                    "name": "Healthcare",
                    "description": "Clinical operations, therapeutics, and diagnostics.",
                },
            },
            {
                "id": "ind_finance",
                "label": NodeLabel.INDUSTRY,
                "properties": {
                    "id": "ind_finance",
                    "name": "Financial Services",
                    "description": "Retail banking, asset management, and transaction ledgers.",
                },
            },
            {
                "id": "prob_privacy",
                "label": NodeLabel.PROBLEM,
                "properties": {
                    "id": "prob_privacy",
                    "title": "Patient Data Privacy",
                    "description": "Securing sensitive patient records during AI model training pipelines.",
                },
            },
            {
                "id": "prob_latency",
                "label": NodeLabel.PROBLEM,
                "properties": {
                    "id": "prob_latency",
                    "title": "Slow Spatial Interfaces",
                    "description": "High frame rendering latency causes simulator sickness in spatial UI console.",
                },
            },
            {
                "id": "sol_federated",
                "label": NodeLabel.SOLUTION,
                "properties": {
                    "id": "sol_federated",
                    "title": "Federated Learning over ZK",
                    "description": "Train models locally and aggregate parameters using ZKPs to guarantee safety.",
                },
            },
            {
                "id": "sol_canvas",
                "label": NodeLabel.SOLUTION,
                "properties": {
                    "id": "sol_canvas",
                    "title": "Dynamic WebGL Canvas",
                    "description": "Render node graph connections using GPU shaders for optimized performance.",
                },
            },
        ]

        for n in default_nodes:
            self.nodes[n["id"]] = n

        # Default relationships
        self.relationships = [
            {
                "source_id": "tech_llm",
                "target_id": "dom_ai",
                "type": "APPLIED_IN",
                "properties": {},
            },
            {
                "source_id": "tech_zkp",
                "target_id": "dom_web3",
                "type": "APPLIED_IN",
                "properties": {},
            },
            {
                "source_id": "tech_webgl",
                "target_id": "dom_spatial",
                "type": "APPLIED_IN",
                "properties": {},
            },
            {
                "source_id": "tech_zkp",
                "target_id": "prob_privacy",
                "type": "SOLVES",
                "properties": {},
            },
            {
                "source_id": "sol_federated",
                "target_id": "prob_privacy",
                "type": "SOLVES",
                "properties": {},
            },
            {
                "source_id": "ind_healthcare",
                "target_id": "prob_privacy",
                "type": "HAS_PROBLEM",
                "properties": {},
            },
            {
                "source_id": "sol_canvas",
                "target_id": "prob_latency",
                "type": "SOLVES",
                "properties": {},
            },
            {
                "source_id": "dom_ai",
                "target_id": "ind_healthcare",
                "type": "IN_INDUSTRY",
                "properties": {},
            },
            {
                "source_id": "dom_web3",
                "target_id": "ind_finance",
                "type": "IN_INDUSTRY",
                "properties": {},
            },
        ]

    def create_node(
        self,
        label: NodeLabel,
        name: Optional[str],
        title: Optional[str],
        description: str,
    ) -> Dict[str, Any]:
        node_id = str(uuid.uuid4())
        display_name = name or title or ""
        props = {
            "id": node_id,
            "description": description,
        }
        if label in (NodeLabel.PROBLEM, NodeLabel.SOLUTION):
            props["title"] = display_name
        else:
            props["name"] = display_name

        node = {"id": node_id, "label": label, "properties": props}
        self.nodes[node_id] = node
        return node

    def create_relationship(
        self,
        source_id: str,
        target_id: str,
        rel_type: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        props = properties or {}
        rel = {
            "source_id": source_id,
            "target_id": target_id,
            "type": rel_type,
            "properties": props,
        }
        self.relationships.append(rel)
        return rel

    def search_graph(self, keyword: str) -> List[Dict[str, Any]]:
        kw = keyword.lower()
        results = []
        for n in self.nodes.values():
            props = n["properties"]
            name_val = props.get("name", props.get("title", "")).lower()
            desc_val = props.get("description", "").lower()
            if kw in name_val or kw in desc_val:
                results.append(n)
        return results

    def visualize_graph(self) -> Dict[str, Any]:
        viz_nodes = []
        for n in self.nodes.values():
            props = n["properties"]
            display_name = props.get("name", props.get("title", "Unnamed"))
            viz_nodes.append(
                {
                    "id": n["id"],
                    "label": display_name,
                    "type": n["label"],
                    "properties": props,
                }
            )

        viz_links = []
        for r in self.relationships:
            if r["source_id"] in self.nodes and r["target_id"] in self.nodes:
                viz_links.append(
                    {
                        "source": r["source_id"],
                        "target": r["target_id"],
                        "type": r["type"],
                    }
                )

        return {"nodes": viz_nodes, "links": viz_links}

    def find_nearest_domains(
        self, domain_id: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        if domain_id not in self.nodes:
            return []

        # Simulated strength ranking based on common shared neighbors
        target_neighbors = set()
        for r in self.relationships:
            if r["source_id"] == domain_id:
                target_neighbors.add(r["target_id"])
            elif r["target_id"] == domain_id:
                target_neighbors.add(r["source_id"])

        rankings = []
        for nid, node in self.nodes.items():
            if node["label"] == NodeLabel.DOMAIN and nid != domain_id:
                node_neighbors = set()
                for r in self.relationships:
                    if r["source_id"] == nid:
                        node_neighbors.add(r["target_id"])
                    elif r["target_id"] == nid:
                        node_neighbors.add(r["source_id"])

                shared = target_neighbors.intersection(node_neighbors)
                strength = len(shared)
                # Fallback: add random small weight if domain is connected to make the visual interesting
                if len(node_neighbors) > 0 and strength == 0:
                    strength = 1

                if strength > 0:
                    name_val = node["properties"].get("name", "")
                    rankings.append(
                        {"id": nid, "name": name_val, "strength": strength}
                    )

        rankings.sort(key=lambda x: x["strength"], reverse=True)
        return rankings[:limit]

    def find_uncommon_combinations(self, limit: int = 5) -> List[Dict[str, Any]]:
        # Find pairs of domains that do NOT share adjacent links
        domains = [
            n for n in self.nodes.values() if n["label"] == NodeLabel.DOMAIN
        ]
        results = []
        for i in range(len(domains)):
            for j in range(i + 1, len(domains)):
                d1 = domains[i]
                d2 = domains[j]

                # Check if there is an direct link
                has_direct = False
                for r in self.relationships:
                    if (
                        r["source_id"] == d1["id"] and r["target_id"] == d2["id"]
                    ) or (
                        r["source_id"] == d2["id"] and r["target_id"] == d1["id"]
                    ):
                        has_direct = True
                        break

                if not has_direct:
                    results.append(
                        {
                            "domain1_id": d1["id"],
                            "domain1_name": d1["properties"].get("name", ""),
                            "domain2_id": d2["id"],
                            "domain2_name": d2["properties"].get("name", ""),
                            "distance": 3,  # simulated distance
                        }
                    )

        return results[:limit]


class Neo4jKnowledgeGraphEngine:
    """Production-grade knowledge graph service powered by Neo4j & LangChain."""

    def __init__(self):
        self._graph = None

    def _get_graph(self):
        if self._graph is None:
            from langchain_community.graphs import Neo4jGraph
            from app.core.config import settings

            self._graph = Neo4jGraph(
                url=settings.NEO4J_URI,
                username=settings.NEO4J_USER,
                password=settings.NEO4J_PASSWORD,
            )
        return self._graph

    def create_node(
        self,
        label: NodeLabel,
        name: Optional[str],
        title: Optional[str],
        description: str,
    ) -> Dict[str, Any]:
        node_id = str(uuid.uuid4())
        display_name = name or title or ""

        query = f"""
        CREATE (n:{label} {{id: $id, name: $name, description: $description}})
        RETURN n {{.*, label: '{label}'}} AS node
        """
        params = {
            "id": node_id,
            "name": display_name,
            "description": description,
        }
        res = self._get_graph().query(query, params)
        if res:
            node_data = res[0]["node"]
            return {
                "id": node_data["id"],
                "label": label,
                "properties": node_data,
            }

        return {
            "id": node_id,
            "label": label,
            "properties": {
                "id": node_id,
                "name": display_name,
                "description": description,
            },
        }

    def create_relationship(
        self,
        source_id: str,
        target_id: str,
        rel_type: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        props = properties or {}
        # Clean relational type string to prevent Cypher injection
        clean_rel_type = "".join(c for c in rel_type if c.isalnum() or c == "_")

        query = f"""
        MATCH (s {{id: $source_id}}), (t {{id: $target_id}})
        CREATE (s)-[r:{clean_rel_type}]->(t)
        SET r += $properties
        RETURN s.id AS source_id, t.id AS target_id, type(r) AS type, properties(r) AS properties
        """
        params = {
            "source_id": source_id,
            "target_id": target_id,
            "properties": props,
        }
        res = self._get_graph().query(query, params)
        if res:
            return res[0]
        return {
            "source_id": source_id,
            "target_id": target_id,
            "type": rel_type,
            "properties": props,
        }

    def search_graph(self, keyword: str) -> List[Dict[str, Any]]:
        query = """
        MATCH (n)
        WHERE toLower(n.name) CONTAINS toLower($keyword) 
           OR toLower(n.description) CONTAINS toLower($keyword)
           OR toLower(n.title) CONTAINS toLower($keyword)
        RETURN n.id AS id, labels(n)[0] AS label, properties(n) AS properties
        LIMIT 50
        """
        params = {"keyword": keyword}
        res = self._get_graph().query(query, params)
        results = []
        for item in res:
            try:
                lbl = NodeLabel(item["label"])
            except ValueError:
                lbl = NodeLabel.DOMAIN
            results.append(
                {"id": item["id"], "label": lbl, "properties": item["properties"]}
            )
        return results

    def visualize_graph(self) -> Dict[str, Any]:
        nodes_query = "MATCH (n) RETURN n.id AS id, labels(n)[0] AS label, properties(n) AS properties"
        links_query = "MATCH (n)-[r]->(m) RETURN n.id AS source, m.id AS target, type(r) AS type"

        db_nodes = self._get_graph().query(nodes_query)
        db_links = self._get_graph().query(links_query)

        viz_nodes = []
        for n in db_nodes:
            props = n["properties"]
            display_name = props.get("name", props.get("title", "Unnamed"))
            try:
                lbl = NodeLabel(n["label"])
            except ValueError:
                lbl = NodeLabel.DOMAIN

            viz_nodes.append(
                {
                    "id": n["id"],
                    "label": display_name,
                    "type": lbl,
                    "properties": props,
                }
            )

        viz_links = []
        for l in db_links:
            viz_links.append(
                {"source": l["source"], "target": l["target"], "type": l["type"]}
            )

        return {"nodes": viz_nodes, "links": viz_links}

    def find_nearest_domains(
        self, domain_id: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        # Cypher query mapping closest domains by path intersections
        query = """
        MATCH (d:Domain {id: $domain_id})-[*1..2]-(other:Domain)
        WHERE d <> other
        RETURN other.id AS id, other.name AS name, count(*) AS strength
        ORDER BY strength DESC
        LIMIT $limit
        """
        params = {"domain_id": domain_id, "limit": limit}
        res = self._get_graph().query(query, params)
        return res

    def find_uncommon_combinations(self, limit: int = 5) -> List[Dict[str, Any]]:
        # Find domain pairs separated by a distance >= 3 (or not connected directly)
        query = """
        MATCH (d1:Domain), (d2:Domain)
        WHERE id(d1) < id(d2)
        AND NOT (d1)-[:RELATED_TO]-(d2)
        OPTIONAL MATCH path = shortestPath((d1)-[*..3]-(d2))
        WITH d1, d2, path
        WHERE path IS NULL OR length(path) >= 3
        RETURN d1.id AS domain1_id, d1.name AS domain1_name, d2.id AS domain2_id, d2.name AS domain2_name, 3 AS distance
        LIMIT $limit
        """
        params = {"limit": limit}
        res = self._get_graph().query(query, params)
        return res


# Dynamic selector depending on Neo4j presence
def get_graph_engine():
    if neo4j_service.connect():
        logger.info("Using Neo4j Knowledge Graph Engine.")
        return Neo4jKnowledgeGraphEngine()
    else:
        logger.warning(
            "Neo4j connection offline. Falling back to in-memory MockGraphEngine."
        )
        return MockGraphEngine()


graph_engine = get_graph_engine()
