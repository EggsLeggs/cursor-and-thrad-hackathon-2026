import { NextRequest, NextResponse } from "next/server";
import { applyHumanAction } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action, note } = await req.json();
  if (!["approved", "vetoed", "flagged"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const updated = applyHumanAction(id, action, note);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
