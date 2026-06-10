import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const ideas = db.getIdeas();
    return NextResponse.json(ideas);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, theme } = body;

    // Theme Get/Set Triggers
    if (action === "getTheme") {
      return NextResponse.json({ theme: db.getTheme() });
    }

    if (action === "setTheme") {
      if (!theme) {
        return NextResponse.json({ error: "Missing theme parameter" }, { status: 400 });
      }
      db.setTheme(theme);
      return NextResponse.json({ success: true, theme: db.getTheme() });
    }

    if (action === "update") {
      const { fields } = body;
      if (!id || !fields) {
        return NextResponse.json({ error: "Missing id or fields parameters" }, { status: 400 });
      }
      const success = db.updateIdea(id, fields);
      if (!success) {
        return NextResponse.json({ error: "Idea not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, ideas: db.getIdeas() });
    }

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
      }
      const success = db.deleteIdea(id);
      if (!success) {
        return NextResponse.json({ error: "Idea not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, ideas: db.getIdeas() });
    }

    if (action === "reset") {
      db.resetIdeas();
      return NextResponse.json({ success: true, ideas: db.getIdeas() });
    }

    // Default: Add a new idea
    const { title, desc, category, score, details, x, y, status } = body;
    if (!title || !desc || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newIdea = db.addIdea({
      title,
      desc,
      category,
      score: score || 7.0,
      details: details || "",
      x: x || 200,
      y: y || 200,
      status: status || "Draft",
    });

    return NextResponse.json({ success: true, newIdea, ideas: db.getIdeas() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
