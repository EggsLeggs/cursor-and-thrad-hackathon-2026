import { NextResponse } from "next/server";
import { store, clearDecisions } from "@/lib/store";

export async function DELETE() {
  clearDecisions();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    decisions: store.decisions,
    campaign: store.campaign,
    stats: {
      total: store.decisions.length,
      bids: store.decisions.filter((d) => d.decision === "bid").length,
      skips: store.decisions.filter((d) => d.decision === "skip").length,
      flagged: store.decisions.filter((d) => d.decision === "flagged").length,
      vetoed: store.vetoed.length,
      humanReviewed: store.decisions.filter((d) => d.humanAction).length,
    },
  });
}
