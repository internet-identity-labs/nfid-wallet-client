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

const mockPrincipal =
  "4pw67-jou3d-xb4py-6pnvx-5p75x-pp3mi-ywe4j-bhmmq-l3354-awsws-kae"

describe("shroff transfer swap error handler test", () => {
  jest.setTimeout(900000)

  it("shroff transfer swap error handler test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    let mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const shroff: Shroff = await new IcpSwapShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()

    await shroff.getQuote("0.001")

    let callCount = 0

    jest.spyOn(shroff as any, "icrc2supported").mockResolvedValue(false)

    jest.spyOn(shroff as any, "transferToSwap").mockImplementation(() => {
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
    )) as IcpSwapTransactionImpl
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
