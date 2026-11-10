import { Principal } from "@icp-sdk/core/principal"

import { storageWithTtl } from "@nfid/client-db"

import { archiveIdlFactory, idlFactory as icrc7Idl } from "../_ic_api/icrc7"
import type {
  _ARCHIVE_SERVICE as Icrc3Archive,
  _SERVICE as Icrc7,
  BlockWithId,
  GetBlocksRequest,
  Value,
} from "../_ic_api/icrc7.d"
import { actorBuilder } from "../actors"
import { marketplaceService } from "./marketplace-service"

/**
 * ICRC-7 history of one user, read from the ICRC-3 log of each collection.
 *
 * ICRC-7 has no index canister, so the whole log is scanned once and only
 * the user's events are kept. The cache stores the next block to read, so
 * later loads fetch only the new blocks.
 */

export type Icrc7EventKind = "mint" | "burn" | "transfer" | "approve" | "sale"

export interface Icrc7Event {
  collectionId: string
  blockId: bigint
  kind: Icrc7EventKind
  tokenId: bigint
  from?: string
  to?: string
  spender?: string
  /** Nanoseconds. */
  timestamp: bigint
  /** A sale made by the NFID marketplace (read from the block memo). */
  marketTxId?: bigint
  priceE8s?: bigint
}

export interface Icrc7TokenInfo {
  name?: string
  image?: string
}

export interface Icrc7EventWithToken extends Icrc7Event {
  token: Icrc7TokenInfo
}

interface CollectionHistory {
  version: number
  nextBlock: bigint
  events: Icrc7Event[]
  /** Keyed by token id as a string. */
  tokens: Record<string, Icrc7TokenInfo>
}

const CACHE_VERSION = 1
const CACHE_PREFIX = "Icrc7Activity_"
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000
/** Blocks per request; core_nft caps a response at 100. */
const PAGE = BigInt(100)
const PARALLEL_REQUESTS = 4
const METADATA_BATCH = 50
/** Memo prefix of transfers made by the marketplace in icrc1_oracle. */
const MARKET_MEMO_PREFIX = "NFIDMKT"

// ── Block parsing ───────────────────────────────────────────────────────

const field = (v: Value | undefined, key: string): Value | undefined =>
  v && "Map" in v ? v.Map.find(([k]) => k === key)?.[1] : undefined

const text = (v: Value | undefined): string | undefined =>
  v && "Text" in v ? v.Text : undefined

const nat = (v: Value | undefined): bigint | undefined =>
  v && "Nat" in v ? v.Nat : v && "Int" in v ? v.Int : undefined

const blob = (v: Value | undefined): Uint8Array | undefined =>
  v && "Blob" in v ? Uint8Array.from(v.Blob) : undefined

const isZero = (bytes: Uint8Array) => bytes.every((b) => b === 0)

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")

/**
 * Account as text: the principal for the default subaccount, otherwise
 * `principal.subaccountHex`. ORIGYN core_nft writes the principal as Text;
 * the ICRC-3 spec uses an array of blobs.
 */
export const parseAccount = (v: Value | undefined): string | undefined => {
  if (!v) return undefined
  if ("Text" in v) return v.Text
  const parts = "Array" in v ? v.Array.map(blob) : [blob(v)]
  const [owner, subaccount] = parts
  if (!owner) return undefined
  const principal = Principal.fromUint8Array(owner).toText()
  return subaccount && !isZero(subaccount)
    ? `${principal}.${toHex(subaccount)}`
    : principal
}

/** Marketplace tx id from a memo "NFIDMKT" + step + u64 id (big endian). */
export const parseMarketTxId = (memo: Uint8Array | undefined) => {
  if (!memo || memo.length !== MARKET_MEMO_PREFIX.length + 9) return undefined
  const prefix = String.fromCharCode(
    ...memo.slice(0, MARKET_MEMO_PREFIX.length),
  )
  if (prefix !== MARKET_MEMO_PREFIX) return undefined
  return memo
    .slice(MARKET_MEMO_PREFIX.length + 1)
    .reduce((id, b) => (id << BigInt(8)) | BigInt(b), BigInt(0))
}

