"use client";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { Decision } from "@/lib/store";

export function DecisionCard({
  decision: d,
  onAction,
}: {
  decision: Decision;
  onAction: () => void;
}) {
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  async function act(action: "approved" | "vetoed" | "flagged") {
    setActing(true);
    await fetch(`/api/decisions/${d.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    onAction();
    setActing(false);
  }

  const time = new Date(d.timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const borderColor =
    d.humanAction === "vetoed"
      ? "#f9731640"
      : d.humanAction === "approved"
      ? "#6366f140"
      : d.decision === "flagged"
      ? "#ef444430"
      : "#3e3e3e";

  return (
    <div
      className="rounded-lg border p-4 space-y-3 transition-colors duration-150"
      style={{ background: "#232323", borderColor }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge
            status={
              d.humanAction === "vetoed"
                ? "vetoed"
                : d.humanAction === "approved"
                ? "approved"
                : d.decision
            }
          />
          <span className="text-xs font-mono" style={{ color: "#707070" }}>
            {d.id.slice(0, 8)}
          </span>
        </div>
        <span className="text-xs font-mono shrink-0" style={{ color: "#707070" }}>
          {time}
        </span>
      </div>

      {/* Conversation snippet */}
      <div
        className="rounded-md p-2.5 text-xs font-mono leading-relaxed"
        style={{ background: "#0f0f0f", color: "#707070" }}
      >
        <span className="text-xs uppercase tracking-widest mr-2" style={{ color: "#00d4aa" }}>
          ctx
        </span>
        &quot;{d.contextSnippet}
        {d.contextSnippet.length >= 120 ? "…" : ""}&quot;
      </div>

      {/* Reasoning */}
      <p className="text-sm leading-relaxed" style={{ color: "#ededed" }}>
        {d.reasoning}
      </p>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-4 text-xs font-mono" style={{ color: "#707070" }}>
        <span>
          confidence <span style={{ color: "#ededed" }}>{d.confidence}%</span>
        </span>
        {d.suggestedCPM ? (
          <span>
            CPM <span style={{ color: "#ededed" }}>${d.suggestedCPM.toFixed(2)}</span>
          </span>
        ) : null}
      </div>

      {/* Flags */}
      {d.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {d.flags.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full border font-mono"
              style={{ color: "#ef4444", borderColor: "#ef444430", background: "#ef444410" }}
            >
              ⚠ {f}
            </span>
          ))}
        </div>
      )}

      {/* Ad creative returned */}
      {d.adReturned && (
        <div
          className="rounded-md p-3 border space-y-1"
          style={{ borderColor: "#00d4aa20", background: "#00d4aa08" }}
        >
          <div
            className="text-xs uppercase tracking-widest font-mono mb-1.5"
            style={{ color: "#00d4aa" }}
          >
            ad served
          </div>
          <div className="text-sm font-medium" style={{ color: "#ededed" }}>
            {d.adReturned.headline}
          </div>
          {d.adReturned.description && (
            <div className="text-xs" style={{ color: "#707070" }}>
              {d.adReturned.description}
            </div>
          )}
          <div className="flex gap-3 text-xs font-mono mt-1" style={{ color: "#707070" }}>
            <span>{d.adReturned.advertiser}</span>
            <span>·</span>
            <span>CPM ${d.adReturned.price.toFixed(2)}</span>
            <span>·</span>
            <span>{d.adReturned.ctaText}</span>
          </div>
        </div>
      )}

      {/* Human action record */}
      {d.humanAction && (
        <div
          className="text-xs rounded-md p-2 font-mono"
          style={{ background: "#0f0f0f", color: "#707070" }}
        >
          operator: <span style={{ color: "#ededed" }}>{d.humanAction}</span>
          {d.humanNote && <> — &quot;{d.humanNote}&quot;</>}
        </div>
      )}

      {/* Action buttons — only before human acts */}
      {!d.humanAction && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            {(["approved", "vetoed", "flagged"] as const).map((action) => {
              const styles = {
                approved: {
                  color: "#6366f1",
                  border: "#6366f130",
                  hover: "hover:bg-[#6366f110]",
                  label: "✓ Approve",
                },
                vetoed: {
                  color: "#f97316",
                  border: "#f9731630",
                  hover: "hover:bg-[#f9731610]",
                  label: "✗ Veto",
                },
                flagged: {
                  color: "#f59e0b",
                  border: "#f59e0b30",
                  hover: "hover:bg-[#f59e0b10]",
                  label: "⚑ Flag",
                },
              }[action];
              return (
                <button
                  key={action}
                  onClick={() => act(action)}
                  disabled={acting}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 disabled:opacity-40 ${styles.hover}`}
                  style={{ color: styles.color, borderColor: styles.border }}
                >
                  {styles.label}
                </button>
              );
            })}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="w-full text-xs rounded-md px-2.5 py-1.5 font-mono outline-none transition-colors duration-150"
            style={{
              background: "#0f0f0f",
              border: "1px solid #3e3e3e",
              color: "#ededed",
            }}
          />
        </div>
      )}
    </div>
  );
}
