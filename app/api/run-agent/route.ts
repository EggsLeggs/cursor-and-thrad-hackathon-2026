import { NextRequest, NextResponse } from "next/server";
import { runDecisionAgent } from "@/lib/agent";
import { store } from "@/lib/store";
import { scenarios } from "@/lib/scenarios";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages =
    body.scenarioIndex !== undefined
      ? scenarios[body.scenarioIndex]?.messages
      : body.messages;
  if (!messages) return NextResponse.json({ error: "No messages" }, { status: 400 });
  runDecisionAgent(messages, store.campaign).catch(console.error);
  return NextResponse.json({ ok: true });
}