/** The block as an event of `user`, or undefined if it is not theirs. */
export const parseIcrc7Block = (
  collectionId: string,
  { id, block }: BlockWithId,
  user: string,
): Icrc7Event | undefined => {
  const tx = field(block, "tx")
  const btype = text(field(block, "btype")) ?? text(field(tx, "op"))
  const tokenId = nat(field(tx, "tid"))
  if (!btype || tokenId === undefined) return undefined

  const from = parseAccount(field(tx, "from"))
  const to = parseAccount(field(tx, "to"))
  const spender = parseAccount(field(tx, "spender"))
  const timestamp =
    nat(field(block, "ts")) ??
    nat(field(block, "timestamp")) ??
    nat(field(tx, "ts")) ??
    nat(field(tx, "created_at_time")) ??
    BigInt(0)
  const base = { collectionId, blockId: id, tokenId, timestamp }

  switch (btype) {
    case "7mint":
      return to === user ? { ...base, kind: "mint", to } : undefined
    case "7burn":
      return from === user ? { ...base, kind: "burn", from } : undefined
    case "7xfer":
    case "37xfer": {
      if (from !== user && to !== user) return undefined
      const marketTxId = parseMarketTxId(blob(field(tx, "memo")))
      return {
        ...base,
        kind: marketTxId === undefined ? "transfer" : "sale",
        from,
        to,
        spender,
        marketTxId,
      }
    }
    case "37approve":
    case "37approve_coll":
      return from === user
        ? { ...base, kind: "approve", from, spender }
        : undefined
    default:
      // Revokes and metadata updates are not shown.
      return undefined
  }
}

// ── Token metadata ──────────────────────────────────────────────────────

const metaText = (
  meta: Array<[string, Value]>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = text(meta.find(([k]) => k === key)?.[1])
    if (value) return value
  }
  return undefined
}

export const parseTokenInfo = (
  meta: Array<[string, Value]>,
): Icrc7TokenInfo => ({
  name: metaText(meta, ["icrc7:name", "name", "icrc97:name"]),
  image: metaText(meta, [
    "icrc7:image",
    "image",
    "icrc7:thumbnail",
    "thumbnail",
    "icrc7:logo",
  ]),
})

// ── Service ─────────────────────────────────────────────────────────────

export class Icrc7HistoryService {
  private readonly inFlight = new Map<string, Promise<CollectionHistory>>()

  /** The user's events in all `collections`, newest first. */
  async getUserEvents(
    collections: string[],
    user: string,
  ): Promise<Icrc7EventWithToken[]> {
    const histories = await Promise.all(
      collections.map((id) =>
        this.sync(id, user).catch((e) => {
          console.error("ICRC-7 history failed for collection", id, e)
          return undefined
        }),
      ),
    )
    return histories
      .flatMap(
        (h) =>
          h?.events.map((e) => ({
            ...e,
            token: h.tokens[e.tokenId.toString()] ?? {},
          })) ?? [],
      )
      .sort((a, b) => Number(b.timestamp - a.timestamp))
  }

  private sync(collectionId: string, user: string) {
    const key = `${CACHE_PREFIX}${user}_${collectionId}`
    let promise = this.inFlight.get(key)
    if (!promise) {
      promise = this.doSync(key, collectionId, user).finally(() =>
        this.inFlight.delete(key),
      )
      this.inFlight.set(key, promise)
    }
    return promise
  }

