import asyncio
import sys
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def verify_async():
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

    print("\nChecking Novelty Detector Router registration:")
    nov_routes = [
        r for r in app.routes if "novelty-detector" in getattr(r, "path", "")
    ]
    for r in nov_routes:
        methods = getattr(r, "methods", None)
        methods_str = f"[{', '.join(methods)}]" if methods else ""
        print(f"  {r.path:<45} {methods_str:<15} {r.name}")

    print("\n--------------------------------------------------")
    print("2. Setting up Mock Database records in SQLite...")
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.project import Project
    from app.models.innovation import Innovation

    db: AsyncSession = SessionLocal()

    # A. Create a dummy user
    test_email = "novelty_tester@invenio.io"
    q_user = select(User).where(User.email == test_email)
    res_user = await db.execute(q_user)
    user = res_user.scalar_one_or_none()

    if not user:
        user = User(
            email=test_email,
            hashed_password="mock_hashed_password_123",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"  Created test user: {user.email}")
    else:
        print(f"  Using existing test user: {user.email}")

    # B. Create a dummy project
    project = Project(name="Novelty Verification Project", owner_id=user.id)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    print(f"  Created test project: '{project.name}' (ID: {project.id})")

    # C. Add two stored innovations to compare against
    inno1 = Innovation(
        title="Smart Soil Moisture Sensor",
        desc="IoT sensor network deployed in soil to measure moisture levels and optimize watering grids.",
        project_id=project.id,
    )
    inno2 = Innovation(
        title="Autonomous Crop Harvester Drone",
        desc="Autonomous flying drone mapping crops and harvesting fruit with soft robot claws.",
        project_id=project.id,
    )
    db.add_all([inno1, inno2])
    await db.commit()
    await db.refresh(inno1)
    await db.refresh(inno2)
    print("  Populated 2 stored innovations in project.")

    print("\n--------------------------------------------------")
    print("3. Executing Novelty Detection calculations...")
    from app.services.novelty_detector import novelty_detector

    # TEST A: Exact Duplicate
    print("\n[TEST A] Submitting exact duplicate idea...")
    res_a = await novelty_detector.calculate_novelty(
        db,
        title="Smart Soil Moisture Sensor",
        desc="IoT sensor network deployed in soil to measure moisture levels and optimize watering grids.",
        project_id=project.id,
    )
    print(f"  Similarity Score   : {res_a['similarity_score']}%")
    print(f"  Uniqueness Score  : {res_a['uniqueness_score']}%")
    print(f"  Novelty Score     : {res_a['novelty_score']}%")
    print(f"  Is Duplicate      : {res_a['is_duplicate']}")
    print(f"  Is Near Duplicate : {res_a['is_near_duplicate']}")
    print(f"  Reasoning         : {res_a['reasoning']}")

    assert res_a["is_duplicate"], "Test A failed: Should be classified as a duplicate!"
    assert res_a["similarity_score"] >= 99.0, "Test A failed: Similarity should be ~100%"

    # TEST B: Near Duplicate (high text overlap)
    print("\n[TEST B] Submitting near-duplicate idea...")
    res_b = await novelty_detector.calculate_novelty(
        db,
        title="Smart Soil Moisture Detector",
        desc="IoT sensor network deployed in soil to measure moisture levels and optimize watering grids.",
        project_id=project.id,
    )
    print(f"  Similarity Score   : {res_b['similarity_score']}%")
    print(f"  Uniqueness Score  : {res_b['uniqueness_score']}%")
    print(f"  Novelty Score     : {res_b['novelty_score']}%")
    print(f"  Is Duplicate      : {res_b['is_duplicate']}")
    print(f"  Is Near Duplicate : {res_b['is_near_duplicate']}")
    print(f"  Reasoning         : {res_b['reasoning']}")

    assert (
        res_b["is_near_duplicate"] or res_b["is_duplicate"]
    ), "Test B failed: Should be classified as near-duplicate or duplicate!"

    # TEST C: Original Idea (zero overlap)
    print("\n[TEST C] Submitting highly original idea...")
    res_c = await novelty_detector.calculate_novelty(
        db,
        title="WebGL Spatial UI Console",
        desc="High performance spatial widget console using GPU shaders to render interfaces at low latency.",
        project_id=project.id,
    )
    print(f"  Similarity Score   : {res_c['similarity_score']}%")
    print(f"  Uniqueness Score  : {res_c['uniqueness_score']}%")
    print(f"  Novelty Score     : {res_c['novelty_score']}%")
    print(f"  Is Duplicate      : {res_c['is_duplicate']}")
    print(f"  Is Near Duplicate : {res_c['is_near_duplicate']}")
    print(f"  Reasoning         : {res_c['reasoning']}")

    assert (
        not res_c["is_duplicate"] and not res_c["is_near_duplicate"]
    ), "Test C failed: Should be classified as Original!"
    assert res_c["novelty_score"] >= 75.0, "Test C failed: Novelty score should be high!"

    print("\n--------------------------------------------------")
    print("4. Cleaning up Database test records...")
    # Delete innovations, project, and user
    await db.delete(inno1)
    await db.delete(inno2)
    await db.delete(project)
    await db.commit()
    await db.close()
    print("  Cleaned up verification DB records.")

    print("\n--------------------------------------------------")
    print("Verification successful! All novelty checks passed successfully.")
    print("--------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(verify_async())
