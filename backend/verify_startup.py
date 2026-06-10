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

    print("\nChecking Startup Potential Analyzer Router registration:")
    startup_routes = [
        r for r in app.routes if "startup-analyzer" in getattr(r, "path", "")
    ]
    for r in startup_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    assert len(startup_routes) > 0, "No startup-analyzer routes registered!"

    print("\n--------------------------------------------------")
    print("2. Instantiating Startup Analyzer Engine...")
    try:
        from app.services.startup_analyzer import startup_analyzer
    except Exception as e:
        print(f"Error importing startup analyzer service: {e}", file=sys.stderr)
        sys.exit(1)

    print("Startup Analyzer successfully instantiated.")

    print("\n--------------------------------------------------")
    print("3. Executing Startup Analysis (High Potential SaaS)...")
    print("Inputs: B2B Enterprise AI Platform")
    try:
        concept_high = startup_analyzer.analyze(
            title="B2B Enterprise AI Platform",
            summary="A subscription cloud platform scaling vector embeddings and LLM caching context layers for software platforms.",
            technologies=["ai", "saas", "cloud", "b2b", "enterprise"],
        )
    except Exception as e:
        print(f"High-potential analysis execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nHigh-Potential Venture Profile:")
    print(f"  Overall Score     : {concept_high['startup_potential_score']}/100")
    print(f"  Market Size       : {concept_high['market_size_score']}/100")
    print(f"  Competition Moat  : {concept_high['competition_score']}/100")
    print(f"  Revenue Potential : {concept_high['revenue_potential_score']}/100")
    print(f"  Scalability       : {concept_high['scalability_score']}/100")
    print(f"  Customer Demand   : {concept_high['customer_demand_score']}/100")
    print(f"  Business Model    : {concept_high['business_model']}")
    print(f"  Target Customers  : {concept_high['target_customers']}")
    print(f"  Monetization      : {concept_high['revenue_streams']}")
    print(f"  Go-To-Market      : {concept_high['go_to_market_strategy']}")
    print(f"  Thesis            : {concept_high['explanation']}")

    # Assertions:
    # High score for revenue (b2b, enterprise adds 20. saas adds 15. base 50. Total 85)
    # High score for scalability (saas, platform adds 20. base 50. Total 70)
    assert concept_high["revenue_potential_score"] >= 75.0, "Expected high revenue potential!"
    assert concept_high["scalability_score"] >= 65.0, "Expected high scalability!"
    assert concept_high["startup_potential_score"] >= 65.0, "Expected high overall startup potential!"

    print("\n--------------------------------------------------")
    print("4. Executing Startup Analysis (Crowded Consumer Space)...")
    print("Inputs: B2C Social Media Photo App")
    try:
        concept_low = startup_analyzer.analyze(
            title="B2C Social Media Photo App",
            summary="A mobile social marketplace where consumers upload and share photos in a B2C feed.",
            technologies=["consumer", "marketplace", "social", "b2c"],
        )
    except Exception as e:
        print(f"Low-potential analysis execution failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\nCrowded Consumer Venture Profile:")
    print(f"  Overall Score     : {concept_low['startup_potential_score']}/100")
    print(f"  Market Size       : {concept_low['market_size_score']}/100")
    print(f"  Competition Moat  : {concept_low['competition_score']}/100")
    print(f"  Revenue Potential : {concept_low['revenue_potential_score']}/100")
    print(f"  Scalability       : {concept_low['scalability_score']}/100")
    print(f"  Customer Demand   : {concept_low['customer_demand_score']}/100")

    # Assertions:
    # Heavy competition (consumer, social, b2c, marketplace subtracts 10. base 60. Total 50)
    # Since it is crowded, overall score is lowered compared to the SaaS model.
    assert concept_low["competition_score"] <= 55.0, "Expected low moat score due to high competition!"
    assert concept_low["startup_potential_score"] < concept_high["startup_potential_score"], "Crowded B2C app should score lower overall than enterprise SaaS!"

    # Common Key Assertions
    required_keys = {
        "startup_potential_score",
        "market_size_score",
        "competition_score",
        "revenue_potential_score",
        "scalability_score",
        "customer_demand_score",
        "business_model",
        "target_customers",
        "revenue_streams",
        "go_to_market_strategy",
        "explanation",
    }
    for k in required_keys:
        assert k in concept_high, f"Missing key in response: {k}"
        assert k in concept_low, f"Missing key in response: {k}"

    print("\n--------------------------------------------------")
    print("Verification successful! All Startup Potential Analyzer checks passed.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    verify()
