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

    print("\nChecking Feasibility Analyzer Router registration:")
    feasibility_routes = [
        r for r in app.routes if "feasibility-analyzer" in getattr(r, "path", "")
    ]
    for r in feasibility_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    assert len(feasibility_routes) > 0, "No feasibility-analyzer routes registered!"

    print("\n--------------------------------------------------")
    print("2. Instantiating Feasibility Analyzer Engine...")
    try:
        from app.services.feasibility_analyzer import feasibility_analyzer
    except Exception as e:
        print(f"Error importing feasibility analyzer service: {e}", file=sys.stderr)
        sys.exit(1)

    print("Feasibility Analyzer successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Executing Feasibility Analysis (High Complexity)...")
    print("Inputs: Swarm Triaging Drone Network with ZKPs")
    try:
        concept_high = feasibility_analyzer.analyze(
            title="Swarm Triaging Drone Network with ZKPs",
            summary="Autonomous drone fleet routing medical supplies with swarm intelligence and zero-knowledge proof cryptography validation.",
            technologies=["zkp", "swarm", "drones", "reinforcement learning", "rust"],
        )
    except Exception as e:
        print(f"High-complexity analysis execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nHigh-Complexity Innovation Feasibility Profile:")
    print(f"  Feasibility Score : {concept_high['feasibility_score']}/100")
    print(f"  Risk Score        : {concept_high['risk_score']}/100")
    print(f"  Difficulty        : {concept_high['implementation_difficulty']}")
    print(f"  Time to build     : {concept_high['time_to_build']}")
    print(f"  Cost range        : {concept_high['development_cost']}")
    print(f"  Skills            : {concept_high['required_skills']}")
    print(f"  Infrastructure    : {concept_high['infrastructure_requirements']}")
    print(f"  Complexity Desc   : {concept_high['technical_complexity']}")
    print(f"  Explanation       : {concept_high['explanation']}")

    # High complexity assertions:
    # Base complexity starts at 30.
    # zkp (+20), swarm (+15), drones (+20), reinforcement learning (+15). Total = 30+20+15+20+15 = 100, capped at 95.
    # Technologies length = 5 (>3) -> +10. Capped at 95.
    # Feasibility score = 100 - 95 = 5. Clamped between 10 and 95, so 10.
    # Difficulty should be High (>70).
    # Risk should be High (complexity > 70 adds 30, robotics/cryptography adds 20. base 15. Total = 65, capped/clamped).
    assert concept_high["implementation_difficulty"] == "High", "Expected high difficulty!"
    assert concept_high["feasibility_score"] <= 30.0, "Expected low feasibility score!"
    assert concept_high["risk_score"] >= 50.0, "Expected high risk score!"

    print("\n--------------------------------------------------")
    print("4. Executing Feasibility Analysis (Low Complexity)...")
    print("Inputs: Simple Task Tracker")
    try:
        concept_low = feasibility_analyzer.analyze(
            title="Simple Task Tracker",
            summary="A basic dashboard to track and organize tasks for teams.",
            technologies=["react", "fastapi"],
        )
    except Exception as e:
        print(f"Low-complexity analysis execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nLow-Complexity Innovation Feasibility Profile:")
    print(f"  Feasibility Score : {concept_low['feasibility_score']}/100")
    print(f"  Risk Score        : {concept_low['risk_score']}/100")
    print(f"  Difficulty        : {concept_low['implementation_difficulty']}")
    print(f"  Time to build     : {concept_low['time_to_build']}")
    print(f"  Cost range        : {concept_low['development_cost']}")
    print(f"  Skills            : {concept_low['required_skills']}")
    print(f"  Infrastructure    : {concept_low['infrastructure_requirements']}")
    print(f"  Complexity Desc   : {concept_low['technical_complexity']}")
    print(f"  Explanation       : {concept_low['explanation']}")

    # Low complexity assertions:
    # Base complexity starts at 30. No special keywords. Technologies = 2 (<=3). Complexity remains 30.
    # Feasibility score = 100 - 30 = 70.
    # Difficulty should be Low (<=40).
    # Risk should be Low.
    assert concept_low["implementation_difficulty"] == "Low", "Expected low difficulty!"
    assert concept_low["feasibility_score"] >= 60.0, "Expected high feasibility score!"
    assert concept_low["risk_score"] <= 30.0, "Expected low risk score!"

    # Common Key Assertions
    required_keys = {
        "feasibility_score",
        "risk_score",
        "implementation_difficulty",
        "technical_complexity",
        "development_cost",
        "required_skills",
        "infrastructure_requirements",
        "time_to_build",
        "explanation",
    }
    for k in required_keys:
        assert k in concept_high, f"Missing key in response: {k}"
        assert k in concept_low, f"Missing key in response: {k}"

    print("\n--------------------------------------------------")
    print("Verification successful! All feasibility analyzer checks passed.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
