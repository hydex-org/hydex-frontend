"use client";

import { WalletConnectButtonBig } from "@/components/wallet-connect-button-bg";
import TwoTabPane from "@/components/tabs/tabViewer";
import { DepositAddressSection } from "@/components/deposit-addres-section";
import { WithdrawSection } from "@/components/withdraw-section";
import { useSolana } from "@/components/solana-provider";
import BridgeActivityCard from "@/components/tabs/tabViewerBottom";

export default function Home() {
  const { selectedWallet, selectedTab } = useSolana();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg border shadow-lg p-6 space-y-6">
        <TwoTabPane />

        {!selectedWallet && (
          <div className="flex justify-center w-full">
            <WalletConnectButtonBig />
          </div>
        )}

        {/* Deposit tab (ZEC → wZEC) */}
        {!selectedTab && selectedWallet && <DepositAddressSection />}

        {/* Withdraw tab (wZEC → ZEC) */}
        {selectedTab && selectedWallet && <WithdrawSection />}

        <BridgeActivityCard />
      </div>
    </div>
  );
}
