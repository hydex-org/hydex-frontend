"use client";

import * as React from "react";
import { useSolana } from "../solana-provider";
import { WalletConnectButton } from "../wallet-connect-button";
import { GenerateShieldedAddressButton } from "../GenerateShieldedAddress";
import { DepositAddressSection } from "../deposit-addres-section";

type TabKey = "first" | "second";

export default function TwoTabPane() {
  const [active, setActive] = React.useState<TabKey>("first");
  const { selectedWallet, selectedUvfk, selectedAccountIdx, selectedTab, setSelectedTab } = useSolana();

  const tabs = [
    { key: "first" as const, label: "ZCash -> Solana\n\nZEC->wZEC" },
    { key: "second" as const, label: "Solana -> Zcash\n\nwZEC->ZEC" },
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();

    const idx = tabs.findIndex((t) => t.key === active);
    const nextIdx =
      e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : (idx - 1 + tabs.length) % tabs.length;

    setActive(tabs[nextIdx].key);
    console.log(selectedTab);
  };

  const isFirst = active === "first";

  return (
    <div className="space-y-4">
      {/* Tabs outer box */}
      <div className="inline-flex rounded-xl border border-white/10 bg-zinc-900/60 p-1">
        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Two tabs"
          onKeyDown={onKeyDown}
          tabIndex={0} // allow keyboard events when focused
          className="relative grid grid-cols-2 gap-1 outline-none"
        >
          {/* Selected pill INSIDE the box */}
          <span
            aria-hidden="true"
            className={[
              "absolute inset-y-0 left-0 w-1/2 rounded-lg bg-white/10 transition-transform duration-200",
              isFirst ? "translate-x-0" : "translate-x-full",
            ].join(" ")}
          />

          {tabs.map((t) => {
            const selected = active === t.key;
            setSelectedTab(selected);
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${t.key}-panel`}
                id={`${t.key}-tab`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.key)}
                className={[
                  "relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition",
                  "whitespace-pre-line text-center leading-snug",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                  selected ? "text-zinc-100" : "text-white/80 hover:text-white",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
