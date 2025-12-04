"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";

export function GenerateShieldedAddressButton() {
  const { accounts, selectedWallet, selectedAccount, setUfvkAndAccountIdx } = useSolana();

  const onGenerateShieldAddress = async () => {
    try {
      //console.log(selectedAccount);
      const response = await fetch("http://localhost:8089/api/v1/generate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solana_wallet: selectedAccount.address, // optional chaining just in case
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("POST response:", result);
      setUfvkAndAccountIdx(result.ufvk, result.diversifier_index)
    } catch (error) {
      console.log("Error occurred:", error);
    }
  }; // ✅ close the handler function

  return ( // ✅ component returns JSX
    <div>
      Generate a shielded Zcash address to deposit your ZEC. Once
      received your funds will be bridged to wZec on Solana
    <button type="button" onClick={onGenerateShieldAddress}>
      Generate Shielded Orchard Address
    </button>
    </div>
  );
}
