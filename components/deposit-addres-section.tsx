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
      {
        (selectedUvfk && selectedTab) &&
        <p>Test</p>
      }
    </div>
  );
}
