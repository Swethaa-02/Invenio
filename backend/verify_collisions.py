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

    print("\nChecking Knowledge Collision Engine Router registration:")
    col_routes = [
        r for r in app.routes if "collision-engine" in getattr(r, "path", "")
    ]
    for r in col_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    print("\n--------------------------------------------------")
    print("2. Instantiating Collision Engine...")
    try:
        from app.services.collision_engine import (
            collision_engine,
            TFIDFEmbeddingSystem,
            SimilarityEngine,
        )
    except Exception as e:
        print(f"Error importing collision engine: {e}", file=sys.stderr)
        sys.exit(1)

    print("Collision Engine successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Testing Text Embedding & Similarity Math...")
    docs = [
        "Healthcare AI assistant diagnostic system.",
        "Decentralized ledger smart contracts registry.",
        "Agricultural drone harvesting crop monitoring.",
    ]
    vectorizer = TFIDFEmbeddingSystem(docs)
    print(f"Vocabulary size: {len(vectorizer.vocab)}")
    print(f"Vocabulary: {vectorizer.vocab}")

    # Embed documents
    v1 = vectorizer.embed("Healthcare AI assistant")
    v2 = vectorizer.embed("Agricultural drone crop")
    v3 = vectorizer.embed("AI assistant system")

    sim_diff = SimilarityEngine.cosine_similarity(v1, v2)
    sim_same = SimilarityEngine.cosine_similarity(v1, v3)

    print(f"Cosine similarity between Healthcare AI and Agricultural Drone: {sim_diff:.4f}")
    print(f"Cosine similarity between Healthcare AI and AI Assistant System: {sim_same:.4f}")

    assert (
        sim_same > sim_diff
    ), "Semantic similarity math failed: Healthcare AI and AI Assistant System should be more similar!"
    print("Semantic similarity math checks passed!")

    print("\n--------------------------------------------------")
    print("4. Discovering and Scoring collisions over Graph nodes...")
    try:
        discover_res = collision_engine.discover_collisions(limit=5)
    except Exception as e:
        print(f"Collision discovery execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Discovered collisions count: {len(discover_res)}")
    for i, col in enumerate(discover_res):
        print(f"\nOpportunity #{i+1}:")
        print(f"  Nodes: {col['domain1_name']} (#{col['domain1_id']}) + {col['domain2_name']} (#{col['domain2_id']})")
        print(f"  Semantic Similarity: {col['semantic_similarity']:.4f}")
        print(f"  Graph Path Distance: {col['graph_distance']}")
        print(f"  Collision Score    : {col['collision_score']:.2f}/10.0")
        print(f"  Synergy Notes      : {col['synergy_notes']}")

    assert len(discover_res) > 0, "No collisions discovered!"
    first_col = discover_res[0]
    required_keys = {
        "domain1_id",
        "domain1_name",
        "domain2_id",
        "domain2_name",
        "semantic_similarity",
        "graph_distance",
        "collision_score",
        "synergy_notes",
    }
    for k in required_keys:
        assert k in first_col, f"Missing key in response: {k}"

    print("\n--------------------------------------------------")
    print("5. Evaluating specific pair custom calculation...")
    try:
        eval_res = collision_engine.evaluate_pair(id1="dom_ai", id2="dom_web3")
    except Exception as e:
        print(f"Custom pair evaluation failed: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Evaluation Details:")
    for k, v in eval_res.items():
        print(f"  {k:<20}: {v}")

    print("\n--------------------------------------------------")
    print("Verification successful! All collision checks passed successfully.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
