export interface BuiltDelegate {
  delegation: {
    pubkey: Uint8Array
    expiration: bigint
    targets?: string[]
  }
  signature: Uint8Array
}

export const buildDelegate = (receivedDelegation: any) => ({
  delegation: {
    pubkey: Uint8Array.from(receivedDelegation.delegation.pubkey),
    expiration: BigInt(receivedDelegation.delegation.expiration),
    targets: undefined,
  },
  signature: Uint8Array.from(receivedDelegation.signature),
})
