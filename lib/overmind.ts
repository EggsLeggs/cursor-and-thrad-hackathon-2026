// @ts-nocheck — trace-sdk ships raw .ts; we use its instrumentation with a fixed OTLP exporter.
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { trace } from "@opentelemetry/api";
import OpenAI from "openai";

const SDK_VERSION = "0.0.6";

let sdk: NodeSDK | null = null;
let openaiInstrumented = false;

export type InitOptions = {
  apiKey?: string;
  serviceName?: string;
  baseUrl?: string;
};

/**
 * PATH B — Overmind tracing. Fixed ingest URL + auth header per
 * https://docs.overmindlab.ai/guides/integrations
 * (SDK 0.0.6 wrongly uses /traces/create and X-API-TOKEN).
 */
export function init(options: InitOptions = {}) {
  const apiKey = options.apiKey ?? process.env.OVERMIND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[overmind] OVERMIND_API_KEY not set — traces will not be sent");
    }
    return;
  }

  const baseUrl =
    options.baseUrl ??
    process.env.OVERMIND_TRACES_URL ??
    "https://api.overmindlab.ai";
  const appName = options.serviceName ?? "sentinel";

  const traceExporter = new OTLPTraceExporter({
    url: `${baseUrl}/api/v1/traces`,
    headers: { "X-Api-Key": apiKey },
  });

  const enableBatching = process.env.NODE_ENV === "production";
  const spanProcessor = enableBatching
    ? new BatchSpanProcessor(traceExporter)
    : new SimpleSpanProcessor(traceExporter);

  const { OpenAIInstrumentation } = require("@overmind-lab/trace-sdk");
  const instrumentations = [];
  if (!openaiInstrumented) {
    const openaiInstrumentation = new OpenAIInstrumentation({ enabled: true });
    openaiInstrumentation.manuallyInstrument(OpenAI);
    instrumentations.push(openaiInstrumentation);
    openaiInstrumented = true;
  }

  if (sdk) return;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: appName,
    [ATTR_SERVICE_VERSION]: SDK_VERSION,
    "deployment.environment":
      process.env.DEPLOYMENT_ENVIRONMENT ?? "development",
    "overmind.sdk.name": "sentinel-overmind",
    "overmind.sdk.version": SDK_VERSION,
  });

  sdk = new NodeSDK({
    resource,
    spanProcessors: [spanProcessor],
    instrumentations,
  });
  sdk.start();
}

/** Flush spans to Overmind without tearing down the SDK (safe across repeated API calls). */
export async function flushOvermind() {
  const provider = trace.getTracerProvider() as { forceFlush?: () => Promise<void> };
  if (provider.forceFlush) await provider.forceFlush();
}

/** Flush and shut down — use in one-shot scripts (see scripts/test-overmind.ts). */
export async function shutdownOvermind() {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
