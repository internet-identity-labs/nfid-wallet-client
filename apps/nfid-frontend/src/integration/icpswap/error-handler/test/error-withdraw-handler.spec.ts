import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { errorHandlerFactory } from "src/integration/icpswap/error-handler/handler-factory"
import { ShroffBuilder } from "src/integration/icpswap/impl/shroff-impl"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { icpSwapService } from "src/integration/icpswap/service/icpswap-service"
import { swapTransactionService } from "src/integration/icpswap/service/transaction-service"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapStage } from "src/integration/icpswap/types/enums"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100c88f8f46ee5c23a748026498ddc7ed2104782ea02cd266170a470587d7c2f932",
  "0b897d4ee58ff13eed9cc5f1aa6de0f009423b9a866b384b2e52db08559c882b",
]

const mockPrincipal =
  "4pw67-jou3d-xb4py-6pnvx-5p75x-pp3mi-ywe4j-bhmmq-l3354-awsws-kae"

//too long. unskip when needed
describe("shroff withdraw error handler test", () => {
  jest.setTimeout(900000)

  //too long test. Unskip when needed
  it.skip("withdraw error handler test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    let mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const shroff: Shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote(0.001)

    let callCount = 0

    jest.spyOn(shroff as any, "withdraw").mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        throw new Error("Deposit MOCK error")
      }
    })

    jest
      .spyOn(swapTransactionService as any, "storeTransaction")
      .mockImplementation(() => {
        console.debug("Transaction stored MOCK")
      })
    const can = await icpSwapService.getPoolFactory(sourceLedger, targetLedger)
    const balanceExpected = await icpSwapService.getBalance(
      can.canisterId.toText(),
      mockId.getPrincipal(),
    )
    try {
      await shroff.swap(mockId)
    } catch (e) {}
    let failedTransaction = shroff.getSwapTransaction()
    const errorHandler = errorHandlerFactory.getHandler(failedTransaction!)
    let transaction = (await errorHandler.completeTransaction(
      mockId,
    )) as SwapTransactionImpl
    const balanceActual = await icpSwapService.getBalance(
      can.canisterId.toText(),
      mockId.getPrincipal(),
    )
    expect(Number(balanceActual.balance1)).toEqual(
      Number(balanceExpected.balance1),
    )
    expect(transaction.getStage()).toEqual(SwapStage.Completed)
  })
})
