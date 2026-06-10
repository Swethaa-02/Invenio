import sys
from fastapi import FastAPI


def verify():
    print("--------------------------------------------------")
    print("1. Initializing FastAPI application...")
    try:
        from app.main import app
    except Exception as e:
        import traceback

        print(f"Error importing app: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    assert isinstance(app, FastAPI), "Imported object is not a FastAPI instance"
    print("App successfully imported and verified as a FastAPI instance.")

    print("\nChecking Knowledge Graph Router registration:")
    kg_routes = [
        r for r in app.routes if "knowledge-graph-neo4j" in getattr(r, "path", "")
    ]
    for r in kg_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    print("\n--------------------------------------------------")
    print("2. Instantiating Knowledge Graph Engine...")
    try:
        from app.services.knowledge_graph import graph_engine
        from app.schemas.knowledge_graph_neo4j import NodeLabel
    except Exception as e:
        print(f"Error importing graph engine: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Graph Engine implementation: {graph_engine.__class__.__name__}")

    print("\n--------------------------------------------------")
    print("3. Executing CRUD and Graph Algorithm checks...")

    # A. Node Creation
    print("\n[A] Creating nodes...")
    d_node = graph_engine.create_node(
        label=NodeLabel.DOMAIN,
        name="Bio-Tech Integration",
        title=None,
        description="Technological intersection of biology and computing.",
    )
    print(f"  Created Domain node: {d_node}")

    t_node = graph_engine.create_node(
        label=NodeLabel.TECHNOLOGY,
        name="Crispr Compiler",
        title=None,
        description="Gene sequencing editor compiler.",
    )
    print(f"  Created Technology node: {t_node}")

    # B. Relationship Creation
    print("\n[B] Creating relationship...")
    rel = graph_engine.create_relationship(
        source_id=t_node["id"],
        target_id=d_node["id"],
        rel_type="APPLIED_IN",
        properties={"strength": 9},
    )
    print(f"  Created relationship: {rel}")

    # C. Search Graph
    print("\n[C] Searching graph for 'Crispr'...")
    search_res = graph_engine.search_graph("Crispr")
    print(f"  Search results count: {len(search_res)}")
    for res in search_res:
        print(
            f"    - Found Node (ID: {res['id']}, Label: {res['label']}, Name/Title: {res['properties'].get('name', res['properties'].get('title'))})"
        )
    assert len(search_res) > 0, "Created node 'Crispr Compiler' not found in search!"

    # D. Visualize Graph
    print("\n[D] Visualizing full graph...")
    viz = graph_engine.visualize_graph()
    print(f"  Total Nodes in visualization: {len(viz['nodes'])}")
    print(f"  Total Links in visualization: {len(viz['links'])}")
    assert (
        len(viz["nodes"]) >= 2
    ), "Visualization should return at least the newly created nodes!"

    # E. Find Nearest Domains
    print("\n[E] Querying Nearest Domains algorithm...")
    nearest_res = graph_engine.find_nearest_domains(domain_id="dom_ai", limit=3)
    print(f"  Nearest domains to 'dom_ai':")
    for item in nearest_res:
        print(f"    - Domain ID: {item['id']}, Name: {item['name']}, Strength: {item['strength']}")

    # F. Find Uncommon Domain Combinations
    print("\n[F] Querying Uncommon Domain Combinations algorithm...")
    uncommon_res = graph_engine.find_uncommon_combinations(limit=3)
    print(f"  Uncommon domain combinations detected:")
    for item in uncommon_res:
        print(
            f"    - {item['domain1_name']} (#{item['domain1_id']}) + {item['domain2_name']} (#{item['domain2_id']}) [Simulated distance: {item['distance']}]"
        )

    print("\n--------------------------------------------------")
    print("Verification successful! All checks passed successfully.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
