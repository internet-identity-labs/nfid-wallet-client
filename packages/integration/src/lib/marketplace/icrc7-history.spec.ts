import { Principal } from "@icp-sdk/core/principal"

import type { BlockWithId, Value } from "../_ic_api/icrc7.d"
import {
  Icrc7HistoryService,
  parseAccount,
  parseIcrc7Block,
  parseMarketTxId,
  parseTokenInfo,
} from "./icrc7-history"

const store = new Map<string, unknown>()
jest.mock("@nfid/client-db", () => ({
  storageWithTtl: {
    get: jest.fn(async (k: string) => store.get(k) ?? null),
    set: jest.fn(async (k: string, v: unknown) => void store.set(k, v)),
  },
}))

const getBlocks = jest.fn()
const tokenMetadata = jest.fn()
jest.mock("../actors", () => ({
  actorBuilder: jest.fn(() => ({
    icrc3_get_blocks: getBlocks,
    icrc7_token_metadata: tokenMetadata,
  })),
}))

const getTx = jest.fn()
jest.mock("./marketplace-service", () => ({
  marketplaceService: { getTx: (id: bigint) => getTx(id) },
}))

const COLLECTION = "uxrrr-q7777-77774-qaaaq-cai"
const ORACLE = "uzt4z-lp777-77774-qaabq-cai"
const SELLER = "4fi4z-cvnkq-hmrx4-g2pag-sxtjy-ybbg5-edmm6-wq66c-r5pgn-drq27-yqe"
const BUYER = "epxoj-aryaf-3pm37-dlumd-d4gnq-dkgeg-dv74l-gfn2d-zazrv-b6kqa-rae"

const marketMemo = (txId: number) =>
  Uint8Array.from([
    ...Array.from("NFIDMKT", (c) => c.charCodeAt(0)),
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    txId,
  ])

// Same shape as ORIGYN core_nft blocks on a local replica.
const block = (
  id: number,
  btype: string,
  tx: Record<string, Value>,
): BlockWithId => ({
  id: BigInt(id),
  block: {
    Map: [
      ["btype", { Text: btype }],
      ["timestamp", { Nat: BigInt(1_000 + id) }],
      [
        "tx",
        {
          Map: [["op", { Text: btype }], ...Object.entries(tx)] as Array<
            [string, Value]
          >,
        },
      ],
    ],
  },
})

const mint = (id: number, tid: number, to: string) =>
  block(id, "7mint", { tid: { Nat: BigInt(tid) }, to: { Text: to } })

const sale = (id: number, tid: number, txId: number) =>
  block(id, "37xfer", {
    tid: { Nat: BigInt(tid) },
    from: { Text: SELLER },
    to: { Text: BUYER },
    spender: { Text: ORACLE },
    memo: { Blob: marketMemo(txId) },
  })

describe("parseIcrc7Block", () => {
  it("maps a mint to the receiver", () => {
    expect(parseIcrc7Block(COLLECTION, mint(0, 1, SELLER), SELLER)).toEqual({
      collectionId: COLLECTION,
      blockId: BigInt(0),
      kind: "mint",
      tokenId: BigInt(1),
      to: SELLER,
      timestamp: BigInt(1_000),
    })
    expect(parseIcrc7Block(COLLECTION, mint(0, 1, SELLER), BUYER)).toBe(
      undefined,
    )
  })

  it("maps a marketplace transfer to a sale for both sides", () => {
    const seller = parseIcrc7Block(COLLECTION, sale(6, 1, 0), SELLER)
    const buyer = parseIcrc7Block(COLLECTION, sale(6, 1, 0), BUYER)
    expect(seller).toMatchObject({ kind: "sale", marketTxId: BigInt(0) })
    expect(buyer).toMatchObject({ kind: "sale", from: SELLER, to: BUYER })
    expect(parseIcrc7Block(COLLECTION, sale(6, 1, 0), ORACLE)).toBe(undefined)
  })

  it("maps other transfers, approvals and skips revokes", () => {
    const xfer = block(1, "7xfer", {
      tid: { Nat: BigInt(2) },
      from: { Text: SELLER },
      to: { Text: BUYER },
    })
    expect(parseIcrc7Block(COLLECTION, xfer, BUYER)).toMatchObject({
      kind: "transfer",
      marketTxId: undefined,
    })

    const approve = block(2, "37approve", {
      tid: { Nat: BigInt(2) },
      from: { Text: SELLER },
      spender: { Text: ORACLE },
    })
    expect(parseIcrc7Block(COLLECTION, approve, SELLER)).toMatchObject({
      kind: "approve",
      spender: ORACLE,
    })

    const revoke = block(3, "37revoke", {
      tid: { Nat: BigInt(2) },
      from: { Text: SELLER },
    })
    expect(parseIcrc7Block(COLLECTION, revoke, SELLER)).toBe(undefined)
  })
})

