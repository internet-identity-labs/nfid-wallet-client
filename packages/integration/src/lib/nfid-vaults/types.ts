/**
 * Price of a vault as reported by the vault manager.
 * The price is not configured: it is what a vault costs to create on the manager
 * subnet, converted at the current ICP/XDR rate, plus the protocol margin.
 */
export interface VaultCreationPrice {
  /** e8s charged from the payer when the vault is created. */
  priceE8s: bigint
  /**
   * e8s to approve for the manager: the price, head room for a rate move, and the
   * ICP ledger fee. Only what the vault actually costs is pulled from the allowance.
   */
  approveE8s: bigint
  /** Part of the price that buys the cycles the vault runs on. */
  costE8s: bigint
  /** Part of the price kept by the protocol. */
  protocolE8s: bigint
  /** Cycles the new vault is funded with. */
  initialCyclesBalance: bigint
  /** Cycles the replica charges for creating a canister on this subnet. */
  creationFeeCycles: bigint
  /** Cycles a vault costs the manager in total. */
  totalCycles: bigint
  /** Current ICP/XDR rate, in permyriad of XDR per ICP. */
  xdrPermyriadPerIcp: bigint
}

/**
 * A vault created through the manager, as recorded in the user registry.
 *
 * Neither the vault nor the manager knows who a vault belongs to, so the registry
 * keeps that association under the user root principal.
 */
export interface StoredVault {
  /** Canister id of the vault. */
  canisterId: string
  /** Name given to the vault at creation. */
  name: string
  /** Creation timestamp, milliseconds since epoch, as recorded by the registry. */
  createdAt: number
}
