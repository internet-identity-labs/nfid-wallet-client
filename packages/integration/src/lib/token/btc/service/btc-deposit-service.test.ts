import { CkBTCMinterCanister } from "@dfinity/ckbtc"
import { Principal } from "@dfinity/principal"

import { BtсDepositService } from "../service"

jest.mock("@dfinity/ckbtc", () => ({
  CkBTCMinterCanister: {
    create: jest.fn().mockReturnValue({
      getBtcAddress: jest.fn().mockResolvedValue("btc-address-mock"),
      updateBalance: jest.fn().mockResolvedValue(undefined),
    }),
  },
}))

const MOCK_PRINCIPAL = Principal.fromText("aaaaa-aa")

describe("BtсDepositService", () => {
  let service: BtсDepositService
  let minterMock: any

  beforeEach(() => {
    service = new BtсDepositService()
    minterMock = (CkBTCMinterCanister.create as jest.Mock).mock.results[0].value
  })

  test("generateAddress returns BTC address and logs success", async () => {
    const result = await service.generateAddress(MOCK_PRINCIPAL)

    expect(minterMock.getBtcAddress).toHaveBeenCalledWith({
      owner: MOCK_PRINCIPAL,
    })
    expect(result).toBe("btc-address-mock")
  })

  test("generateAddress throws and logs on failure", async () => {
    const error = new Error("fetch failed")
    minterMock.getBtcAddress.mockRejectedValueOnce(error)

    await expect(service.generateAddress(MOCK_PRINCIPAL)).rejects.toThrow(
      "fetch failed",
    )
  })

  test("monitorDeposit calls updateBalance immediately and returns interval controller", async () => {
    const updateSpy = jest.spyOn(service, "updateBalance").mockRejectedValue("")

    const watcher = await service.monitorDeposit(MOCK_PRINCIPAL)

    expect(typeof watcher.clearInterval).toBe("function")
    expect(updateSpy).toHaveBeenCalledTimes(1)

    watcher.clearInterval()
  })
})
