import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"

import { errorHandlerFactory } from "src/integration/swap/errors/handler-factory"
import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { icpSwapService } from "src/integration/swap/icpswap/service/icpswap-service"
import { Shroff } from "src/integration/swap/shroff"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapStage } from "src/integration/swap/types/enums"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100c88f8f46ee5c23a748026498ddc7ed2104782ea02cd266170a470587d7c2f932",
  "0b897d4ee58ff13eed9cc5f1aa6de0f009423b9a866b384b2e52db08559c882b",
]

//too long. unskip when needed
describe("shroff deposit error handler test", () => {
  jest.setTimeout(900000)

  //TODO fixme!!!
  it.skip("deposit error handler test", async () => {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const shroff: Shroff = await new IcpSwapShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote("0.001")

    let callCount = 0

    jest.spyOn(shroff as any, "deposit").mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        throw new Error("Deposit MOCK error")
      }
    })

    jest.spyOn(shroff as any, "transferToSwap").mockImplementation(() => {
      shroff.getSwapTransaction()?.setTransferId(BigInt(1))
      console.log("Transfer MOCK")
    })

    jest
      .spyOn(swapTransactionService as any, "storeTransaction")
      .mockImplementation(() => {
        console.debug("Transaction stored MOCK")
      })
    const _can = await icpSwapService.getPoolFactory(sourceLedger, targetLedger)
    try {
      await shroff.swap(mockId)
    } catch (_e) {}
    const failedTransaction = shroff.getSwapTransaction()
    expect(failedTransaction?.getStage()).toEqual(SwapStage.Deposit)
    const errorHandler = errorHandlerFactory.getHandler(failedTransaction!)
    const transaction = (await errorHandler.completeTransaction(
      mockId,
    )) as IcpSwapTransactionImpl
    expect(transaction.getStage()).toEqual(SwapStage.Completed)
  })
})
