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

// "use client";

// import * as React from "react";
// import { useSolana } from "./solana-provider";

// export function GenerateShieldedAddressButton() {
//   const { selectedAccount, setUfvkAndAccountIdx } = useSolana();

//   const onGenerateShieldAddress = async () => {
//     try {
//       const response = await fetch("http://localhost:8089/api/v1/generate-address", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           solana_wallet: selectedAccount?.address,
//         }),
//       });

//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//       const result = await response.json();
//       setUfvkAndAccountIdx(result.ufvk, result.diversifier_index);
//     } catch (error) {
//       console.log("Error occurred:", error);
//     }
//   };

//   return (
//     <div className="rounded-2xl border border-sky-500/70 bg-slate-900/40 p-6 shadow-sm">
//       <p className="mb-5 text-lg font-medium leading-snug text-zinc-200/90">
//         Generate a shielded Zcash address to deposit your ZEC. Once received, your funds will be
//         bridged to wZEC on Solana.
//       </p>

//       {/* <button
//         type="button"
//         onClick={onGenerateShieldAddress}
//         disabled={!selectedAccount?.address}
//         className="w-full rounded-xl bg-sky-500 px-6 py-4 text-lg font-semibold text-black transition hover:bg-sky-400 active:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
//       >
//         Generate Shielded Deposit Address
//       </button> */}
//     </div>
//   );
// }
