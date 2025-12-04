// components/tabs/tabViewerBottom.tsx (BridgeActivityCard)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSolana } from "../solana-provider";

type BridgeStatus =
  | "IDLE"
  | "DEPOSIT_RECEIVED"
  | "CONFIRMING"
  | "MINTING"
  | "COMPLETE";

const STATUS_URL = "/api/bridge/status";
const POLL_INTERVAL_MS = 5000;

const STATUS_CONFIG: Record<
  BridgeStatus,
  { label: string; subtitle: string; color: "green" | "blue"; done: boolean }
> = {
  IDLE: {
    label: "Awaiting Deposit",
    subtitle: "Send ZEC to your shielded address to begin bridging",
    color: "green",
    done: false,
  },
  DEPOSIT_RECEIVED: {
    label: "Deposit Received",
    subtitle: "Your ZEC deposit has been detected",
    color: "green",
    done: true,
  },
  CONFIRMING: {
    label: "Confirming on Zcash",
    subtitle: "Waiting for confirmations on the Zcash network",
    color: "blue",
    done: false,
  },
  MINTING: {
    label: "Minting wZEC",
    subtitle: "Creating wZEC tokens on Solana",
    color: "blue",
    done: false,
  },
  COMPLETE: {
    label: "Bridge Complete",
    subtitle: "Your wZEC has been sent to your wallet",
    color: "green",
    done: true,
  },
};

export default function BridgeActivityCard() {
  const { selectedUvfk } = useSolana();
  const [status, setStatus] = useState<BridgeStatus>("IDLE");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStatus = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(STATUS_URL, {
        signal: abortControllerRef.current.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || "IDLE");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      // Keep current status on error
    }
  }, []);

  useEffect(() => {
    if (!selectedUvfk) return;

    // Initial fetch after a tick to avoid sync setState in effect
    const timeoutId = setTimeout(fetchStatus, 0);
    const intervalId = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStatus, selectedUvfk]);

  const config = STATUS_CONFIG[status];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/60 p-5 shadow-[0_18px_70px_rgba(0,0,0,.6)]">
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(420px_240px_at_30%_10%,rgba(255,255,255,.10),transparent_60%),radial-gradient(500px_300px_at_80%_20%,rgba(255,255,255,.06),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />

        {selectedUvfk && (
          <div className="relative flex items-center gap-4 py-6">
            <StatusIndicator color={config.color} done={config.done} />
            <div>
              <div className="text-xl font-semibold text-white/90">
                {config.label}
              </div>
              <div className="mt-1 text-sm text-white/40">
                {config.subtitle}
              </div>
            </div>

            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusIndicator({
  color,
  done,
}: {
  color: "green" | "blue";
  done: boolean;
}) {
  const isGreen = color === "green";
  const borderColor = isGreen ? "border-[#a6ff4d]/40" : "border-[#2f7cff]/40";
  const shadowColor = isGreen
    ? "shadow-[0_0_0_6px_rgba(166,255,77,.08)]"
    : "shadow-[0_0_0_6px_rgba(47,124,255,.08)]";
  const spinnerBorder = isGreen
    ? "border-[#a6ff4d]/25 border-r-[#a6ff4d]/55 border-t-[#a6ff4d]/95"
    : "border-[#2f7cff]/25 border-r-[#2f7cff]/55 border-t-[#2f7cff]/95";
  const dropShadow = isGreen
    ? "drop-shadow-[0_0_10px_rgba(166,255,77,.25)]"
    : "drop-shadow-[0_0_10px_rgba(47,124,255,.25)]";
  const checkColor = isGreen ? "#a6ff4d" : "#2f7cff";

  return (
    <div
      className={`grid h-12 w-12 place-items-center rounded-full border-[3px] ${borderColor} ${shadowColor}`}
    >
      {done ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M6.5 12.5l3.4 3.6L17.8 8.2"
            stroke={checkColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span
          className={`h-7 w-7 rounded-full border-4 ${spinnerBorder} ${dropShadow}`}
          style={{ animation: "spin .9s linear infinite" }}
        />
      )}
    </div>
  );
}
