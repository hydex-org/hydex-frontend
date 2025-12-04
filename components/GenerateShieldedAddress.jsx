"use client";

import * as React from "react";
import { useSolana } from "./solana-provider";

export function GenerateShieldedAddressButton() {
  const { accounts, selectedWallet, selectedAccount, setUfvkAndAccountIdx } = useSolana();
  const [isLoading, setIsLoading] = React.useState(false);

  const onGenerateShieldAddress = async () => {
    if (!selectedAccount?.address || !selectedWallet) return;
    
    setIsLoading(true);
    
    try {
      // ======================================================================
      // OLD: Direct generate-address call (commented out)
      // ======================================================================
      // const response = await fetch("http://localhost:8089/v1/generate-address", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     solana_wallet: selectedAccount.address,
      //   }),
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const result = await response.json();
      // console.log("POST response:", result);
      // setUfvkAndAccountIdx(result.ufvk, result.diversifier_index)

      // ======================================================================
      // NEW: Auth flow -> Deposit Intent
      // ======================================================================

      // 1. Request auth challenge
      console.log("[1/4] Requesting auth challenge...");
      const challengeResponse = await fetch("http://localhost:3030/v1/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solana_pubkey: selectedAccount.address,
        }),
      });

      if (!challengeResponse.ok) {
        throw new Error(`Challenge request failed: ${challengeResponse.status}`);
      }

      const { challenge, nonce } = await challengeResponse.json();
      console.log("Challenge received:", { challenge, nonce });

      // 2. Sign the challenge with wallet
      console.log("[2/4] Signing challenge with wallet...");
      const messageBytes = new TextEncoder().encode(challenge);
      
      // UiWallet.features is an array of feature names
      // We need to check if signMessage is supported and use window.phantom directly
      const featureNames = selectedWallet.features;
      console.log("Wallet features:", featureNames);
      
      // Check if wallet supports signMessage
      const supportsSignMessage = featureNames.includes("solana:signMessage") || 
                                   featureNames.includes("standard:signMessage");
      
      if (!supportsSignMessage) {
        throw new Error(
          `Wallet "${selectedWallet.name}" does not support message signing. ` +
          `Available features: ${featureNames.join(", ")}`
        );
      }

                 // For Phantom and most Solana wallets, use the window provider directly
      let signedMessage;
      
      // Helper to convert Uint8Array to base64
      function uint8ToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }
      
      if (window.phantom?.solana) {
        // Use Phantom's signMessage
        const result = await window.phantom.solana.signMessage(
          messageBytes,
          "utf8"
        );
        // Handle both formats: { signature: Uint8Array } or just Uint8Array
        const sig = result.signature || result;
        console.log("Signature bytes length:", sig.length);
        signedMessage = uint8ToBase64(sig);
      } else if (window.solana?.signMessage) {
        // Generic Solana wallet adapter
        const result = await window.solana.signMessage(messageBytes, "utf8");
        const sig = result.signature || result;
        console.log("Signature bytes length:", sig.length);
        signedMessage = uint8ToBase64(sig);
      } else {
        throw new Error("Could not find wallet provider for message signing");
      }
      
      console.log("Message signed successfully");
      console.log("Signed message (base64):", signedMessage);

      // 3. Verify wallet and get access token
      console.log("[3/4] Verifying wallet...");
      const verifyResponse = await fetch("http://localhost:3030/v1/auth/verify-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solana_pubkey: selectedAccount.address,
          signed_message: signedMessage,
          nonce: nonce,
          message: challenge,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(`Wallet verification failed: ${error.error?.message || verifyResponse.status}`);
      }

      const { access_token } = await verifyResponse.json();
      console.log("Wallet verified, access token received");

      // 4. Create deposit intent
      console.log("[4/4] Creating deposit intent...");
      const depositResponse = await fetch("http://localhost:3030/v1/deposit-intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          idempotency_key: `dep-${Date.now()}`,
          solana_recipient: selectedAccount.address,
          network: "testnet",
        }),
      });

      if (!depositResponse.ok) {
        const error = await depositResponse.json();
        throw new Error(`Deposit intent failed: ${error.error?.message || depositResponse.status}`);
      }

      const depositResult = await depositResponse.json();
      console.log("Deposit intent created:", depositResult);

      // Update state with deposit info
      if (depositResult.unified_address) {
        setUfvkAndAccountIdx(depositResult.unified_address, depositResult.deposit_id);
      }

    } catch (error) {
      console.error("Error occurred:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onGenerateShieldAddress}
      disabled={!selectedAccount?.address || isLoading}
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
      {isLoading ? "Authenticating..." : "Generate Shielded Deposit Address"}
    </button>
  );
}