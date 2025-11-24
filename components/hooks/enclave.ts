import { useState } from "react";
import { createSignableMessage } from "@solana/signers";
import { MessageModifyingSigner } from "@solana/kit";
import { useWalletAccountMessageSigner } from "@solana/react";
import { UiWalletAccount } from "@wallet-standard/react";

interface SignMessageButtonProps {
    //messageSigner: MessageModifyingSigner;
    account: UiWalletAccount
}
// { messageSigner }: SignMessageButtonProps
export async function SignMessage({ account }: SignMessageButtonProps ) {
    try {
        const messageSigner = useWalletAccountMessageSigner(account);
        const encoded = new TextEncoder().encode("Hydex 4 lyfe");
        const signableMessage = createSignableMessage(encoded);
        const [signedMessage] = await messageSigner.modifyAndSignMessages([signableMessage]);
        const messageWasModified = signableMessage.content !== signedMessage.content;
        const signatureBytes = signedMessage.signatures[messageSigner.address];
        return signatureBytes;

    } catch (err) {
        console.error("Failed to sign message:", err);
    }
    return null;
}


