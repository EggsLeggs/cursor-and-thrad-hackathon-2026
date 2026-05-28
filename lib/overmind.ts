import { OvermindClient } from "@overmind-lab/trace-sdk";
import { OpenAI } from "openai";

let initialised = false;

export function ensureOvermind() {
  if (initialised) return;
  if (!process.env.OVERMIND_API_KEY) return;
  const client = new OvermindClient({
    apiKey: process.env.OVERMIND_API_KEY,
    appName: "sentinel",
  });
  client.initTracing({
    enableBatching: false,
    enabledProviders: { openai: OpenAI },
  });
  initialised = true;
}
