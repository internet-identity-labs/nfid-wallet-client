import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { errorHandlerFactory } from "src/integration/swap/errors/handler-factory"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapStage } from "src/integration/swap/types/enums"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100c88f8f46ee5c23a748026498ddc7ed2104782ea02cd266170a470587d7c2f932",
  "0b897d4ee58ff13eed9cc5f1aa6de0f009423b9a866b384b2e52db08559c882b",
]

const mockPrincipal =
  "4pw67-jou3d-xb4py-6pnvx-5p75x-pp3mi-ywe4j-bhmmq-l3354-awsws-kae"

describe("shroff transfer kong error handler test", () => {
  jest.setTimeout(900000)

  it.skip("shroff transfer kong icrc2 error handler test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const shroff: Shroff = await new KongShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote("0.001")

    jest.spyOn(shroff as any, "icrc2approve").mockImplementation(() => {
      throw new Error("ICRC2 approve MOCK error")
    })

    jest
      .spyOn(swapTransactionService as any, "storeTransaction")
      .mockImplementation(() => {
        console.debug("Transaction stored MOCK")
      })
    try {
      await shroff.swap(mockId)
      fail("Should throw an error")
    } catch (e) {}
    const failedTransaction = shroff.getSwapTransaction()
    const errorHandler = errorHandlerFactory.getHandler(failedTransaction!)
    expect(failedTransaction?.getStage()).toEqual(SwapStage.TransferSwap)
    const transaction = await errorHandler.completeTransaction(mockId)
    expect(transaction.getStage()).toEqual(SwapStage.Completed)
  })

  it.skip("shroff transfer kong icrc1 error handler test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const shroff: Shroff = await new KongShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote("0.001")

    jest.spyOn(shroff as any, "transferToSwap").mockImplementation(() => {
      throw new Error("ICRC1 approve MOCK error")
    })

    jest.spyOn(shroff as any, "icrc2supported").mockImplementation(() => {
      return Promise.resolve(false)
    })

    jest
      .spyOn(swapTransactionService as any, "storeTransaction")
      .mockImplementation(() => {
        console.debug("Transaction stored MOCK")
      })
    try {
      await shroff.swap(mockId)
      fail("Should throw an error")
    } catch (e) {}
    const failedTransaction = shroff.getSwapTransaction()
    const errorHandler = errorHandlerFactory.getHandler(failedTransaction!)
    expect(failedTransaction?.getStage()).toEqual(SwapStage.TransferSwap)
    const transaction = await errorHandler.completeTransaction(mockId)
    expect(transaction.getStage()).toEqual(SwapStage.Completed)
  })
})
