"use client";

import * as React from "react";
import Image from "next/image";
import { useSolana } from "../solana-provider";

type TabKey = "first" | "second";

export default function TwoTabPane() {
  const [active, setActive] = React.useState<TabKey>("first");
  const { selectedTab, setSelectedTab } = useSolana();

  const tabs = [
    {
      key: "first" as const,
      label: "ZEC → wZEC",
      fromLogo: "/zcash-logo.webp",
      toLogo: "/solana-logo.webp",
      fromAlt: "Zcash",
      toAlt: "Solana",
    },
    {
      key: "second" as const,
      label: "wZEC → ZEC",
      fromLogo: "/solana-logo.webp",
      toLogo: "/zcash-logo.webp",
      fromAlt: "Solana",
      toAlt: "Zcash",
    },
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const idx = tabs.findIndex((t) => t.key === active);
    const nextIdx =
      e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : (idx - 1 + tabs.length) % tabs.length;

    setActive(tabs[nextIdx].key);
    console.log(selectedTab);
  };

  function changeState(value: React.SetStateAction<TabKey>) {
    setActive(value);
    console.log(value.toString());
    if (value.toString() == "first") {
      setSelectedTab(false);
    } else {
      setSelectedTab(true);
    }
  }

  const isFirst = active === "first";

  return (
    <div className="flex justify-center">
      {/* Tabs outer box */}
      <div className="inline-flex rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5">
        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Bridge direction"
          onKeyDown={onKeyDown}
          tabIndex={0}
          className="relative grid grid-cols-2 gap-1.5 outline-none"
        >
          {/* Selected pill indicator */}
          <span
            aria-hidden="true"
            className={[
              "absolute inset-y-0 left-0 w-[calc(50%-3px)] rounded-xl bg-zinc-800 border border-white/5 transition-transform duration-200 ease-out",
              isFirst ? "translate-x-0" : "translate-x-[calc(100%+6px)]",
            ].join(" ")}
          />

          {tabs.map((t) => {
            const selected = active === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${t.key}-panel`}
                id={`${t.key}-tab`}
                tabIndex={selected ? 0 : -1}
                onClick={() => changeState(t.key)}
                className={[
                  "relative z-10 rounded-xl px-6 py-3 transition-all duration-200",
                  "flex flex-col items-center gap-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
                  selected
                    ? "text-white"
                    : "text-white/60 hover:text-white/80",
                ].join(" ")}
              >
                {/* Logo row */}
                <div className="flex items-center gap-2">
                  <Image
                    src={t.fromLogo}
                    alt={t.fromAlt}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-white/40 text-sm">→</span>
                  <Image
                    src={t.toLogo}
                    alt={t.toAlt}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                {/* Label */}
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
