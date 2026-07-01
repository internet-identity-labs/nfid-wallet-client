jest.mock("../actor.service", () => ({
  actorService: { getActor: jest.fn() },
}))

jest.mock("../method/interactive/icrc49-call-canister-method.service", () => ({
  IC_HOSTNAME: "https://ic0.app",
}))

jest.mock("@nfid/integration", () => ({
  exchangeRateService: { usdPriceForICRC1: jest.fn() },
}))

import { Principal } from "@icp-sdk/core/principal"

import { getIcrc1TransferMetadata } from "./icrc1-transfer"
import { actorService } from "../actor.service"
import { exchangeRateService } from "@nfid/integration"
import { RPCMessage } from "../../type"

const OWNER_TEXT = "2vxsx-fae"
const SENDER_TEXT = "2vxsx-fae"

const buildActor = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  icrc1_balance_of: jest.fn().mockResolvedValue(BigInt(1_000_000)),
  icrc1_symbol: jest.fn().mockResolvedValue("ckBTC"),
  icrc1_decimals: jest.fn().mockResolvedValue(8),
  icrc1_fee: jest.fn().mockResolvedValue(BigInt(10)),
  ...overrides,
})

const buildMessage = (canisterId = "mxzaz-hqaaa-aaaar-qaada-cai") =>
  ({
    data: {
      params: {
        canisterId,
        sender: SENDER_TEXT,
      },
    },
  }) as unknown as MessageEvent<RPCMessage>

describe("getIcrc1TransferMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(exchangeRateService.usdPriceForICRC1 as jest.Mock).mockResolvedValue({
      value: 42,
    })
  })

  it("should compute metadata for a request with subaccount and memo", async () => {
    const actor = buildActor()
    ;(actorService.getActor as jest.Mock).mockReturnValue(actor)

    const message = buildMessage()
    const subaccount: Record<string, number> = {}
    subaccount[31] = 1
    for (let i = 0; i < 31; i++) subaccount[i] = 0

    const args = JSON.stringify([
      {
        to: {
          owner: { __principal__: OWNER_TEXT },
          subaccount: [subaccount],
        },
        memo: [{ 0: 236 }],
        amount: "500",
      },
    ])

    const result = await getIcrc1TransferMetadata(message, args)

    expect(actorService.getActor).toHaveBeenCalledWith(
      "mxzaz-hqaaa-aaaar-qaada-cai",
      expect.anything(),
      expect.anything(),
    )
    expect(actor.icrc1_balance_of).toHaveBeenCalledWith({
      owner: Principal.fromText(SENDER_TEXT),
      subaccount: [],
    })
    expect(result.balance).toBe("1000000")
    expect(result.symbol).toBe("ckBTC")
    expect(result.decimals).toBe(8)
    expect(result.fee).toBe("10")
    expect(result.amount).toBe("500")
    expect(result.total).toBe("510")
    expect(result.isInsufficientBalance).toBe(false)
    expect(result.memo).toBe("ec")
    expect(result.usdRate).toBe("42")
    expect(result.address).toBe(SENDER_TEXT)
    expect(result.toAddress).toBe(
      `${Principal.fromText(OWNER_TEXT).toText()}-22yutvy.1`,
    )
  })

  it("should omit the subaccount from toAddress and leave memo undefined when neither is provided", async () => {
    const actor = buildActor()
    ;(actorService.getActor as jest.Mock).mockReturnValue(actor)

    const message = buildMessage()
    const args = JSON.stringify([
      {
        to: { owner: { __principal__: OWNER_TEXT } },
        amount: "100",
      },
    ])

    const result = await getIcrc1TransferMetadata(message, args)

    expect(result.memo).toBeUndefined()
    expect(result.toAddress).toBe(Principal.fromText(OWNER_TEXT).toText())
  })

  it("should flag insufficient balance when total exceeds balance", async () => {
    const actor = buildActor({
      icrc1_balance_of: jest.fn().mockResolvedValue(BigInt(5)),
    })
    ;(actorService.getActor as jest.Mock).mockReturnValue(actor)

    const message = buildMessage()
    const args = JSON.stringify([
      {
        to: { owner: { __principal__: OWNER_TEXT } },
        amount: "1000",
      },
    ])

    const result = await getIcrc1TransferMetadata(message, args)

    expect(result.isInsufficientBalance).toBe(true)
  })

  it("should surface an undefined usdRate when the exchange rate service returns nothing", async () => {
    const actor = buildActor()
    ;(actorService.getActor as jest.Mock).mockReturnValue(actor)
    ;(exchangeRateService.usdPriceForICRC1 as jest.Mock).mockResolvedValue(
      undefined,
    )

    const message = buildMessage()
    const args = JSON.stringify([
      {
        to: { owner: { __principal__: OWNER_TEXT } },
        amount: "1",
      },
    ])

    const result = await getIcrc1TransferMetadata(message, args)

    expect(result.usdRate).toBeUndefined()
  })
})
