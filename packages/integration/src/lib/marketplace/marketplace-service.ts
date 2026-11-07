import { HttpAgent, HttpAgentOptions, SignIdentity } from "@icp-sdk/core/agent"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { Principal } from "@icp-sdk/core/principal"

import { idlFactory as oracleIdl } from "../_ic_api/icrc1_oracle"
import type {
  Listing as RawListing,
  ListingResult,
  ListingSort as RawListingSort,
  MarketTx as RawMarketTx,
  MarketTxResult,
  MarketplaceConfig as RawMarketplaceConfig,
  MarketplaceError as RawMarketplaceError,
  NftCollection as RawNftCollection,
  _SERVICE as Oracle,
} from "../_ic_api/icrc1_oracle.d"
import { idlFactory as icrc7Idl } from "../_ic_api/icrc7"
import type { Value, _SERVICE as Icrc7 } from "../_ic_api/icrc7.d"
import { actorBuilder, agentBaseConfig } from "../actors"
// ICRC1_ORACLE_CANISTER_ID is a global env var (see types/env/index.d.ts).
import {
  BuyQuote,
  CreateListingParams,
  Listing,
  ListingPage,
  ListingQuery,
  ListingStatus,
  MarketplaceConfig,
  MarketplaceError,
  MarketplaceErrorCause,
  MarketplaceTx,
  MarketplaceTxStatus,
  NftCollection,
  NftCollectionRequest,
  NftCollectionStatus,
} from "./types"

const NS_PER_MS = BigInt(1_000_000)
const PAGE_SIZE = BigInt(100)
/** ICP allowance for a purchase expires after this, if unused. */
const BUY_ALLOWANCE_TTL_MS = 10 * 60 * 1000

export interface MarketplaceServiceOptions {
  /** Defaults to ICRC1_ORACLE_CANISTER_ID. */
  oracleCanisterId?: string
  /** Merged over agentBaseConfig, e.g. a local host for tests. */
  agentOptions?: HttpAgentOptions
}

/**
 * ICRC-7 marketplace in icrc1_oracle.
 *
 * Selling: the seller grants the oracle an ICRC-37 approval on the NFT and
 * creates a listing. Buying: the buyer grants an ICRC-2 ICP allowance and
 * calls buy; the oracle escrows the ICP, moves the NFT and pays the seller.
 */
export class MarketplaceService {
  constructor(private readonly options: MarketplaceServiceOptions = {}) {}

  // ── Config & collections ──────────────────────────────────────────────

  async getConfig(): Promise<MarketplaceConfig> {
    const [raw] = (await this.oracle().get_marketplace_config()) as
      [] | [RawMarketplaceConfig]
    if (!raw) throw new MarketplaceError({ kind: "notConfigured" })
    return {
      icpLedgerId: raw.icp_ledger.toText(),
      minPriceE8s: raw.min_price_e8s,
      maxRetries: raw.max_retries,
    }
  }

  /** All registered collections, including Spam/Hidden (see `tradable`). */
  async getCollections(): Promise<NftCollection[]> {
    const oracle = this.oracle()
    const total = await oracle.count_nft_collections()
    const pages = await Promise.all(
      Array.from(
        { length: Math.ceil(Number(total) / Number(PAGE_SIZE)) },
        (_, i) =>
          oracle.get_nft_collections_paginated(
            BigInt(i) * PAGE_SIZE,
            PAGE_SIZE,
          ),
      ),
    )
    return pages.flat().map(mapCollection)
  }

  async getCollection(canisterId: string): Promise<NftCollection | undefined> {
    const [raw] = await this.oracle().get_nft_collection(
      Principal.fromText(canisterId),
    )
    return raw && mapCollection(raw)
  }

  /** Reads name, symbol, logo and description from the ICRC-7 canister. */
  async getCollectionMetadata(
    canisterId: string,
  ): Promise<NftCollectionRequest> {
    const nft = this.nft(canisterId)
    const [name, symbol, logo, description] = await Promise.all([
      nft.icrc7_name(),
      nft.icrc7_symbol(),
      nft.icrc7_logo(),
      nft.icrc7_description(),
    ])
    return {
      canisterId,
      name,
      symbol,
      logo: logo[0],
      description: description[0],
    }
  }

