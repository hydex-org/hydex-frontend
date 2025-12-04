"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";

export function GenerateShieldedAddressButton() {
  const { accounts, selectedWallet, selectedAccount, setUfvkAndAccountIdx } = useSolana();

  const onGenerateShieldAddress = async () => {
    try {
      //console.log(selectedAccount);
      const response = await fetch("http://localhost:8089/v1/generate-address", {
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
<button
  type="button"
  onClick={onGenerateShieldAddress}
  disabled={!selectedAccount?.address}
  className="
    w-full
    rounded-xl
    bg-[#97f01d]
    py-6
    text-center
    text-xl
    font-semibold
    text-black
    shadow-sm
    transition
    hover:brightness-105
    active:brightness-95
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  Generate Shielded Deposit Address
</button>

  );
}