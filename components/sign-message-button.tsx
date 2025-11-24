import { useWalletAccountMessageSigner } from '@solana/react';
import { createSignableMessage } from '@solana/signers';
import { UiWallet, UiWalletAccount } from '@wallet-standard/react';
 
interface SignMessageButtonProps {
  account: UiWalletAccount;          // First param as UiWallet
  text: string;           // Second param as byte array
}

export function SignMessageButton({ account, text }: SignMessageButtonProps) {
 const messageSigner = useWalletAccountMessageSigner(account);
 return (
 <button
 onClick={async () => {
 try {
const encoded = new TextEncoder().encode(text);
 const signableMessage = createSignableMessage(encoded);
 const [signedMessage] = await messageSigner.modifyAndSignMessages([signableMessage]);
 const messageWasModified = signableMessage.content !== signedMessage.content;
 const signatureBytes = signedMessage.signatures[messageSigner.address];
 window.alert(
 `Signature bytes: ${signatureBytes.toString()}${
 messageWasModified ? ' (message was modified)' : ''
 }`,
 );
 } catch (e) {
 console.error('Failed to sign message', e);
 }
 }}
 >
 Sign Message: {text}
 </button>
 );
}