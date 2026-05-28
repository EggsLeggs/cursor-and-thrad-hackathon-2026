"use client";
import { Campaign } from "@/lib/store";
import { scenarios } from "@/lib/scenarios";

type Stats = {
  total: number;
  bids: number;
  skips: number;
  flagged: number;
  vetoed: number;
  humanReviewed: number;
};

type Props = {
  campaign: Campaign;
  stats: Stats;
  running: boolean;
  onRunScenario: (i: number) => void;
  onRunAll: () => void;
};

export function CampaignPanel({ campaign, stats, running, onRunScenario, onRunAll }: Props) {
  const statItems = [
    { label: "total",    value: stats.total,         color: "#ededed" },
    { label: "bids",     value: stats.bids,          color: "#10b981" },
    { label: "skips",    value: stats.skips,         color: "#6b7280" },
    { label: "flagged",  value: stats.flagged,       color: "#ef4444" },
    { label: "vetoed",   value: stats.vetoed,        color: "#f97316" },
    { label: "reviewed", value: stats.humanReviewed, color: "#6366f1" },
  ];

  return (
    <div className="space-y-3">
      {/* Campaign config */}
      <div
        className="rounded-lg border p-4 space-y-3"
        style={{ background: "#1c1c1c", borderColor: "#3e3e3e" }}
      >
        <div
          className="text-xs uppercase tracking-widest font-mono font-medium"
          style={{ color: "#00d4aa" }}
        >
          Active Campaign
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: "#ededed" }}>
            {campaign.name}
          </div>
          <div className="text-xs mt-1 leading-relaxed" style={{ color: "#707070" }}>
            {campaign.goal}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <div style={{ color: "#707070" }}>advertiser</div>
            <div style={{ color: "#ededed" }}>{campaign.advertiser}</div>
          </div>
          <div>
            <div style={{ color: "#707070" }}>max CPM</div>
            <div style={{ color: "#ededed" }}>${campaign.maxCPM.toFixed(2)}</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-mono mb-1.5" style={{ color: "#707070" }}>
            blocked topics
          </div>
          <div className="flex flex-wrap gap-1">
            {campaign.blockedTopics.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full border font-mono"
                style={{ color: "#ef4444", borderColor: "#ef444430", background: "#ef444410" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="rounded-lg border p-4"
        style={{ background: "#1c1c1c", borderColor: "#3e3e3e" }}
      >
        <div
          className="text-xs uppercase tracking-widest font-mono font-medium mb-3"
          style={{ color: "#00d4aa" }}
        >
          Session Stats
        </div>
        <div className="grid grid-cols-3 gap-2">
          {statItems.map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-mono font-medium" style={{ color }}>
                {value}
              </div>
              <div className="text-xs font-mono" style={{ color: "#505050" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div
        className="rounded-lg border p-4 space-y-1.5"
        style={{ background: "#1c1c1c", borderColor: "#3e3e3e" }}
      >
        <div
          className="text-xs uppercase tracking-widest font-mono font-medium mb-2"
          style={{ color: "#00d4aa" }}
        >
          Fire Scenario
        </div>
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => onRunScenario(i)}
            disabled={running}
            className="w-full text-left text-xs py-2 px-3 rounded-md border transition-colors duration-150 disabled:opacity-40 hover:bg-[#2a2a2a]"
            style={{ borderColor: "#3e3e3e", color: "#ededed", background: "#161616" }}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={onRunAll}
          disabled={running}
          className="w-full text-xs py-2 px-3 rounded-md border transition-colors duration-150 font-medium disabled:opacity-40 mt-1"
          style={{ borderColor: "#00d4aa30", color: "#00d4aa", background: "#00d4aa08" }}
        >
          {running ? "running…" : "▶ Run all scenarios"}
        </button>
      </div>

      {/* Overmind link */}
      <a
        href="https://console.overmindlab.ai/agents"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full rounded-lg border px-3 py-2.5 text-xs font-mono transition-colors duration-150 hover:bg-[#2a2a2a]"
        style={{ borderColor: "#3e3e3e", color: "#707070", background: "#1c1c1c" }}
      >
        <span>View Overmind traces</span>
        <span>↗</span>
      </a>
    </div>
  );
}
