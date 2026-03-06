import { ChainId, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"

export const NOTE_MAX_LENGTH = 180

export interface NoteKeyable {
  toBlob(): Promise<Uint8Array>
}

async function sha256(input: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes)
  return new Uint8Array(hashBuffer)
}

/**
 * Key for ICP-based transactions.
 * Unique fields: blockId + canisterId + ChainId.ICP
 */
export class IcpNoteKey implements NoteKeyable {
  readonly chainId = ChainId.ICP

  constructor(
    readonly blockId: bigint,
    readonly canisterId: string,
  ) {}

  toBlob(): Promise<Uint8Array> {
    return sha256(`${this.blockId}:${this.canisterId}:${this.chainId}`)
  }
}

/**
 * Key for EVM-based transactions (ETH, POL, BNB, BASE, ARB).
 * Unique fields: txHash + chainId
 */
export class EvmNoteKey implements NoteKeyable {
  constructor(
    readonly txHash: string,
    readonly chainId: ChainId,
  ) {
    if (!isEvmToken(chainId)) {
      throw new Error(`ChainId ${chainId} is not a supported EVM chain`)
    }
  }

  toBlob(): Promise<Uint8Array> {
    return sha256(`${this.txHash}:${this.chainId}`)
  }
}

/**
 * Key for Bitcoin transactions.
 * Unique fields: txHash + ChainId.BTC
 */
export class BtcNoteKey implements NoteKeyable {
  readonly chainId = ChainId.BTC

  constructor(readonly txHash: string) {}

  toBlob(): Promise<Uint8Array> {
    return sha256(`${this.txHash}:${this.chainId}`)
  }
}
