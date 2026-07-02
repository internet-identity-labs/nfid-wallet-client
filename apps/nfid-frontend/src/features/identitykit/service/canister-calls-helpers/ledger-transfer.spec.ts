jest.mock("@nfid/integration", () => ({
  exchangeRateService: { getICP2USD: jest.fn() },
  getBalance: jest.fn(),
}))

import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { exchangeRateService, getBalance } from "@nfid/integration"
import { WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { getLedgerTransferMetadata } from "./ledger-transfer"
import { RPCMessage } from "../../type"

const SENDER_TEXT = "2vxsx-fae"

const buildMessage = () =>
  ({
    data: { params: { sender: SENDER_TEXT } },
  }) as unknown as MessageEvent<RPCMessage>

describe("getLedgerTransferMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(exchangeRateService.getICP2USD as jest.Mock).mockReturnValue(12.5)
  })

  it("should compute metadata from a raw AccountIdentifier byte object", async () => {
    (getBalance as jest.Mock).mockResolvedValue(BigInt(1_000_000_000))

    const toBytes: Record<string, number> = {}
    "deadbeef"
      .repeat(8)
      .match(/../g)!
      .forEach((byte, i) => {
        toBytes[i] = parseInt(byte, 16)
      })

    const message = buildMessage()
    const args = JSON.stringify([
      {
        to: toBytes,
        memo: "12345",
        amount: { e8s: "100000000" },
      },
    ])

    const result = await getLedgerTransferMetadata(message, args)

    const expectedUserAddress = AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(SENDER_TEXT),
    }).toHex()

    expect(getBalance).toHaveBeenCalledWith(expectedUserAddress)
    expect(result.toAddress).toBe("deadbeef".repeat(8))
    expect(result.balance).toBe("1000000000")
    expect(result.memo).toBe("12345")
    expect(result.amount).toBe("100000000")
    expect(result.total).toBe(
      (BigInt(100000000) + BigInt(WALLET_FEE_E8S)).toString(),
    )
    expect(result.isInsufficientBalance).toBe(false)
    expect(result.usdRate).toBe("12.5")
    expect(result.symbol).toBe("ICP")
    expect(result.address).toBe(SENDER_TEXT)
    expect(result.fee).toBe(WALLET_FEE_E8S.toString())
  })

  it("should flag insufficient balance when total exceeds balance", async () => {
    (getBalance as jest.Mock).mockResolvedValue(BigInt(0))

    const toBytes: Record<string, number> = {}
    for (let i = 0; i < 32; i++) toBytes[i] = 0

    const message = buildMessage()
    const args = JSON.stringify([
      {
        to: toBytes,
        amount: { e8s: "5000" },
      },
    ])

    const result = await getLedgerTransferMetadata(message, args)

    expect(result.isInsufficientBalance).toBe(true)
    expect(result.memo).toBeUndefined()
  })
})