  /** Registers a collection (as Community). No-op if it is already known. */
  async addCollection(
    identity: SignIdentity,
    request: NftCollectionRequest,
  ): Promise<void> {
    await this.oracle(identity).store_nft_collection({
      canister_id: Principal.fromText(request.canisterId),
      name: request.name,
      symbol: request.symbol,
      logo: toOpt(request.logo),
      description: toOpt(request.description),
    })
  }

  // ── ICRC-7 tokens ─────────────────────────────────────────────────────

  async getOwnedTokenIds(
    collectionId: string,
    owner: Principal,
    page: { prev?: bigint; take?: bigint } = {},
  ): Promise<bigint[]> {
    return this.nft(collectionId).icrc7_tokens_of(
      { owner, subaccount: [] },
      toOpt(page.prev),
      toOpt(page.take),
    )
  }

  async getTokenMetadata(
    collectionId: string,
    tokenIds: bigint[],
  ): Promise<Map<bigint, Array<[string, Value]>>> {
    const res = await this.nft(collectionId).icrc7_token_metadata(tokenIds)
    return new Map(tokenIds.map((id, i) => [id, res[i]?.[0] ?? []]))
  }

  /** Owner of the token's default account, if any. */
  async getOwner(
    collectionId: string,
    tokenId: bigint,
  ): Promise<Principal | undefined> {
    const [owner] = await this.nft(collectionId).icrc7_owner_of([tokenId])
    const account = owner?.[0]
    const isDefault =
      !account?.subaccount[0] ||
      Array.from(account.subaccount[0]).every((b) => b === 0)
    return account && isDefault ? account.owner : undefined
  }

  /** Whether the oracle may move the owner's token (ICRC-37 approval). */
  async isApproved(collectionId: string, tokenId: bigint): Promise<boolean> {
    const [approved] = await this.nft(collectionId).icrc37_is_approved([
      {
        token_id: tokenId,
        from_subaccount: [],
        spender: this.oracleAccount(),
      },
    ])
    return approved ?? false
  }

  /** Grants the oracle an ICRC-37 approval on the token. */
  async approveNft(
    identity: SignIdentity,
    collectionId: string,
    tokenId: bigint,
  ): Promise<void> {
    await this.nft(collectionId, identity).icrc37_approve_tokens([
      {
        token_id: tokenId,
        approval_info: {
          spender: this.oracleAccount(),
          from_subaccount: [],
          expires_at: [],
          memo: [],
          created_at_time: nowNs(),
        },
      },
    ])
    if (!(await this.isApproved(collectionId, tokenId))) {
      throw new MarketplaceError({ kind: "approvalFailed" })
    }
  }

  /** Removes the oracle's approval on the token. Best effort. */
  async revokeNftApproval(
    identity: SignIdentity,
    collectionId: string,
    tokenId: bigint,
  ): Promise<void> {
    await this.nft(collectionId, identity).icrc37_revoke_token_approvals([
      {
        token_id: tokenId,
        spender: [this.oracleAccount()],
        from_subaccount: [],
        memo: [],
        created_at_time: [],
      },
    ])
  }

  // ── Listings ──────────────────────────────────────────────────────────

  /**
   * Listings on sale in tradable collections, optionally one collection.
   * Sorted by `sort` (default "Newest"); `limit` is capped at 100 by the
   * canister. `total` counts all matches, for pagination.
   */
  async getListings(query: ListingQuery = {}): Promise<ListingPage> {
    const page = await this.oracle().get_listings({
      collection: query.collectionId
        ? [Principal.fromText(query.collectionId)]
        : [],
      sort: query.sort ? [{ [query.sort]: null } as RawListingSort] : [],
      offset: BigInt(query.offset ?? 0),
      limit: BigInt(query.limit ?? 25),
    })
    return { items: page.items.map(mapListing), total: Number(page.total) }
  }

  async getListing(listingId: bigint): Promise<Listing | undefined> {
    const [raw] = await this.oracle().get_listing(listingId)
    return raw && mapListing(raw)
  }

  /** A seller's listings in any status, newest first. */
  async getListingsBySeller(
    seller: Principal,
    offset = 0,
    limit = 25,
  ): Promise<Listing[]> {
    const raw = await this.oracle().get_listings_by_seller(
      seller,
      BigInt(offset),
      BigInt(limit),
    )
    return raw.map(mapListing)
  }