  private async doSync(
    key: string,
    collectionId: string,
    user: string,
  ): Promise<CollectionHistory> {
    const cached = (await storageWithTtl.get(key)) as CollectionHistory | null
    const history: CollectionHistory =
      cached?.version === CACHE_VERSION
        ? cached
        : {
            version: CACHE_VERSION,
            nextBlock: BigInt(0),
            events: [],
            tokens: {},
          }

    const { blocks, nextBlock } = await this.fetchBlocksFrom(
      collectionId,
      history.nextBlock,
    )
    const newEvents = blocks
      .map((b) => parseIcrc7Block(collectionId, b, user))
      .filter((e): e is Icrc7Event => e !== undefined)

    const known = new Set(history.events.map((e) => e.blockId.toString()))
    history.events.push(
      ...newEvents.filter((e) => !known.has(e.blockId.toString())),
    )
    history.nextBlock = nextBlock

    await Promise.all([
      this.fillTokens(collectionId, history),
      this.fillPrices(history),
    ])
    await storageWithTtl.set(key, history, CACHE_TTL_MS)
    return history
  }

  /**
   * Blocks from `start` up to the log end. Stops at the first gap, so the
   * returned `nextBlock` never skips a block.
   */
  private async fetchBlocksFrom(
    collectionId: string,
    start: bigint,
  ): Promise<{ blocks: BlockWithId[]; nextBlock: bigint }> {
    const nft = actorBuilder<Icrc7>(collectionId, icrc7Idl)
    const byId = new Map<bigint, BlockWithId>()
    let next = start
    let logLength: bigint | undefined

    while (logLength === undefined || next < logLength) {
      const ranges: GetBlocksRequest[] = Array.from(
        { length: logLength === undefined ? 1 : PARALLEL_REQUESTS },
        (_, i) => ({ start: next + BigInt(i) * PAGE, length: PAGE }),
      ).filter((r) => logLength === undefined || r.start < logLength)

      const results = await Promise.all(
        ranges.map((r) => nft.icrc3_get_blocks([r])),
      )
      for (const res of results) {
        logLength = res.log_length
        res.blocks.forEach((b) => byId.set(b.id, b))
        for (const archived of res.archived_blocks) {
          const blocks = await this.fetchArchived(
            archived.callback,
            archived.args,
          )
          blocks.forEach((b) => byId.set(b.id, b))
        }
      }

      const before = next
      while (byId.has(next)) next++
      if (next === before) break
    }

    const blocks = Array.from(byId.values()).filter(
      (b) => b.id >= start && b.id < next,
    )
    return { blocks, nextBlock: next }
  }

  private async fetchArchived(
    [canisterId, method]: [Principal, string],
    args: GetBlocksRequest[],
  ): Promise<BlockWithId[]> {
    const archive = actorBuilder<Icrc3Archive>(
      canisterId,
      archiveIdlFactory(method),
    )
    const res = await archive[method](args)
    return res.blocks
  }

  private async fillTokens(collectionId: string, history: CollectionHistory) {
    const missing = Array.from(
      new Set(
        history.events
          .map((e) => e.tokenId)
          .filter((id) => !history.tokens[id.toString()]),
      ),
    )
    if (!missing.length) return

    const nft = actorBuilder<Icrc7>(collectionId, icrc7Idl)
    for (let i = 0; i < missing.length; i += METADATA_BATCH) {
      const ids = missing.slice(i, i + METADATA_BATCH)
      try {
        const res = await nft.icrc7_token_metadata(ids)
        ids.forEach((id, j) => {
          history.tokens[id.toString()] = parseTokenInfo(res[j]?.[0] ?? [])
        })
      } catch (e) {
        console.warn("ICRC-7 token metadata failed", collectionId, e)
      }
    }
  }

  private async fillPrices(history: CollectionHistory) {
    await Promise.all(
      history.events
        .filter((e) => e.marketTxId !== undefined && e.priceE8s === undefined)
        .map(async (e) => {
          try {
            const tx = await marketplaceService.getTx(e.marketTxId!)
            if (tx) e.priceE8s = tx.priceE8s
          } catch (err) {
            console.warn("Marketplace tx lookup failed", e.marketTxId, err)
          }
        }),
    )
  }
}

export const icrc7HistoryService = new Icrc7HistoryService()
