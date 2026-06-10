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

    print("\nChecking Innovation Generator Router registration:")
    gen_routes = [
        r for r in app.routes if "innovation-generator" in getattr(r, "path", "")
    ]
    for r in gen_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    print("\n--------------------------------------------------")
    print("2. Instantiating LangGraph Innovation Generator...")
    try:
        from app.services.innovation_generator import generator_runner
    except Exception as e:
        print(f"Error importing generator service: {e}", file=sys.stderr)
        sys.exit(1)

    print("LangGraph Innovation Generator successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Executing LangGraph Multi-Agent Pipeline...")
    print("Inputs: ['Healthcare', 'Swarm Intelligence']")
    try:
        concept = generator_runner.generate(
            domains=["Healthcare", "Swarm Intelligence"]
        )
    except Exception as e:
        print(f"Agent pipeline execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nGenerated Innovation Profile:")
    print(f"  Problem      : {concept['problem']}")
    print(f"  Solution     : {concept['solution']}")
    print(f"  Summary      : {concept['summary']}")
    print(f"  Impact       : {concept['impact']}")
    print(f"  Technologies : {concept['technologies']}")

    print("\nStep-by-Step Agent Reasoning Logs:")
    for i, log in enumerate(concept["reasoning_log"]):
        print(f"  {i+1}. {log}")

    # Assertions
    required_keys = {
        "problem",
        "solution",
        "summary",
        "impact",
        "technologies",
        "reasoning_log",
    }
    for k in required_keys:
        assert k in concept, f"Missing key in response: {k}"

    assert (
        len(concept["reasoning_log"]) >= 4
    ), f"Expected at least 4 agent reasoning logs, got {len(concept['reasoning_log'])}"

    print("\n--------------------------------------------------")
    print("Verification successful! All agent pipeline checks passed.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