  /**
   * Puts an NFT on sale: grants the ICRC-37 approval if missing, then
   * creates the listing. To change the price, cancel and list again.
   */
  async listNft(
    identity: SignIdentity,
    params: CreateListingParams,
  ): Promise<Listing> {
    const config = await this.getConfig()
    if (params.priceE8s < config.minPriceE8s) {
      throw new MarketplaceError({
        kind: "priceTooLow",
        minPriceE8s: config.minPriceE8s,
      })
    }
    const owner = await this.getOwner(params.collectionId, params.tokenId)
    if (owner?.toText() !== identity.getPrincipal().toText()) {
      throw new MarketplaceError({ kind: "notOwner" })
    }
    if (!(await this.isApproved(params.collectionId, params.tokenId))) {
      await this.approveNft(identity, params.collectionId, params.tokenId)
    }
    const res = (await this.oracle(identity).create_listing({
      collection: Principal.fromText(params.collectionId),
      token_id: params.tokenId,
      price_e8s: params.priceE8s,
    })) as ListingResult
    return mapListing(unwrap(res))
  }

  /** Cancels a listing and, by default, revokes the NFT approval. */
  async cancelListing(
    identity: SignIdentity,
    listingId: bigint,
    { revokeApproval = true }: { revokeApproval?: boolean } = {},
  ): Promise<Listing> {
    const res = (await this.oracle(identity).cancel_listing(
      listingId,
    )) as ListingResult
    const listing = mapListing(unwrap(res))
    if (revokeApproval) {
      await this.revokeNftApproval(
        identity,
        listing.collectionId,
        listing.tokenId,
      ).catch((e) => console.warn("Failed to revoke NFT approval", e))
    }
    return listing
  }

  // ── Purchases ─────────────────────────────────────────────────────────

  async getBuyQuote(listingId: bigint): Promise<BuyQuote> {
    const listing = await this.requireListing(listingId)
    const config = await this.getConfig()
    const fee = await this.ledger(config.icpLedgerId).transactionFee({
      certified: false,
    })
    return {
      priceE8s: listing.priceE8s,
      ledgerFeeE8s: fee,
      totalCostE8s: listing.priceE8s + fee * BigInt(2),
      sellerReceivesE8s: listing.priceE8s - fee,
    }
  }

  /**
   * Buys a listing: approves `price + fee` ICP for the oracle (ICRC-2), then
   * calls buy. Resolves with the purchase record; check it with
   * `isPurchaseSuccessful`. A pending status means the marketplace keeps
   * retrying (a failed NFT transfer ends in a refund).
   */
  async buy(identity: SignIdentity, listingId: bigint): Promise<MarketplaceTx> {
    const listing = await this.requireListing(listingId)
    if (listing.status !== "Active") {
      throw new MarketplaceError(
        listing.status === "Locked"
          ? { kind: "purchaseInProgress" }
          : { kind: "listingNotActive" },
      )
    }
    // Checked here too, so no ICP allowance is granted for a doomed call.
    if (listing.seller === identity.getPrincipal().toText()) {
      throw new MarketplaceError({ kind: "cannotBuyOwnListing" })
    }
    const config = await this.getConfig()
    const ledger = this.ledger(config.icpLedgerId, identity)
    const fee = await ledger.transactionFee({ certified: false })
    await ledger.approve({
      spender: this.oracleAccount(),
      amount: listing.priceE8s + fee,
      expires_at: nowNs() + BigInt(BUY_ALLOWANCE_TTL_MS) * NS_PER_MS,
    })
    const res = (await this.oracle(identity).buy_listing(
      listingId,
    )) as MarketTxResult
    return mapTx(unwrap(res))
  }

  async getTx(txId: bigint): Promise<MarketplaceTx | undefined> {
    const [raw] = await this.oracle().get_marketplace_tx(txId)
    return raw && mapTx(raw)
  }

  /** Purchases where the user is buyer or seller, newest first. */
  async getUserTxs(
    user: Principal,
    offset = 0,
    limit = 25,
  ): Promise<MarketplaceTx[]> {
    const raw = await this.oracle().get_marketplace_txs_by_user(
      user,
      BigInt(offset),
      BigInt(limit),
    )
    return raw.map(mapTx)
  }

  // ── private helpers ───────────────────────────────────────────────────

  private get oracleId(): string {
    return this.options.oracleCanisterId ?? ICRC1_ORACLE_CANISTER_ID
  }

