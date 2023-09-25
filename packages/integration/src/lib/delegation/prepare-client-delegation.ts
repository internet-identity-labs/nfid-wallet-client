import { SignedDelegation } from "../internet-identity/types"

/** Third party auth delegation format expected by @dfinity/auth-client */
export interface DfinityAuthClientDelegate {
  delegation: {
    pubkey: Uint8Array
    expiration: bigint
    targets?: string[]
  }
  signature: Uint8Array
}

/**
 * Prepare third party auth delegation for transmission via window message channel.
 */
export const prepareClientDelegate = (
  receivedDelegation: SignedDelegation,
): DfinityAuthClientDelegate => ({
  delegation: {
    pubkey: new Uint8Array(receivedDelegation.delegation.pubkey),
    expiration: receivedDelegation.delegation.expiration,
    targets: receivedDelegation.delegation.targets?.map((principal) =>
      principal.toString(),
    ),
  },
  signature: new Uint8Array(receivedDelegation.signature),
})
