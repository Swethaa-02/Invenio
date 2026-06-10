import logging
from typing import Optional
from neo4j import GraphDatabase, AsyncGraphDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class Neo4jService:
    def __init__(self):
        self.uri = settings.NEO4J_URI
        self.user = settings.NEO4J_USER
        self.password = settings.NEO4J_PASSWORD
        self.driver = None
        self._is_connected = False

    def connect(self) -> bool:
        """Connect to Neo4j and check connectivity."""
        if self.driver:
            return self._is_connected

        try:
            logger.info(f"Connecting to Neo4j at {self.uri}...")
            self.driver = GraphDatabase.driver(
                self.uri, auth=(self.user, self.password)
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self._is_connected = True
            logger.info("Successfully connected to Neo4j.")
            self.initialize_schema()
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            self.driver = None
            self._is_connected = False
            return False

    def close(self):
        """Close driver connection."""
        if self.driver:
            self.driver.close()
            self.driver = None
            self._is_connected = False

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get_session(self):
        """Get a Neo4j session."""
        if not self.connect():
            raise ConnectionError("Neo4j database is not connected.")
        return self.driver.session()

    def initialize_schema(self):
        """Initialize database constraints and indices."""
        constraints = [
            "CREATE CONSTRAINT domain_id_unique IF NOT EXISTS FOR (d:Domain) REQUIRE d.id IS UNIQUE",
            "CREATE CONSTRAINT technology_id_unique IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE",
            "CREATE CONSTRAINT industry_id_unique IF NOT EXISTS FOR (i:Industry) REQUIRE i.id IS UNIQUE",
            "CREATE CONSTRAINT problem_id_unique IF NOT EXISTS FOR (p:Problem) REQUIRE p.id IS UNIQUE",
            "CREATE CONSTRAINT solution_id_unique IF NOT EXISTS FOR (s:Solution) REQUIRE s.id IS UNIQUE",
        ]

        with self.driver.session() as session:
            for query in constraints:
                try:
                    session.run(query)
                except Exception as e:
                    logger.warning(
                        f"Failed to initialize constraint '{query}': {e}"
                    )


neo4j_service = Neo4jService()
