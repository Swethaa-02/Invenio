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

    print("\nChecking AI Roadmap Generator Router registration:")
    roadmap_routes = [
        r for r in app.routes if "roadmap-generator" in getattr(r, "path", "")
    ]
    for r in roadmap_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    assert len(roadmap_routes) > 0, "No roadmap-generator routes registered!"

    print("\n--------------------------------------------------")
    print("2. Instantiating AI Roadmap Generator Engine...")
    try:
        from app.services.roadmap_generator import roadmap_generator
    except Exception as e:
        print(f"Error importing roadmap generator service: {e}", file=sys.stderr)
        sys.exit(1)

    print("Roadmap Generator successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Executing Roadmap Generation...")
    print("Inputs: Multi-Agent Triaging Mesh")
    try:
        roadmap = roadmap_generator.generate(
            title="Multi-Agent Triaging Mesh",
            summary="A decentralized system coordinates autonomous software agents to triage and debug cluster deployment pipelines.",
        )
    except Exception as e:
        print(f"Roadmap generation execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nGenerated Roadmap Phases Profile:")
    phases = roadmap.get("phases", [])
    print(f"  Total Phases Compiled: {len(phases)}")
    assert len(phases) == 6, f"Expected exactly 6 phases, got {len(phases)}"

    expected_phases = [
        "Phase 1 Research",
        "Phase 2 Prototype",
        "Phase 3 MVP",
        "Phase 4 Testing",
        "Phase 5 Deployment",
        "Phase 6 Scaling",
    ]

    for i, phase in enumerate(phases):
        print(f"\n  {phase['phase_name']} ({phase['timeline']}):")
        print(f"    Milestones   : {phase['milestones']}")
        print(f"    Tasks        : {phase['tasks']}")
        print(f"    Dependencies : {phase['dependencies']}")
        print(f"    Deliverables : {phase['deliverables']}")
        print(f"    Progress     : {phase['progress']}%")

        # Basic validations
        assert phase["phase_name"] == expected_phases[i], f"Expected name {expected_phases[i]}, got {phase['phase_name']}"
        assert len(phase["milestones"]) > 0, "Expected milestones to be populated!"
        assert len(phase["tasks"]) > 0, "Expected tasks to be populated!"
        assert len(phase["dependencies"]) > 0, "Expected dependencies to be populated!"
        assert len(phase["deliverables"]) > 0, "Expected deliverables to be populated!"

    print("\n--------------------------------------------------")
    print("Verification successful! All AI Roadmap Generator checks passed.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
