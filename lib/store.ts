import { v4 as uuid } from "uuid";

export type Message = { role: "user" | "assistant"; content: string };

export type Decision = {
  id: string;
  timestamp: string;
  campaignName: string;
  advertiser: string;
  contextSnippet: string;
  fullContext: Message[];
  decision: "bid" | "skip" | "flagged";
  reasoning: string;
  confidence: number;
  flags: string[];
  suggestedCPM?: number;
  adReturned?: {
    headline: string;
    description: string;
    advertiser: string;
    price: number;
    ctaText: string;
  };
  humanAction?: "approved" | "vetoed" | "flagged";
  humanNote?: string;
  humanTimestamp?: string;
};

export type Campaign = {
  name: string;
  advertiser: string;
  goal: string;
  maxCPM: number;
  brandKeywords: string[];
  blockedTopics: string[];
};

export const store: {
  decisions: Decision[];
  campaign: Campaign;
  vetoed: string[];
} = {
  decisions: [],
  campaign: {
    name: "Nike UK — Running Q3",
    advertiser: "Nike",
    goal: "Reach users with high purchase intent for running shoes and athletic gear",
    maxCPM: 8.0,
    brandKeywords: ["running", "fitness", "training", "sport", "marathon", "gym"],
    blockedTopics: ["controversy", "lawsuit", "sweatshop", "labour", "protest"],
  },
  vetoed: [],
};

export function addDecision(d: Omit<Decision, "id" | "timestamp">): Decision {
  const decision: Decision = { ...d, id: uuid(), timestamp: new Date().toISOString() };
  store.decisions.unshift(decision);
  if (store.decisions.length > 50) store.decisions = store.decisions.slice(0, 50);
  return decision;
}

export function clearDecisions() {
  store.decisions = [];
  store.vetoed = [];
}

export function applyHumanAction(
  id: string,
  action: "approved" | "vetoed" | "flagged",
  note?: string
) {
  const d = store.decisions.find((x) => x.id === id);
  if (!d) return null;
  d.humanAction = action;
  d.humanNote = note;
  d.humanTimestamp = new Date().toISOString();
  if (action === "vetoed") store.vetoed.push(id);
  return d;
}
