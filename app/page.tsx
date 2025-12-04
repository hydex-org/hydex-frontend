"use client";

import { WalletConnectButtonBig } from "@/components/wallet-connect-button-bg";
import { MemoCard } from "@/components/memo-card";
import TwoTabPane from "@/components/tabs/tabViewer";
import { DepositAddressSection } from "@/components/deposit-addres-section";
import { useSolana } from "@/components/solana-provider";
import { useState } from "react";
import BridgeActivityCard from "@/components/tabs/tabViewerBottom";

export default function Home() {
  const {selectedWallet, selectedTab} = useSolana();
  const [active, setActive] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg border shadow-lg p-6 space-y-6">
        <div className="flex justify-center">
         
        </div>
       
    
        <TwoTabPane/>
        {!selectedWallet && (
          <div className="flex justify-center w-full">
            <WalletConnectButtonBig/>
          </div>
        )}
        {!selectedTab && 
          selectedWallet &&
            <DepositAddressSection/>
        }
      <BridgeActivityCard/>
        
      </div>
    </div>
  );
}