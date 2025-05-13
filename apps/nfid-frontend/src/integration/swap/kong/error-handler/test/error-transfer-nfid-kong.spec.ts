import { Ed25519KeyIdentity } from "@dfinity/identity"
import { errorHandlerFactory } from "src/integration/swap/errors/handler-factory"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapStage } from "src/integration/swap/types/enums"

import { ContactSupportError } from "frontend/integration/swap/errors/types/contact-support-error"

describe("shroff transfer kong error handler test", () => {
  jest.setTimeout(900000)

  it.skip("shroff transfer kong icrc2 error handler test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    let mockId = Ed25519KeyIdentity.generate()

    const shroff: Shroff = await new KongShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote("0.001")
    jest.spyOn(shroff as any, "icrc2approve").mockImplementation(() => {
      return BigInt(1)
    })
    jest.spyOn(shroff as any, "swapInternal").mockImplementation(() => {
      console.log("Swap internal")
      shroff.getSwapTransaction()!.setSwap(BigInt(1))
    })
    jest.spyOn(shroff as any, "transferToNFID").mockImplementation(() => {
      throw new Error("Some error")
    })

    jest
      .spyOn(swapTransactionService as any, "storeTransaction")
      .mockImplementation(() => {
        console.debug("Transaction stored MOCK")
      })
    try {
      await shroff.swap(mockId)
      // eslint-disable-next-line jest/no-jasmine-globals
      fail("Should throw an error")
    } catch (e) {}
    let failedTransaction = shroff.getSwapTransaction()
    const errorHandler = errorHandlerFactory.getHandler(failedTransaction!)
    expect(failedTransaction?.getStage()).toEqual(SwapStage.TransferNFID)
    try {
      let trs = await errorHandler.completeTransaction(mockId)
      expect(trs.getStage()).toEqual(SwapStage.Completed)
    } catch (e) {
      if (e instanceof ContactSupportError) {
        expect(e.message).toBe("KongSwap provider error")
      }
    }
  })
})
