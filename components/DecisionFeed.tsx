"use client";
import { Decision } from "@/lib/store";
import { DecisionCard } from "./DecisionCard";

export function DecisionFeed({
  decisions,
  onAction,
}: {
  decisions: Decision[];
  onAction: () => void;
}) {
  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-3xl mb-3" style={{ color: "#3e3e3e" }}>
          ⬡
        </div>
        <div className="text-xs font-mono" style={{ color: "#505050" }}>
          No decisions yet — fire a scenario to begin
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((d) => (
        <DecisionCard key={d.id} decision={d} onAction={onAction} />
      ))}
    </div>
  );
}
