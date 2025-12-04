"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";
import { GenerateShieldedAddressButton } from "./GenerateShieldedAddress";

export function DepositAddressSection() {
  const { selectedUvfk } = useSolana();

  React.useEffect(() => {
    console.log("selectedUvfk changed:", selectedUvfk);
  }, [selectedUvfk]);

  return (
    <div>
      <GenerateShieldedAddressButton />

      {selectedUvfk && (
        <>
          <label>Your Shielded Deposit address</label>
          <div>{selectedUvfk}</div>

          <label>Send ZEC to this address. Minimum: 0.01 ZEC</label>

          <label>Solana Receiving address</label>
          <input />

          <label>Where you want to send</label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "repeat(3, auto)",
              gap: "12px",
            }}
          >
            <div style={{ padding: 12 }}>Exchange Rate</div>
            <div style={{ padding: 12 }}>1 ZEC = 1wZEC</div>
            <div style={{ padding: 12 }}>Bridge Fee</div>
            <div style={{ padding: 12 }}>0.5%</div>
            <div style={{ padding: 12 }}>Estimated Time</div>
            <div style={{ padding: 12 }}>~10-15 minutes</div>
          </div>

          <div>Shielded transaction ensures your privacy on the Zcash network</div>
        </>
      )}
    </div>
  );
}
