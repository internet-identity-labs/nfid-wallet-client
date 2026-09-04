import { VaultManager, VaultNamingTransactionRequest } from "@nfid/vaults"
import { HttpAgent, Identity, SignIdentity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

import { actorBuilder, agentBaseConfig, userRegistry } from "../actors"
import { Icrc1Pair } from "../token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { ICP_CANISTER_ID } from "../token/constants"
import { hasOwnProperty } from "../test-utils"
import {
  vaultManagerIDL,
  VaultManagerService,
  VaultType,
} from "./vault-manager.idl"
import { StoredVault, VaultCreationPrice } from "./types"

/** How many times a step that follows a paid-for vault is attempted. */
const ATTEMPTS = 3

/** Runs `fn` until it succeeds, up to `attempts` times, then rethrows. */
async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = ATTEMPTS,
  delayMs = 300,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      if (attempt === attempts) throw e
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }
}

/** Outcome of a step that must not fail the creation on its own. */
interface StepResult {
  ok: boolean
  error?: unknown
}

/** Retries `fn` and reports the outcome instead of throwing. */
async function attempt(fn: () => Promise<unknown>): Promise<StepResult> {
  try {
    await withRetry(fn)
    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}

/**
 * The vault canister was created and paid for, but a step after that did not go
 * through. The vault is not lost: it exists under `canisterId` and is controlled
 * by the user, and each failed step can be redone on its own.
 */
export class VaultCreationIncompleteError extends Error {
  constructor(
    readonly canisterId: Principal,
    readonly named: boolean,
    readonly recorded: boolean,
    readonly cause?: unknown,
  ) {
    const failed = [
      named ? undefined : "naming it",
      recorded ? undefined : "recording it in the user registry",
    ].filter(Boolean)

    super(
      `The vault was created as ${canisterId.toText()} and paid for, but ` +
        `${failed.join(" and ")} failed after ${ATTEMPTS} attempts. ` +
        (recorded
          ? "The vault can be renamed through the vault manager SDK."
          : "The vault will not appear in getVaults until it is recorded again, " +
            "so keep this canister id."),
    )
    this.name = "VaultCreationIncompleteError"
  }
}

/**
 * Two different identities are in play here, and they are not interchangeable.
 *
 * The global identity signs everything that reaches the vault manager, the ledger
 * and the vault itself: it is the principal that pays for a vault, controls it and
 * signs its transactions, and it is the same across the user devices. It is passed
 * in as a parameter.
 *
 * The device identity signs the user registry calls that record which vaults the
 * user owns. That is the shared identity the `userRegistry` actor already carries,
 * so those calls take no identity parameter. The registry resolves the user root
 * from the caller, which is why a device identity is enough to reach the same list
 * from any device.
 */
export class NfidVaultsService {
  private readonly managerCanisterId: string

  constructor(managerCanisterId: string = NFID_VAULT_MANAGER_CANISTER_ID) {
    this.managerCanisterId = managerCanisterId
  }

  /**
   * Current price of a vault, including the amount to approve before creating one.
   *
   * This is an update call rather than a query: the price is what a vault costs to
   * create at the ICP/XDR rate the manager reads from the cycles minting canister.
   *
   * @param identity the global identity, the one that will pay for the vault.
   */
  async getPrice(identity: SignIdentity): Promise<VaultCreationPrice> {
    const actor = this.getManagerActor(identity)
    const result = await actor.get_creation_price()

    if (hasOwnProperty(result, "Err")) {
      throw new Error(`Failed to read the vault price: ${result.Err}`)
    }

    const price = result.Ok
    return {
      priceE8s: price.price_e8s,
      approveE8s: price.approve_e8s,
      costE8s: price.cost_e8s,
      protocolE8s: price.protocol_e8s,
      initialCyclesBalance: price.initial_cycles_balance,
      creationFeeCycles: price.creation_fee_cycles,
      totalCycles: price.total_cycles,
      xdrPermyriadPerIcp: price.xdr_permyriad_per_icp,
    }
  }

  /**
   * Creates a vault owned by the given identity and names it.
   *
   * The identity pays for the vault and becomes its controller: it approves the
   * quoted amount for the manager over ICRC-2, the manager pulls the price and
   * creates the canister. The name is not part of canister creation, so it is set right
   * after through a naming transaction on the vault itself.
   *
   * The vault is then recorded in the user registry, which is signed by the device
   * identity rather than by the one passed here.
   *
   * @param identity the global identity: it pays, controls the vault and signs its
   * transactions, so it has to be the user global one and not a device identity.
   */
  async createVault(
    name: string,
    identity: SignIdentity,
    vaultType?: VaultType,
  ): Promise<Principal> {
    const controller = identity.getPrincipal()
    const price = await this.getPrice(identity)

    // The price follows the ICP/XDR rate, which can move between quoting it and
    // charging it. approveE8s carries head room for that on top of the ledger fee,
    // and the manager only pulls what the vault actually costs.
    const icpPair = new Icrc1Pair(ICP_CANISTER_ID, undefined)
    await icpPair.setAllowance(
      identity,
      Principal.fromText(this.managerCanisterId),
      price.approveE8s,
    )

    const actor = this.getManagerActor(identity)
    const created = await actor.create_canister_icrc2(
      vaultType ? [vaultType] : [],
      [controller],
    )

    if (hasOwnProperty(created, "Err")) {
      throw new Error(`Failed to create the vault: ${created.Err}`)
    }

    const canisterId = created.Ok.canister_id

    // The vault exists and is paid for from here on. Naming it and recording it are
    // independent of each other, so they run together, each retried on its own.
    const [named, recorded] = await Promise.all([
      this.nameVault(canisterId.toText(), name, identity),
      this.recordVault(canisterId.toText(), name),
    ])

    // Report what is left undone, but never by losing the canister id: the user has
    // already paid, and without the id the vault would be unreachable.
    if (!named.ok || !recorded.ok) {
      throw new VaultCreationIncompleteError(
        canisterId,
        named.ok,
        recorded.ok,
        named.error ?? recorded.error,
      )
    }

    return canisterId
  }

  /**
   * Vaults the caller owns.
   *
   * Signed by the device identity, through the shared `userRegistry` actor. The
   * registry resolves the user root from the caller itself, so this returns the
   * vaults of whoever is authenticated and never anyone else's, and the same list
   * comes back on every device the user signs in from.
   */
  async getVaults(): Promise<StoredVault[]> {
    const vaults = await userRegistry.get_all_vault_canisters()

    return vaults.map((vault) => ({
      canisterId: vault.canister_id,
      name: vault.name,
      // The canister timestamps in nanoseconds, the frontend works in millis.
      createdAt: Number(vault.created_at / 1_000_000n),
    }))
  }

  /**
   * Records the vault in the user registry.
   *
   * Signed by the device identity the shared actor carries, not by the global one
   * that created the vault: the registry keys vaults by user root, which either
   * identity resolves to.
   */
  private async recordVault(
    vaultCanisterId: string,
    name: string,
  ): Promise<StepResult> {
    return attempt(() => userRegistry.add_vault_canister(vaultCanisterId, name))
  }

  /**
   * Manager object from the @nfid/vaults SDK, bound to one vault canister.
   * Use it to read the vault state and to request or approve its transactions.
   *
   * @param identity the global identity. Reads work with any identity, but the vault
   * only accepts transactions from a registered member, which is the global principal
   * the vault was created with.
   */
  getManager(vaultCanisterId: string, identity: Identity): VaultManager {
    // The SDK is built against the @dfinity/agent identity types while this
    // package uses @icp-sdk/core. The two are structurally the same.
    return new VaultManager(vaultCanisterId, identity as never)
  }

  /**
   * Naming happens after creation, so a failure here does not lose the vault.
   * Signed by the global identity: the vault only accepts transactions from the
   * member it was created with.
   */
  private async nameVault(
    vaultCanisterId: string,
    name: string,
    identity: SignIdentity,
  ): Promise<StepResult> {
    return attempt(() =>
      this.getManager(vaultCanisterId, identity).requestTransaction([
        new VaultNamingTransactionRequest(name),
      ]),
    )
  }

  /** Vault manager actor signed by the global identity that pays for the vault. */
  private getManagerActor(identity: SignIdentity) {
    return actorBuilder<VaultManagerService>(
      this.managerCanisterId,
      vaultManagerIDL,
      {
        canisterId: this.managerCanisterId,
        agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
      },
    )
  }
}

export const nfidVaultsService = new NfidVaultsService()
