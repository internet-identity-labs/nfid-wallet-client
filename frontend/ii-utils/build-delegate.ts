export const buildDelegate = (receivedDelegation: any) => ({
  delegation: {
    pubkey: Uint8Array.from(receivedDelegation.delegation.pubkey),
    expiration: BigInt(receivedDelegation.delegation.expiration),
    targets: undefined,
  },
  signature: Uint8Array.from(receivedDelegation.signature),
})
