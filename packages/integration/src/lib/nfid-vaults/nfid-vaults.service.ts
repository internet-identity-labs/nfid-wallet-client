import {
  ControllersUpdateTransactionRequest,
  Currency,
  ICRC1CanistersAddTransactionRequest,
  ICRC1CanistersRemoveTransactionRequest,
  MemberCreateTransactionRequestV2,
  MemberRemoveTransactionRequest,
  MemberUpdateNameTransactionRequest,
  Network,
  PurgeTransactionRequest,
  QuorumTransactionRequest,
  TopUpQuorumTransactionRequest,
  Transaction,
  TransactionRequest,
  TransactionState,
  TransferICRC1QuorumTransactionRequest,
  TransferQuorumTransactionRequest,
  VaultManager,
  VaultNamingTransactionRequest,
  VaultRole,
  WalletCreateTransactionRequest,
  generateRandomString,
} from "@nfid/vaults"
import {
  AnonymousIdentity,
  HttpAgent,
  Identity,
  SignIdentity,
} from "@icp-sdk/core/agent"
import * as Agent from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { ttlCacheService } from "@nfid/client-db"

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

/** The canister timestamps in nanoseconds, the frontend works in milliseconds. */
export const NS_PER_MS = BigInt(1_000_000)

const DEFAULT_SUB_ACCOUNT =
  "0000000000000000000000000000000000000000000000000000000000000000"

const INTERVAL = 1000
const TIMEOUT = 30_000

/** How many times a step that follows a paid-for vault is attempted. */
const ATTEMPTS = 3

const VAULT_CACHE_TTL_MS = 5 * 60 * 1000
const VAULTS_CACHE_NAME = "VAULTS_"