describe("block field parsers", () => {
  it("reads accounts as text or as an array of blobs", () => {
    const owner = Uint8Array.from([1, 2, 3])
    const text = Principal.fromUint8Array(owner).toText()
    expect(parseAccount({ Text: SELLER })).toBe(SELLER)
    expect(parseAccount({ Array: [{ Blob: owner }] })).toBe(text)
    expect(
      parseAccount({ Array: [{ Blob: owner }, { Blob: new Uint8Array(32) }] }),
    ).toBe(text)
    const sub = new Uint8Array(32)
    sub[31] = 1
    expect(parseAccount({ Array: [{ Blob: owner }, { Blob: sub }] })).toBe(
      `${text}.${"00".repeat(31)}01`,
    )
  })

  it("reads the marketplace tx id from the memo", () => {
    expect(parseMarketTxId(marketMemo(5))).toBe(BigInt(5))
    expect(parseMarketTxId(Uint8Array.from([1, 2, 3]))).toBe(undefined)
    expect(parseMarketTxId(undefined)).toBe(undefined)
  })

  it("reads the token name and image", () => {
    expect(
      parseTokenInfo([
        ["icrc7:name", { Text: "NFID Test #1" }],
        ["icrc7:image", { Text: "https://img" }],
      ]),
    ).toEqual({ name: "NFID Test #1", image: "https://img" })
  })
})

describe("Icrc7HistoryService", () => {
  beforeEach(() => {
    store.clear()
    jest.clearAllMocks()
    tokenMetadata.mockImplementation(async (ids: bigint[]) =>
      ids.map((id) => [[["icrc7:name", { Text: `NFT #${id}` }]]]),
    )
    getTx.mockResolvedValue({ priceE8s: BigInt(150_000_000) })
  })

  const log = (blocks: BlockWithId[]) =>
    getBlocks.mockImplementation(
      async ([{ start, length }]: Array<{
        start: bigint
        length: bigint
      }>) => ({
        log_length: BigInt(blocks.length),
        blocks: blocks.filter((b) => b.id >= start && b.id < start + length),
        archived_blocks: [],
      }),
    )

  it("keeps the user's events with token names and sale prices", async () => {
    log([mint(0, 1, SELLER), mint(1, 2, BUYER), sale(2, 1, 7)])

    const events = await new Icrc7HistoryService().getUserEvents(
      [COLLECTION],
      SELLER,
    )

    expect(events.map((e) => [e.kind, e.blockId])).toEqual([
      ["sale", BigInt(2)],
      ["mint", BigInt(0)],
    ])
    expect(events[0].priceE8s).toBe(BigInt(150_000_000))
    expect(events[0].token.name).toBe("NFT #1")
    expect(getTx).toHaveBeenCalledWith(BigInt(7))
  })

  it("reads only new blocks on the next load", async () => {
    const blocks = [mint(0, 1, SELLER)]
    log(blocks)
    const service = new Icrc7HistoryService()
    await service.getUserEvents([COLLECTION], SELLER)

    blocks.push(sale(1, 1, 3))
    getBlocks.mockClear()
    getTx.mockClear()
    const events = await service.getUserEvents([COLLECTION], SELLER)

    expect(getBlocks).toHaveBeenCalledTimes(1)
    expect(getBlocks.mock.calls[0][0][0].start).toBe(BigInt(1))
    expect(events).toHaveLength(2)
    expect(getTx).toHaveBeenCalledTimes(1)
  })

  it("pages through logs longer than one response", async () => {
    log(Array.from({ length: 250 }, (_, i) => mint(i, i, SELLER)))

    const events = await new Icrc7HistoryService().getUserEvents(
      [COLLECTION],
      SELLER,
    )

    expect(events).toHaveLength(250)
    expect(new Set(events.map((e) => e.blockId)).size).toBe(250)
  })

  it("skips a failing collection", async () => {
    getBlocks.mockRejectedValue(new Error("down"))
    jest.spyOn(console, "error").mockImplementation(() => undefined)

    await expect(
      new Icrc7HistoryService().getUserEvents([COLLECTION], SELLER),
    ).resolves.toEqual([])
  })
})
