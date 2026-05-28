import OpenAI from "openai";
import { tavily } from "@tavily/core";
import { ensureOvermind } from "./overmind";
import { requestBid } from "./thrad";
import { addDecision, Campaign, Message, store } from "./store";
import { v4 as uuid } from "uuid";

let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

let tavilyClientInstance: ReturnType<typeof tavily> | null = null;
function getTavily() {
  if (!tavilyClientInstance) tavilyClientInstance = tavily({ apiKey: process.env.TAVILY_API_KEY! });
  return tavilyClientInstance;
}

type AgentDecision = {
  decision: "bid" | "skip" | "flagged";
  reasoning: string;
  confidence: number;
  flags: string[];
  suggestedCPM: number;
};

export async function runDecisionAgent(messages: Message[], campaign: Campaign): Promise<void> {
  ensureOvermind();
  const contextSnippet = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .slice(0, 120);

  // Step 1: Tavily brand safety check
  let brandSafetyContext = "No recent brand safety issues found.";
  let detectedFlags: string[] = [];

  try {
    const safetyQuery = `${campaign.advertiser} brand safety controversy ${new Date().getFullYear()}`;
    const tavilyResult = await getTavily().search(safetyQuery, { maxResults: 3, searchDepth: "basic" });
    const results = tavilyResult.results ?? [];
    if (results.length > 0) {
      brandSafetyContext = results
        .map((r: { title: string; content: string }) => `${r.title}: ${r.content.slice(0, 200)}`)
        .join("\n");
    }
    const conversationText = messages.map((m) => m.content).join(" ").toLowerCase();
    detectedFlags = campaign.blockedTopics.filter((topic) =>
      conversationText.includes(topic.toLowerCase())
    );
  } catch {
    // Non-fatal — continue without safety context
  }

  // Step 2: Veto context
  const recentVetoCount = store.vetoed.length;
  const vetoContext =
    recentVetoCount > 0
      ? `Human operators have vetoed ${recentVetoCount} of your previous decisions this session. Exercise more caution.`
      : "No decisions have been vetoed this session.";

  // Step 3: GPT-4o reasoning (auto-traced by Overmind)
  const systemPrompt = `You are Sentinel, an autonomous media buying agent for ${campaign.advertiser}.

Campaign: ${campaign.name}
Goal: ${campaign.goal}
Max CPM: $${campaign.maxCPM}
Brand keywords (positive signals): ${campaign.brandKeywords.join(", ")}
Blocked topics (auto-flag triggers): ${campaign.blockedTopics.join(", ")}

${vetoContext}

Return ONLY valid JSON:
{
  "decision": "bid" | "skip" | "flagged",
  "reasoning": "2-3 sentence explanation a human operator can understand",
  "confidence": <integer 0-100>,
  "flags": ["specific concerns, empty if none"],
  "suggestedCPM": <float, recommended bid if bidding, 0 otherwise>
}

Rules:
- "bid": high user intent, brand-safe, CPM justified. Never exceed $${campaign.maxCPM}.
- "skip": low intent or poor match — not a safety concern, just not worth bidding.
- "flagged": potential brand safety issue or blocked topic detected. Always flag, never bid.`;

  const userPrompt = `Conversation:
${messages.map((m) => `[${m.role}]: ${m.content}`).join("\n")}

Brand safety check for ${campaign.advertiser}:
${brandSafetyContext}

Detected blocked topics: ${detectedFlags.length > 0 ? detectedFlags.join(", ") : "none"}

Make your decision.`;

  let agentDecision: AgentDecision = {
    decision: "skip",
    reasoning: "Agent error — defaulted to skip.",
    confidence: 0,
    flags: [],
    suggestedCPM: 0,
  };

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 512,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    agentDecision = JSON.parse(raw);
  } catch {
    // Keep default skip
  }

  // Step 4: If bidding, call Thrad
  let adReturned: {
    headline: string;
    description: string;
    advertiser: string;
    price: number;
    ctaText: string;
  } | undefined;

  if (agentDecision.decision === "bid") {
    const bid = await requestBid(
      `user_${uuid().slice(0, 8)}`,
      `chat_${uuid().slice(0, 8)}`,
      messages
    );
    if (bid) {
      adReturned = {
        headline: bid.headline,
        description: bid.description,
        advertiser: bid.advertiser,
        price: bid.price,
        ctaText: bid.ctaText,
      };
    }
  }

  addDecision({
    campaignName: campaign.name,
    advertiser: campaign.advertiser,
    contextSnippet,
    fullContext: messages,
    decision: agentDecision.decision,
    reasoning: agentDecision.reasoning,
    confidence: agentDecision.confidence,
    flags: [...new Set([...detectedFlags, ...(agentDecision.flags ?? [])])],
    suggestedCPM: agentDecision.suggestedCPM,
    adReturned,
  });
}
