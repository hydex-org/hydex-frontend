"use client";

import * as React from "react";
import { useSolana } from "../solana-provider";
import { WalletConnectButton } from "../wallet-connect-button";
import {GenerateShieldedAddressButton} from "../GenerateShieldedAddress";
type TabKey = "first" | "second";

export default function TwoTabPane() {
    const [active, setActive] = React.useState<TabKey>("first");

    const { selectedWallet, selectedUvfk, selectedAccountIdx } = useSolana();

    const tabs = [
        { key: "first" as const, label: "ZCash -> Solana\n\nZEC->wZEC" },
        { key: "second" as const, label: "Solana -> Zcash\n\nwZEC->ZEC" },
    ];

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();

        const idx = tabs.findIndex((t) => t.key === active);
        const nextIdx = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        setActive(tabs[nextIdx].key);
    };

    return (
        <div className="w-full max-w-xl rounded-2xl   shadow-sm">
            {/* Tab list */}
            <div
                role="tablist"
                aria-label="Two tabs"
                onKeyDown={onKeyDown}
                className="relative grid grid-cols-2 rounded-xl p-1"
            >
                {/* Sliding pill */}
                <div
                    aria-hidden="true"
                    className={[
                        "absolute top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg  shadow transition-transform duration-200",
                        active === "first" ? "translate-x-0" : "translate-x-full",
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
                            onClick={() => setActive(t.key)}
                            className={[
                                "relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                                selected ? "text-zinc-500" : "text-white/90 hover:text-white",
                            ].join(" ")}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Panels */}
            <div className="mt-4">
                <section
                    role="tabpanel"
                    id="first-panel"
                    aria-labelledby="first-tab"
                    hidden={active !== "first"}
                    className="rounded-xl border border-zinc-200 p-4"
                >

                    
{selectedWallet && <GenerateShieldedAddressButton/>}

                </section>

                <section
                    role="tabpanel"
                    id="second-panel"
                    aria-labelledby="second-tab"
                    hidden={active !== "second"}
                    className="rounded-xl border border-zinc-200 p-4"
                >
                    Test
                </section>
            </div>
        </div>
    );
}
