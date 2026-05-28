"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Decision, Campaign } from "@/lib/store";
import { DecisionFeed } from "@/components/DecisionFeed";
import { CampaignPanel } from "@/components/CampaignPanel";
import { scenarios } from "@/lib/scenarios";

type Stats = {
  total: number;
  bids: number;
  skips: number;
  flagged: number;
  vetoed: number;
  humanReviewed: number;
};

export default function Home() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    bids: 0,
    skips: 0,
    flagged: 0,
    vetoed: 0,
    humanReviewed: 0,
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDecisions = useCallback(async () => {
    const res = await fetch("/api/decisions");
    const data = await res.json();
    setDecisions(data.decisions);
    setCampaign(data.campaign);
    setStats(data.stats);
  }, []);

  useEffect(() => {
    fetchDecisions();
    intervalRef.current = setInterval(fetchDecisions, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDecisions]);

  async function runScenario(index: number) {
    setRunning(true);
    await fetch("/api/run-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioIndex: index }),
    });
    setTimeout(() => setRunning(false), 3500);
  }

  async function clearHistory() {
    await fetch("/api/decisions", { method: "DELETE" });
    await fetchDecisions();
  }

  async function runAll() {
    setRunning(true);
    for (let i = 0; i < scenarios.length; i++) {
      await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioIndex: i }),
      });
      await new Promise((r) => setTimeout(r, 1000));
    }
    setTimeout(() => setRunning(false), 4000);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#161616",
        backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "#2a2a2a", background: "#161616" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00d4aa" }} />
          <span className="text-sm font-mono font-medium tracking-tight" style={{ color: "#ededed" }}>
            SENTINEL
          </span>
          <span
            className="text-xs font-mono px-2.5 py-0.5 rounded-full border"
            style={{ color: "#707070", borderColor: "#3e3e3e" }}
          >
            AI Campaign Oversight Console
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono" style={{ color: "#505050" }}>
          {running && <span style={{ color: "#00d4aa" }}>agent running…</span>}
          <span>Thrad · Overmind · Tavily</span>
        </div>
      </header>

      {/* Layout */}
      <div className="flex" style={{ height: "calc(100vh - 49px)" }}>
        {/* Feed */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono" style={{ color: "#505050" }}>
                decision log
                {decisions.length > 0 && (
                  <span className="ml-2" style={{ color: "#707070" }}>
                    {decisions.length} entries
                  </span>
                )}
              </span>
              {decisions.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs font-mono px-2.5 py-1 rounded-full border transition-colors duration-150 hover:bg-[#2a2a2a]"
                  style={{ color: "#707070", borderColor: "#3e3e3e" }}
                >
                  clear
                </button>
              )}
            </div>
            <DecisionFeed decisions={decisions} onAction={fetchDecisions} />
          </div>
        </main>

        {/* Panel */}
        <aside
          className="w-80 shrink-0 overflow-y-auto border-l p-4"
          style={{ borderColor: "#2a2a2a", background: "#161616" }}
        >
          {campaign && (
            <CampaignPanel
              campaign={campaign}
              stats={stats}
              running={running}
              onRunScenario={runScenario}
              onRunAll={runAll}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
