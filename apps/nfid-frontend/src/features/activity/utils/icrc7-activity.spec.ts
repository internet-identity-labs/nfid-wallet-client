import {
  Icrc7EventWithToken,
  NftCollection,
} from "@nfid/integration/marketplace"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { formatIcp, mapIcrc7EventToRow } from "./icrc7-activity"

const COLLECTION = "pwy6s-kiaaa-aaaak-acm3q-cai"
const USER = "kw2io-yqjdh-j7e5y-sjlzt-ka6ro-ojv35-gqwni-fq72a-wgkqs-alhrg-kqe"
const OTHER = "5tjxp-5thzo-xovsd-ydi2d-kpxqc-bj4vj-mzddh-kssko-zhxnd-kehf3-sqe"
const ORACLE = "ryjl3-tyaaa-aaaaa-aaaba-cai"

const collection: NftCollection = {
  canisterId: COLLECTION,
  name: "NFID Orbs",
  symbol: "ORB",
  logo: "logo.png",
  status: "Verified",
  dateAdded: new Date(0),
  tradable: true,
}

const event = (
  overrides: Partial<Icrc7EventWithToken>,
): Icrc7EventWithToken => ({
  collectionId: COLLECTION,
  blockId: BigInt(7),
  kind: "transfer",
  tokenId: BigInt(3),
  timestamp: BigInt(1_700_000_000_000_000_000),
  token: {},
  ...overrides,
})

describe("mapIcrc7EventToRow", () => {
  it("maps a revoke to a Revoke row pointing to the spender", () => {
    const row = mapIcrc7EventToRow(
      event({ kind: "revoke", from: USER, spender: ORACLE }),
      USER,
      collection,
    )

    expect(row.action).toBe(IActivityAction.REVOKE)
    expect(row.from).toBe(USER)
    expect(row.to).toBe(ORACLE)
    expect(row.id).toBe(`icrc7:${COLLECTION}:7`)
    expect(row.asset).toMatchObject({
      type: "nft",
      name: "NFID Orbs #3",
      preview: "logo.png",
      collectionName: "NFID Orbs",
    })
  })

  it("maps an approve to the spender too", () => {
    const row = mapIcrc7EventToRow(
      event({ kind: "approve", from: USER, spender: ORACLE }),
      USER,
    )
    expect(row.action).toBe(IActivityAction.APPROVE)
    expect(row.to).toBe(ORACLE)
  })

  it("maps sends, receives and sales by direction", () => {
    expect(
      mapIcrc7EventToRow(event({ from: USER, to: OTHER }), USER).action,
    ).toBe(IActivityAction.SENT)
    expect(
      mapIcrc7EventToRow(event({ from: OTHER, to: USER }), USER).action,
    ).toBe(IActivityAction.RECEIVED)
    const sale = mapIcrc7EventToRow(
      event({
        kind: "sale",
        from: USER,
        to: OTHER,
        priceE8s: BigInt(150_000_000),
        token: { name: "Orb", image: "orb.png" },
      }),
      USER,
    )
    expect(sale.action).toBe(IActivityAction.SELL)
    expect(sale.asset).toMatchObject({
      name: "Orb",
      preview: "orb.png",
      amount: "1.5 ICP",
    })
  })
})

describe("formatIcp", () => {
  it("trims trailing zeros", () => {
    expect(formatIcp(BigInt(100_000_000))).toBe("1 ICP")
    expect(formatIcp(BigInt(1_230_000))).toBe("0.0123 ICP")
  })
})
