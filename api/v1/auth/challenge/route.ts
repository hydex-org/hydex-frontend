import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh";

type InitBridgeArgs = {
  admin: PublicKey;
  enclaveAuthority: PublicKey;
  mpcQuorumPubkeys: Uint8Array[]; // each 32 bytes
  bridgeUfvk: Uint8Array;         // bytes
};

// If your program uses Anchor, the “discriminator” is 8 bytes.
// If it’s not Anchor, you might have a 1-byte or 4-byte opcode instead.
const INIT_BRIDGE_DISCRIMINATOR = Buffer.from([/* 8 bytes here */]);

const initBridgeLayout = borsh.struct([
  borsh.publicKey("admin"),
  borsh.publicKey("enclaveAuthority"),
  borsh.vec(borsh.array(borsh.u8(), 32), "mpcQuorumPubkeys"),
  borsh.vec(borsh.u8(), "bridgeUfvk"),
]);

export function buildInitBridgeIx(params: {
  programId: PublicKey;
  // accounts your program requires (examples below—replace with yours)
  bridgeConfig: PublicKey;
  payer: PublicKey;

  args: InitBridgeArgs;
}) {
  const { programId, bridgeConfig, payer, args } = params;

  // Validate mpc keys are 32 bytes each
  for (const pk of args.mpcQuorumPubkeys) {
    if (pk.length !== 32) throw new Error("Each mpcQuorumPubkeys entry must be 32 bytes");
  }

  const dataBody = Buffer.alloc(10_000); // big enough for variable data
  const span = initBridgeLayout.encode(
    {
      admin: args.admin,
      enclaveAuthority: args.enclaveAuthority,
      mpcQuorumPubkeys: args.mpcQuorumPubkeys,
      bridgeUfvk: args.bridgeUfvk,
    },
    dataBody
  );

  const data = Buffer.concat([INIT_BRIDGE_DISCRIMINATOR, dataBody.subarray(0, span)]);

  return new TransactionInstruction({
    programId,
    keys: [
      // These MUST match the on-chain instruction account list (order matters)
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: bridgeConfig, isSigner: false, isWritable: true },

      // common deps (add/remove based on your program)
      // { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      // { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}
