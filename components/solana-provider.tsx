"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  useWallets,
  type UiWallet,
  type UiWalletAccount,
} from "@wallet-standard/react";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  address,
  lamports,
} from "@solana/kit";
import { StandardConnect } from "@wallet-standard/core";

// Create RPC connection
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const WS_ENDPOINT = "wss://api.devnet.solana.com";
const chain = "solana:devnet";
const rpc = createSolanaRpc(RPC_ENDPOINT);
const ws = createSolanaRpcSubscriptions(WS_ENDPOINT);

interface SolanaContextState {
  // RPC
  rpc: ReturnType<typeof createSolanaRpc>;
  ws: ReturnType<typeof createSolanaRpcSubscriptions>;
  chain: typeof chain;

  // Wallet State
  wallets: UiWallet[];
  selectedWallet: UiWallet | null;
  selectedAccount: UiWalletAccount | null;
  isConnected: boolean;
  balance: string | null; // SOL balance as string

  selectedUvfk: String | null;
  selectedAccountIdx: number | null;

  selectedTab: Boolean | false;
  // Wallet Actions
  setWalletAndAccount: (
    wallet: UiWallet | null,
    account: UiWalletAccount | null
  ) => void;

  setUfvkAndAccountIdx: (
    uvfk: String | null,
    accountIdx: number | null
  ) => void;

  setSelectedTab: (inp: Boolean | false) => void;

  refreshBalance: () => Promise<void>;
}

const SolanaContext = createContext<SolanaContextState | undefined>(undefined);

export function useSolana() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error("useSolana must be used within a SolanaProvider");
  }
  return context;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const allWallets = useWallets();

  // Filter for Solana wallets only that support signAndSendTransaction
  const wallets = useMemo(() => {
    return allWallets.filter(
      (wallet) =>
        wallet.chains?.some((c) => c.startsWith("solana:")) &&
        wallet.features.includes(StandardConnect) &&
        wallet.features.includes("solana:signAndSendTransaction")
    );
  }, [allWallets]);

  // State management
  const [selectedWallet, setSelectedWallet] = useState<UiWallet | null>(null);
  const [selectedAccount, setSelectedAccount] =
    useState<UiWalletAccount | null>(null);
  const [selectedUvfk, setSelectedUvfk] = useState<String | null>(null);
  const [selectedAccountIdx, setSelectedAccountIdx] = useState<number | null>(
    null
  );
  const [selectedTab, setSelectedTabVal] = useState<Boolean>(false);
  const [balance, setBalance] = useState<string | null>(null);

  // Fetch balance for the selected account
  const refreshBalance = useCallback(async () => {
    if (!selectedAccount?.address) {
      setBalance(null);
      return;
    }
    try {
      const result = await rpc
        .getBalance(address(selectedAccount.address))
        .send();
      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const solBalance = Number(result.value) / 1e9;
      setBalance(solBalance.toFixed(4));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance(null);
    }
  }, [selectedAccount?.address]);

  // Fetch balance when account changes
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);
  // Check if connected (account must exist in the wallet's accounts)
  const isConnected = useMemo(() => {
    if (!selectedAccount || !selectedWallet) return false;

    // Find the wallet and check if it still has this account
    const currentWallet = wallets.find((w) => w.name === selectedWallet.name);
    return !!(
      currentWallet &&
      currentWallet.accounts.some(
        (acc) => acc.address === selectedAccount.address
      )
    );
  }, [selectedAccount, selectedWallet, wallets]);

  const setWalletAndAccount = (
    wallet: UiWallet | null,
    account: UiWalletAccount | null
  ) => {
    setSelectedWallet(wallet);
    setSelectedAccount(account);
  };

  const setUfvkAndAccountIdx = (
    uvfkInput: String | null,
    accountIdxInput: number | null
  ) => {
    setSelectedUvfk(uvfkInput);
    setSelectedAccountIdx(accountIdxInput);
  };

  const setSelectedTab = (inp: Boolean) => {
    setSelectedTabVal(inp);
  };
  // Create context value
  const contextValue = useMemo<SolanaContextState>(
    () => ({
      // Static RPC values
      rpc,
      ws,
      chain,

      // Dynamic wallet values
      wallets,
      selectedWallet,
      selectedAccount,
      isConnected,
      balance,

      selectedUvfk,
      selectedAccountIdx,
      selectedTab,
      setWalletAndAccount,
      setUfvkAndAccountIdx,
      setSelectedTab,
      refreshBalance,
    }),
    [
      wallets,
      selectedWallet,
      selectedAccount,
      isConnected,
      balance,
      selectedUvfk,
      selectedAccountIdx,
      selectedTab,
      refreshBalance,
    ]
  );

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
}