export interface DashboardCache {
  cache: Array<{
    canister: string
    name: string
    version: string
  }>
  createdDate: number
}

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
    walletName = "Main Wallet",
  ): Promise<Principal> {
    const controller = identity.getPrincipal()
    const price = await this.getPrice(identity)
    const vaultType: VaultType = { Light: null }

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
      this.initVault(canisterId.toText(), name, walletName, identity),
      this.recordVault(canisterId.toText(), name, controller.toText()),
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
   * Returns cached vaults for the given AccountIdentifier hex address.
   * Serves from IndexedDB if fresh (5-min TTL); scans all vault canisters otherwise.
   * Pass `forceRefetch: true` to bypass the cache and trigger a fresh scan.
   */
  async getVaults(id: string, forceRefetch?: boolean): Promise<DashboardCache> {
    return ttlCacheService.getOrFetch<DashboardCache>(
      `{VAULTS_CACHE_NAME}${id.toLowerCase()}`,
      () => this.scanVaultsForAddress(id),
      VAULT_CACHE_TTL_MS,
      { forceRefetch: Boolean(forceRefetch) },
    )
  }

  /** Force-rescans all vaults and repopulates the cache for the given address. */
  async updateVaultsCache(id: string): Promise<DashboardCache> {
    return this.getVaults(id, true)
  }

  /**
   * Records the vault in the user registry.
   *
   * Signed by the device identity the shared actor carries, not by the global one
   * that created the vault: the registry keys vaults by user root, which either
   * identity resolves to. The global principal is registered alongside so that the
   * list can also be read when only that identity is at hand.
   */
  private async recordVault(
    vaultCanisterId: string,
    name: string,
    globalPrincipal: string,
  ): Promise<StepResult> {
    return attempt(() =>
      userRegistry.add_vault_canister(vaultCanisterId, name, globalPrincipal),
    )
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
    // The SDK's @dfinity/agent imports resolve to @icp-sdk/core through the aliases in
    // tsconfig.base.json and apps/nfid-frontend/webpack.config.js, so this Identity is
    // the type the SDK asks for, not merely a structural match.
    return new VaultManager(vaultCanisterId, identity)
  }

  /**
   * Naming happens after creation, so a failure here does not lose the vault.
   * Signed by the global identity: the vault only accepts transactions from the
   * member it was created with.
   */
  /**
   * Polls until the transaction reaches a terminal state (Executed or Rejected).
   * Useful after submitting a single-approver transaction that auto-executes.
   */
  private async waitForTransaction(
    vaultCanisterId: string,
    identity: SignIdentity,
    transactionId: bigint,
    intervalMs = INTERVAL,
    timeoutMs = TIMEOUT,
  ): Promise<Transaction> {
    const deadline = Date.now() + timeoutMs
    const manager = this.getManager(vaultCanisterId, identity)
    const terminal = new Set([
      TransactionState.Executed,
      TransactionState.Rejected,
      TransactionState.Purged,
    ])

    while (Date.now() < deadline) {
      const transactions = await manager.getTransactions()
      const tx = transactions.find((t) => t.id === transactionId)
      if (tx && terminal.has(tx.state)) return tx
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(
      `Transaction ${transactionId} did not reach a terminal state within ${timeoutMs}ms`,
    )
  }

  private async initVault(
    vaultCanisterId: string,
    name: string,
    walletName: string,
    identity: SignIdentity,
  ): Promise<StepResult> {
    return attempt(() =>
      this.requestBatchTransactions(vaultCanisterId, identity, [
        new VaultNamingTransactionRequest(name),
        new WalletCreateTransactionRequest(
          DEFAULT_SUB_ACCOUNT,
          walletName,
          Network.IC,
        ),
      ]),
    )
  }

  /**
   * Submits a request to add a new approver (member) to the vault.
   * Requires admin role. Goes through the quorum approval flow.
   */
  async addMember(
    vaultCanisterId: string,
    identity: SignIdentity,
    payload: {
      owner: Principal
      subaccount?: Uint8Array | number[]
      name: string
      role: VaultRole
    },
    newQuorum?: number,
  ): Promise<Transaction> {
    const requests: (TransactionRequest & { batch_uid?: string })[] = [
      new MemberCreateTransactionRequestV2(
        { owner: payload.owner, subaccount: payload.subaccount },
        payload.name,
        payload.role,
      ),
    ]
    if (newQuorum !== undefined)
      requests.push(new QuorumTransactionRequest(newQuorum))
    const [tx] = await this.requestBatchTransactions(
      vaultCanisterId,
      identity,
      requests,
    )
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to update the name of an existing member.
   * Requires admin role. Goes through the quorum approval flow.
   *
   * @param memberId the member's userId (principal string)
   */
  async updateMemberName(
    vaultCanisterId: string,
    identity: SignIdentity,
    memberId: string,
    name: string,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new MemberUpdateNameTransactionRequest(memberId, name),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to remove a member from the vault.
   * Requires admin role. Goes through the quorum approval flow.
   *
   * @param memberId the member's userId (principal string)
   */
  async removeMember(
    vaultCanisterId: string,
    identity: SignIdentity,
    memberId: string,
    newQuorum?: number,
  ): Promise<Transaction> {
    const requests: (TransactionRequest & { batch_uid?: string })[] = [
      new MemberRemoveTransactionRequest(memberId),
    ]
    if (newQuorum !== undefined)
      requests.push(new QuorumTransactionRequest(newQuorum))
    const [tx] = await this.requestBatchTransactions(
      vaultCanisterId,
      identity,
      requests,
    )
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to update the quorum (approval threshold).
   * Requires admin role. Goes through the quorum approval flow.
   *
   * @param quorum number of approvals required
   */
  async updateQuorum(
    vaultCanisterId: string,
    identity: SignIdentity,
    quorum: number,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([new QuorumTransactionRequest(quorum)])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to add an ICRC-1 token canister to the vault.
   * Requires admin role. Goes through the quorum approval flow.
   */
  async addIcrc1Canister(
    vaultCanisterId: string,
    identity: SignIdentity,
    ledgerCanisterId: string,
    indexCanisterId?: string,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new ICRC1CanistersAddTransactionRequest(
        Principal.fromText(ledgerCanisterId),
        indexCanisterId ? Principal.fromText(indexCanisterId) : undefined,
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to remove an ICRC-1 token canister from the vault.
   * Requires admin role. Goes through the quorum approval flow.
   */
  async removeIcrc1Canister(
    vaultCanisterId: string,
    identity: SignIdentity,
    ledgerCanisterId: string,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new ICRC1CanistersRemoveTransactionRequest(
        Principal.fromText(ledgerCanisterId),
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits a request to update the vault controllers.
   * Replaces the current controller list with the provided principals.
   * Requires admin role. Goes through the quorum approval flow.
   *
   * @param principals the new list of controller principals
   */
  async getControllers(
    vaultCanisterId: string,
    identity: SignIdentity,
  ): Promise<string[]> {
    const controllers = await this.getManager(
      vaultCanisterId,
      identity,
    ).getControllers()
    const texts = controllers.map((p) => p.toText())
    return [vaultCanisterId, ...texts.filter((p) => p !== vaultCanisterId)]
  }

  async getXdrPermyriadPerIcp(identity: SignIdentity): Promise<bigint> {
    const price = await this.getPrice(identity)
    return price.xdrPermyriadPerIcp
  }

  async getCyclesBalance(
    vaultCanisterId: string,
    identity: SignIdentity,
  ): Promise<bigint> {
    return this.getManager(vaultCanisterId, identity).canisterBalance()
  }

  async updateControllers(
    vaultCanisterId: string,
    identity: SignIdentity,
    principals: string[],
  ): Promise<Transaction> {
    const all = principals.includes(vaultCanisterId)
      ? principals
      : [vaultCanisterId, ...principals]
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new ControllersUpdateTransactionRequest(
        all.map((p) => Principal.fromText(p)),
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits multiple transactions as a batch — they all share a batch_uid so
   * the vault executes or rejects them together.
   * For a single transaction no batch_uid is set (same as a plain requestTransaction).
   */
  async requestBatchTransactions(
    vaultCanisterId: string,
    identity: SignIdentity,
    transactions: (TransactionRequest & { batch_uid?: string })[],
  ): Promise<Transaction[]> {
    if (transactions.length > 1) {
      const batchUid = generateRandomString()
      transactions.forEach((tx) => (tx.batch_uid = batchUid))
    }
    return this.getManager(vaultCanisterId, identity).requestTransaction(
      transactions,
    )
  }

  /**
   * Submits an ICP transfer from the vault's wallet and waits for execution.
   * `address` must be an AccountIdentifier hex string.
   */
  async transferVaultIcp(
    vaultCanisterId: string,
    identity: SignIdentity,
    walletUid: string,
    address: string,
    amount: bigint,
    memo?: string,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new TransferQuorumTransactionRequest(
        Currency.ICP,
        address,
        walletUid,
        amount,
        memo,
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Submits an ICRC-1 token transfer from the vault's wallet and waits for execution.
   */
  async transferVaultIcrc1(
    vaultCanisterId: string,
    identity: SignIdentity,
    walletUid: string,
    ledgerId: string,
    toPrincipal: Principal,
    toSubaccount: Uint8Array | number[] | undefined,
    amount: bigint,
    memo?: string,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new TransferICRC1QuorumTransactionRequest(
        toPrincipal,
        toSubaccount,
        Principal.fromText(ledgerId),
        walletUid,
        amount,
        memo,
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  /**
   * Purges all blocked transactions from the vault.
   * Requires admin role.
   */
  async purgeTransactions(
    vaultCanisterId: string,
    identity: SignIdentity,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([new PurgeTransactionRequest()])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  async topUp(
    vaultCanisterId: string,
    identity: SignIdentity,
    amountE8s: bigint,
  ): Promise<Transaction> {
    const [tx] = await this.getManager(
      vaultCanisterId,
      identity,
    ).requestTransaction([
      new TopUpQuorumTransactionRequest(
        Currency.ICP,
        DEFAULT_SUB_ACCOUNT,
        amountE8s,
      ),
    ])
    return this.waitForTransaction(vaultCanisterId, identity, tx.id)
  }

  private async scanVaultsForAddress(id: string): Promise<DashboardCache> {
    const vaultCanisters =
      await this.getAnonymousManagerActor().get_all_canisters()
    const anonymousIdentity = new AnonymousIdentity()
    const data = await Promise.all(
      vaultCanisters.map(async (vault) => {
        const canisterId = vault.canister_id.toText()
        const vm = new VaultManager(canisterId, anonymousIdentity)
        try {
          const state = await vm.getState()
          if (
            !state.members.find(
              (m) => m.userId.toLocaleLowerCase() === id.toLocaleLowerCase(),
            )
          )
            return null
          const version = await vm.getVersion()
          const name = state.name ?? `NFID Vault ${canisterId}`
          return { canister: canisterId, name, version }
        } catch (e) {
          console.warn(`Error getting vault state for ${canisterId}`, e)
          return null
        }
      }),
    )
    const cache = data.filter(
      (d): d is NonNullable<typeof d> => d !== null && d !== undefined,
    )
    return { cache, createdDate: Date.now() }
  }

  private getAnonymousManagerActor() {
    const agent = Agent.HttpAgent.createSync({
      host: "https://ic0.app",
      identity: new AnonymousIdentity() as unknown as Agent.Identity,
    })
    return Agent.Actor.createActor<VaultManagerService>(vaultManagerIDL, {
      canisterId: this.managerCanisterId,
      agent,
    })
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
