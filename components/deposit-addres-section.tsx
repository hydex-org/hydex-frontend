"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";
import { GenerateShieldedAddressButton } from "./GenerateShieldedAddress";

export function DepositAddressSection() {
  const { selectedUvfk, selectedTab } = useSolana();

  React.useEffect(() => {
    // runs on mount AND whenever selectedUvfk changes
    console.log("selectedUvfk changed:", selectedUvfk);

    if (selectedUvfk) {
      // do something (fetch, enable UI, etc.)
    } else {
      // do something else
    }
  }, [selectedUvfk]);

  return (
    <div>
      <GenerateShieldedAddressButton />
      
      <label>Your Shielded Deposit address</label> 
      {selectedUvfk}
      <label>Send ZEC to this address. Minimum: 0.01 ZEC</label>
      <label>Solana Receiving address</label>
      <input/>
      <label>Where you want to send </label>
          <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "repeat(3, auto)",
        gap: "12px", // spacing between cells (no borders)
      }}
    >
      <div style={{ padding: 12 }}>Cell 1</div>
      <div style={{ padding: 12 }}>Cell 2</div>
      <div style={{ padding: 12 }}>Cell 3</div>
      <div style={{ padding: 12 }}>Cell 4</div>
      <div style={{ padding: 12 }}>Cell 5</div>
      <div style={{ padding: 12 }}>Cell 6</div>
    </div>
    <div>
      Shielded transaction ensures your privacy on the Zcash network
    </div>
    
    </div>
  );
}
