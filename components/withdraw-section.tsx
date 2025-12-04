"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";

export function WithdrawSection() {
  const { selectedAccount } = useSolana();
  const [zcashAddress, setZcashAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [balance, setBalance] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  // Fetch sZEC balance from RPC
  React.useEffect(() => {
    async function fetchBalance() {
      if (!selectedAccount?.address) {
        setBalance(null);
        return;
      }

      try {
        // Use Solana RPC to get token accounts
        const response = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenAccountsByOwner",
            params: [
              selectedAccount.address,
              { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
              { encoding: "jsonParsed" },
            ],
          }),
        });

        const data = await response.json();
        // sZEC mint PDA derived from wzec_bridge program
        const szecMint = "96p2Rhb4DsuZVC8yBGjGPimFbH111NqaYAxE42Y2Poza";

        interface TokenAccount {
          account: {
            data: {
              parsed: {
                info: {
                  mint: string;
                  tokenAmount: {
                    amount: string;
                    decimals: number;
                  };
                };
              };
            };
          };
        }

        const szecAccount = data.result?.value?.find(
          (acc: TokenAccount) => acc.account.data.parsed.info.mint === szecMint
        );

        if (szecAccount) {
          const tokenAmount = szecAccount.account.data.parsed.info.tokenAmount;
          const balanceZec =
            Number(tokenAmount.amount) / Math.pow(10, tokenAmount.decimals);
          setBalance(balanceZec.toFixed(8));
        } else {
          setBalance("0");
        }
      } catch {
        setBalance("0");
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [selectedAccount?.address]);

  const handleWithdraw = async () => {
    if (!selectedAccount?.address || !zcashAddress || !amount) return;

    setIsLoading(true);
    setStatus("Initiating withdrawal...");

    try {
      // 1. Get auth token
      const challengeRes = await fetch(
        "http://localhost:3001/v1/auth/challenge",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solana_pubkey: selectedAccount.address }),
        }
      );
      const { challenge, nonce } = await challengeRes.json();

      // 2. Sign message
      const messageBytes = new TextEncoder().encode(challenge);
      let signedMessage: string;

      const phantom = (
        window as Window & {
          phantom?: {
            solana?: {
              signMessage: (
                msg: Uint8Array,
                encoding: string
              ) => Promise<{ signature: Uint8Array }>;
            };
          };
        }
      ).phantom;
      const solana = (
        window as Window & {
          solana?: {
            signMessage: (
              msg: Uint8Array,
              encoding: string
            ) => Promise<{ signature: Uint8Array } | Uint8Array>;
          };
        }
      ).solana;

      if (phantom?.solana?.signMessage) {
        const { signature } = await phantom.solana.signMessage(
          messageBytes,
          "utf8"
        );
        signedMessage = btoa(String.fromCharCode(...signature));
      } else if (solana?.signMessage) {
        const result = await solana.signMessage(messageBytes, "utf8");
        const sig = "signature" in result ? result.signature : result;
        signedMessage = btoa(String.fromCharCode(...sig));
      } else {
        throw new Error("Wallet not found");
      }

      // 3. Verify and get token
      const verifyRes = await fetch(
        "http://localhost:3001/v1/auth/verify-wallet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            solana_pubkey: selectedAccount.address,
            signed_message: signedMessage,
            nonce,
            message: challenge,
          }),
        }
      );
      const { access_token } = await verifyRes.json();

      // 4. Create burn intent
      setStatus("Creating burn intent...");
      const amountZatoshi = Math.floor(parseFloat(amount) * 100_000_000);

      const burnRes = await fetch("http://localhost:3001/v1/burn-intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          idempotency_key: `burn-${Date.now()}`,
          user: selectedAccount.address,
          amount: amountZatoshi.toString(),
          zcash_address: zcashAddress,
          network: "testnet",
        }),
      });

      if (!burnRes.ok) {
        const error = await burnRes.json();
        throw new Error(error.error?.message || "Failed to create burn intent");
      }

      const burnResult = await burnRes.json();
      setStatus(
        `✓ Burn intent created! ID: ${burnResult.burn_id}. Your ZEC will be sent once processed.`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (balance) {
      setAmount(balance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="rounded-2xl border border-[#97f01d] bg-slate-900/40 p-6 shadow-sm">
        <p className="mb-5 text-lg font-medium leading-snug text-zinc-200/90">
          Withdraw your wZEC back to native ZEC on the Zcash network. Enter your
          shielded Zcash address below.
        </p>

        {/* Balance display */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
          <span className="text-zinc-400">Your wZEC Balance:</span>
          <span className="text-xl font-semibold text-zinc-100">
            {balance !== null ? `${balance} wZEC` : "Loading..."}
          </span>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Amount to Withdraw
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-xl bg-black/20 px-4 py-3 text-lg text-zinc-200 placeholder:text-zinc-500 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[#97f01d]/60"
            />
            <button
              onClick={setMaxAmount}
              className="rounded-xl bg-[#97f01d]/20 px-4 py-3 text-sm font-semibold text-[#97f01d] hover:bg-[#97f01d]/30"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Zcash address input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Zcash Shielded Address
          </label>
          <input
            type="text"
            value={zcashAddress}
            onChange={(e) => setZcashAddress(e.target.value)}
            placeholder="utest1... or u1..."
            className="w-full rounded-xl bg-black/20 px-4 py-3 text-lg text-zinc-200 placeholder:text-zinc-500 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[#97f01d]/60"
          />
          <p className="mt-1 text-sm text-zinc-500">
            Enter your Zcash unified address (starts with u)
          </p>
        </div>

        {/* Withdraw button */}
        <button
          onClick={handleWithdraw}
          disabled={
            !selectedAccount?.address || !zcashAddress || !amount || isLoading
          }
          className="w-full rounded-xl bg-[#97f01d] py-4 text-center text-xl font-semibold text-black shadow-sm transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Processing..." : "Withdraw to Zcash"}
        </button>

        {/* Status message */}
        {status && (
          <div className="mt-4 rounded-xl bg-black/20 px-4 py-3 text-sm text-zinc-300">
            {status}
          </div>
        )}
      </div>

      {/* Stats card */}
      <div className="rounded-2xl bg-white/5 px-6 py-6 ring-1 ring-white/5">
        <div className="grid grid-cols-2 gap-y-4">
          <div className="text-xl font-semibold text-zinc-500/90">
            Exchange Rate
          </div>
          <div className="text-right text-xl font-semibold text-zinc-200">
            1 wZEC = 1 ZEC
          </div>

          <div className="text-xl font-semibold text-zinc-500/90">
            Bridge Fee
          </div>
          <div className="text-right text-xl font-semibold text-zinc-200">
            0.5%
          </div>

          <div className="text-xl font-semibold text-zinc-500/90">
            Estimated Time
          </div>
          <div className="text-right text-xl font-semibold text-zinc-200">
            ~5-10 minutes
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl border border-amber-400/80 bg-amber-500/10 px-6 py-5 text-lg font-medium text-amber-300">
        <span className="mr-2">⚡</span>
        Your ZEC will be sent to a shielded address, preserving your privacy
      </div>
    </div>
  );
}