  private oracleAccount() {
    return {
      owner: Principal.fromText(this.oracleId),
      subaccount: [] as [],
    }
  }

  private agent(identity?: SignIdentity): HttpAgent {
    const opts = this.options.agentOptions
    return HttpAgent.createSync({ ...agentBaseConfig, ...opts, identity })
  }

  private oracle(identity?: SignIdentity) {
    return actorBuilder<Oracle>(this.oracleId, oracleIdl, {
      agent: this.agent(identity),
    })
  }

  private nft(collectionId: string, identity?: SignIdentity) {
    return actorBuilder<Icrc7>(collectionId, icrc7Idl, {
      agent: this.agent(identity),
    })
  }

  private ledger(ledgerId: string, identity?: SignIdentity) {
    return IcrcLedgerCanister.create({
      canisterId: Principal.fromText(ledgerId),
      agent: this.agent(identity),
    })
  }

  private async requireListing(listingId: bigint): Promise<Listing> {
    const listing = await this.getListing(listingId)
    if (!listing) throw new MarketplaceError({ kind: "listingNotFound" })
    return listing
  }
}

// ── mapping ─────────────────────────────────────────────────────────────

const nowNs = (): bigint => BigInt(Date.now()) * NS_PER_MS
const nsToDate = (ns: bigint): Date => new Date(Number(ns / NS_PER_MS))
const variantName = <T extends string>(v: object): T => Object.keys(v)[0] as T
const toOpt = <T>(v: T | undefined): [] | [T] => (v === undefined ? [] : [v])

function unwrap<T>(res: { Ok: T } | { Err: RawMarketplaceError }): T {
  if ("Err" in res) throw new MarketplaceError(mapError(res.Err))
  return res.Ok
}

function mapCollection(raw: RawNftCollection): NftCollection {
  const status = variantName<NftCollectionStatus>(raw.status)
  return {
    canisterId: raw.canister_id.toText(),
    name: raw.name,
    symbol: raw.symbol,
    logo: raw.logo[0],
    description: raw.description[0],
    status,
    dateAdded: nsToDate(raw.date_added),
    tradable: status === "Verified" || status === "Community",
  }
}

function mapListing(raw: RawListing): Listing {
  return {
    id: raw.id,
    collectionId: raw.collection.toText(),
    tokenId: raw.token_id,
    seller: raw.seller.toText(),
    priceE8s: raw.price_e8s,
    status: variantName<ListingStatus>(raw.status),
    createdAt: nsToDate(raw.created_at),
    updatedAt: nsToDate(raw.updated_at),
  }
}

function mapTx(raw: RawMarketTx): MarketplaceTx {
  return {
    id: raw.id,
    listingId: raw.listing_id,
    collectionId: raw.collection.toText(),
    tokenId: raw.token_id,
    seller: raw.seller.toText(),
    buyer: raw.buyer.toText(),
    priceE8s: raw.price_e8s,
    feeE8s: raw.fee_e8s,
    status: variantName<MarketplaceTxStatus>(raw.status),
    needsReview: raw.needs_review,
    lastError: raw.last_error[0],
    paymentBlock: raw.payment_block[0],
    nftBlock: raw.nft_block[0],
    settleBlock: raw.settle_block[0],
    createdAt: nsToDate(raw.created_at),
    updatedAt: nsToDate(raw.updated_at),
  }
}

export function mapError(raw: RawMarketplaceError): MarketplaceErrorCause {
  if ("PriceTooLow" in raw)
    return { kind: "priceTooLow", minPriceE8s: raw.PriceTooLow.min_price_e8s }
  if ("AlreadyListed" in raw)
    return { kind: "alreadyListed", listingId: raw.AlreadyListed.listing_id }
  if ("PaymentFailed" in raw)
    return { kind: "paymentFailed", message: raw.PaymentFailed }
  if ("CallFailed" in raw)
    return { kind: "callFailed", message: raw.CallFailed }
  const name = variantName<string>(raw)
  return {
    kind: (name.charAt(0).toLowerCase() + name.slice(1)) as Exclude<
      MarketplaceErrorCause["kind"],
      "priceTooLow" | "alreadyListed" | "paymentFailed" | "callFailed"
    >,
  } as MarketplaceErrorCause
}

export const marketplaceService = new MarketplaceService()
