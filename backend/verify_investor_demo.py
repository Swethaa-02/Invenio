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

    print("\nChecking Investor Demo Mode Router registration:")
    demo_routes = [
        r for r in app.routes if "investor-demo" in getattr(r, "path", "")
    ]
    for r in demo_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    assert len(demo_routes) > 0, "No investor-demo routes registered!"

    print("\n--------------------------------------------------")
    print("2. Instantiating Investor Demo Engine...")
    try:
        from app.services.investor_demo import investor_demo
    except Exception as e:
        print(f"Error importing investor demo service: {e}", file=sys.stderr)
        sys.exit(1)

    print("Investor Demo Engine successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Executing Pitch Generation...")
    print("Inputs: Multi-Agent Triaging Mesh")
    try:
        pitch = investor_demo.generate(
            title="Multi-Agent Triaging Mesh",
            summary="A decentralized system coordinates autonomous software agents to triage and debug cluster deployment pipelines.",
            technologies=["fastapi", "python", "kubernetes"],
        )
    except Exception as e:
        print(f"Pitch generation execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nGenerated Investor Proposal Profile:")
    print(f"  Executive Summary: {pitch.get('executive_summary')}")
    print(f"  Highlights: {pitch.get('investment_highlights')}")
    
    deck = pitch.get("pitch_deck", [])
    print(f"  Total Slides Generated: {len(deck)}")
    assert len(deck) == 8, f"Expected exactly 8 slides, got {len(deck)}"

    expected_sections = [
        "Problem",
        "Solution",
        "Market",
        "Technology",
        "Business Model",
        "Competition",
        "Roadmap",
        "Revenue",
    ]

    for i, slide in enumerate(deck):
        print(f"\n  Slide {slide['slide_id']} [{slide['section']}]:")
        print(f"    Title        : {slide['title']}")
        print(f"    Subtitle     : {slide['subtitle']}")
        print(f"    Bullets      : {slide['bullet_points']}")
        print(f"    Chart Type   : {slide['chart_type']}")
        print(f"    Chart Data   : {slide['chart_data']}")

        # Basic validations
        assert slide["section"] == expected_sections[i], f"Expected section {expected_sections[i]}, got {slide['section']}"
        assert len(slide["title"]) > 0, "Expected title to be populated!"
        assert len(slide["subtitle"]) > 0, "Expected subtitle to be populated!"
        assert len(slide["bullet_points"]) > 0, "Expected bullet points to be populated!"

    print("\n--------------------------------------------------")
    print("Verification successful! All Investor Demo checks passed.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
