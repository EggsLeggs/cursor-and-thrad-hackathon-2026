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

export {
  addDecision,
  applyHumanAction,
  clearDecisions,
  getDecisions,
  getVetoedCount,
} from "./decisions-db";
