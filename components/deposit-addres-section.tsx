"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";
import { GenerateShieldedAddressButton } from "./GenerateShieldedAddress";

export function DepositAddressSection() {
  const { selectedUvfk } = useSolana();

  const copy = async () => {
    if (!selectedUvfk) return;
    try {
      //await navigator.clipboard.writeText(sele);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top blue outlined card */}
      <div className="rounded-2xl border border-sky-500/70 bg-slate-900/40 p-6 shadow-sm">
        <p className="mb-5 text-lg font-medium leading-snug text-zinc-200/90">
          Generate a shielded Zcash address to deposit your ZEC. Once received, your funds will be
          bridged to wZEC on Solana.
        </p>

        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <GenerateShieldedAddressButton />
          </div>
        </div>
      </div>

      {selectedUvfk && (
        <>
          {/* Shielded address */}
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-zinc-100">Your Shielded Deposit Address</div>

            <div className="flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-xl bg-black/20 px-4 py-3 font-mono text-lg text-zinc-200">
                <span className="block truncate">{selectedUvfk}</span>
              </div>

              <button
                type="button"
                onClick={copy}
                className="grid h-12 w-12 place-items-center rounded-xl bg-black/25 text-zinc-200 hover:bg-black/35 transition"
                aria-label="Copy address"
                title="Copy"
              >
                {/* simple copy icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 9h10v12H9V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="text-base text-zinc-400">Send ZEC to this address. Minimum: 0.01 ZEC</div>
          </div>

          {/* Solana receiving address */}
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-zinc-100">Solana Receiving Address</div>

            <input
              placeholder="Enter your Solana wallet address"
              className="w-full rounded-xl bg-black/20 px-4 py-4 text-lg text-zinc-200 placeholder:text-zinc-500 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-sky-500/60"
            />

            <div className="text-base text-zinc-400">Where you want to receive your wZEC on Solana</div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl bg-white/5 px-6 py-6 ring-1 ring-white/5">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-xl font-semibold text-zinc-500/90">Exchange Rate</div>
              <div className="text-right text-xl font-semibold text-zinc-200">1 ZEC = 1 wZEC</div>

              <div className="text-xl font-semibold text-zinc-500/90">Bridge Fee</div>
              <div className="text-right text-xl font-semibold text-zinc-200">0.5%</div>

              <div className="text-xl font-semibold text-zinc-500/90">Estimated Time</div>
              <div className="text-right text-xl font-semibold text-zinc-200">~10-15 minutes</div>
            </div>
          </div>

          {/* Green banner */}
          <div className="rounded-2xl border border-lime-400/80 bg-lime-500/10 px-6 py-5 text-xl font-semibold text-lime-300">
            <span className="mr-2">✓</span>
            Shielded transaction ensures your privacy on the Zcash network
          </div>
        </>
      )}
    </div>
  );
}
