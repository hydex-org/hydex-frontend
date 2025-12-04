// components/tabs/tabViewerBottom.tsx (BridgeActivityCard)
"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";

// --- Types ---
type StepState = "done" | "active" | "todo";
type Step = { id: string; label: string; state: StepState };

type BridgeStatus = "DEPOSIT_RECEIVED" | "CONFIRMING" | "MINTING" | "COMPLETE" | "IDLE";

interface BridgeStatusResponse {
  status: BridgeStatus;
  amount?: string;
  timestamp?: number;
}

// --- Constants ---
const STATUS_URL = "/api/bridge/status";
const POLL_INTERVAL_MS = 5000;

// Maps API status to which step index is currently active (0-indexed)
const STATUS_TO_STEP_INDEX: Record<BridgeStatus, number> = {
  IDLE: -1, // No active bridging
  DEPOSIT_RECEIVED: 0,
  CONFIRMING: 1,
  MINTING: 2,
  COMPLETE: 3,
};

function deriveSteps(status: BridgeStatus): Step[] {
  const activeIndex = STATUS_TO_STEP_INDEX[status];
  const allDone = status === "COMPLETE";

  return [
    {
      id: "deposit",
      label: "Deposit Received",
      state: allDone || activeIndex > 0 ? "done" : activeIndex === 0 ? "active" : "todo",
    },
    {
      id: "confirm",
      label: "Confirming on Zcash Network",
      state: allDone || activeIndex > 1 ? "done" : activeIndex === 1 ? "active" : "todo",
    },
    {
      id: "mint",
      label: "Minting wZEC on Solana",
      state: allDone || activeIndex > 2 ? "done" : activeIndex === 2 ? "active" : "todo",
    },
    {
      id: "complete",
      label: "Bridge Complete",
      state: allDone ? "done" : "todo",
    },
  ];
}

export default function BridgeActivityCard() {
  const [tab, setTab] = useState<"activity" | "history">("activity");
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>("MINTING");
  const [amount, setAmount] = useState<string>("3.5");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStatus = useCallback(async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(STATUS_URL, {
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: BridgeStatusResponse = await res.json();
      setBridgeStatus(data.status);
      if (data.amount) setAmount(data.amount);
      setLastUpdated(new Date());
      setFetchError(false);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") return;
      // Keep last known state, just show error indicator
      setFetchError(true);
    }
  }, []);

  // Polling effect - only poll when on activity tab
  useEffect(() => {
    // Fetch immediately on mount
    fetchStatus();

    // Only set up interval polling if on activity tab
    if (tab !== "activity") return;

    const intervalId = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      // Abort in-flight request on cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStatus, tab]);

  const steps = useMemo(() => deriveSteps(bridgeStatus), [bridgeStatus]);

  const isComplete = bridgeStatus === "COMPLETE";
  const isIdle = bridgeStatus === "IDLE";

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="w-full">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/60 p-5 shadow-[0_18px_70px_rgba(0,0,0,.6)]">
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(420px_240px_at_30%_10%,rgba(255,255,255,.10),transparent_60%),radial-gradient(500px_300px_at_80%_20%,rgba(255,255,255,.06),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />

        {/* segmented control */}
        <div className="relative mb-5 rounded-full border border-white/10 bg-white/5 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setTab("activity")}
              aria-selected={tab === "activity"}
              className={[
                "rounded-full py-3 text-lg font-semibold transition",
                tab === "activity"
                  ? "bg-black/35 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                  : "text-white/55 hover:text-white/80",
              ].join(" ")}
            >
              Activity
            </button>
            <button
              onClick={() => setTab("history")}
              aria-selected={tab === "history"}
              className={[
                "rounded-full py-3 text-lg font-semibold transition",
                tab === "history"
                  ? "bg-black/35 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                  : "text-white/55 hover:text-white/80",
              ].join(" ")}
            >
              History
            </button>
          </div>
        </div>

        {/* header */}
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-lg text-white/65">Bridging</div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight">
              {amount} ZEC to wZEC
            </div>
          </div>

          <div
            className={[
              "mt-1 rounded-full border px-4 py-2 text-base font-bold shadow-[inset_0_1px_0_rgba(255,255,255,.08)]",
              isComplete
                ? "border-[#a6ff4d]/25 bg-[#a6ff4d]/15 text-[#a6ff4d]"
                : isIdle
                  ? "border-white/20 bg-white/10 text-white/60"
                  : "border-[#2f7cff]/25 bg-[#2f7cff]/15 text-[#2f7cff]",
            ].join(" ")}
          >
            {isComplete ? "Complete" : isIdle ? "Idle" : "In Progress"}
          </div>
        </div>

        <div className="relative my-5 h-px bg-white/10" />

        {/* Last updated + error indicator */}
        <div className="relative mb-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {lastUpdated ? `Last updated: ${formatTime(lastUpdated)}` : "Fetching status..."}
          </span>
          {fetchError && (
            <span className="text-amber-400/70">Having trouble updating</span>
          )}
        </div>

        {tab === "activity" ? (
          <div className="relative">
            <div className="grid grid-cols-[44px_1fr] gap-y-6">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <Rail
                    state={s.state}
                    showConnector={idx !== steps.length - 1}
                    connectorActive={
                      steps[idx].state === "done" ||
                      (steps[idx].state === "active" && idx < steps.length - 1)
                    }
                    connectorShort={idx !== 0}
                  />
                  <div
                    className={[
                      "flex min-h-[34px] items-center text-xl font-semibold",
                      s.state === "todo" ? "text-white/30" : "text-white/90",
                    ].join(" ")}
                  >
                    {s.label}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white/60">History</div>
        )}

        {/* local keyframes */}
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </section>
    </div>
  );
}

function Rail({
  state,
  showConnector,
  connectorActive,
  connectorShort,
}: {
  state: StepState;
  showConnector: boolean;
  connectorActive: boolean;
  connectorShort: boolean;
}) {
  const isDone = state === "done";
  const isActive = state === "active";

  return (
    <div className="relative">
      <div
        className={[
          "grid h-9 w-9 place-items-center rounded-full border-[3px]",
          isDone
            ? "border-[#a6ff4d]/90 shadow-[0_0_0_6px_rgba(166,255,77,.08)]"
            : isActive
              ? "border-[#2f7cff]/90 shadow-[0_0_0_6px_rgba(47,124,255,.08)]"
              : "border-white/25 opacity-45",
        ].join(" ")}
        aria-hidden="true"
      >
        {isDone ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 12.5l3.4 3.6L17.8 8.2"
              stroke="#a6ff4d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : isActive ? (
          <span
            className="h-[22px] w-[22px] rounded-full border-4 border-[#2f7cff]/25 border-r-[#2f7cff]/55 border-t-[#2f7cff]/95 drop-shadow-[0_0_10px_rgba(47,124,255,.25)]"
            style={{ animation: "spin .9s linear infinite" }}
          />
        ) : null}
      </div>

      {showConnector ? (
        <div
          className={[
            "absolute left-[16px] top-[40px] w-1 rounded-full",
            connectorShort ? "h-[48px]" : "h-14",
            connectorActive
              ? "bg-[#a6ff4d]/85 shadow-[0_0_0_6px_rgba(166,255,77,.06)]"
              : "bg-white/20 opacity-60",
          ].join(" ")}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
