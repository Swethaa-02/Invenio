import sys
from fastapi import FastAPI


def verify():
    print("Initializing FastAPI application...")
    try:
        from app.main import app
    except Exception as e:
        import traceback

        print(f"Error importing app: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    assert isinstance(app, FastAPI), "Imported object is not a FastAPI instance"
    print("App successfully imported and verified as a FastAPI instance.")

    print("\nRegistered Routes:")
    for route in app.routes:
        methods = getattr(route, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {route.path:<40} {methods_str:<15} {route.name}")

    print("\nVerification successful! Zero import or router compilation errors.")


if __name__ == "__main__":
    verify()
