import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { ShroffBuilder } from "src/integration/icpswap/impl/shroff-impl"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { swapTransactionService } from "src/integration/icpswap/service/transaction-service"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { SwapStage } from "src/integration/icpswap/types/enums"

import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100c88f8f46ee5c23a748026498ddc7ed2104782ea02cd266170a470587d7c2f932",
  "0b897d4ee58ff13eed9cc5f1aa6de0f009423b9a866b384b2e52db08559c882b",
]

const mockPrincipal =
  "4pw67-jou3d-xb4py-6pnvx-5p75x-pp3mi-ywe4j-bhmmq-l3354-awsws-kae"

describe("shroff test", () => {
  jest.setTimeout(900000)

  it("shroff quote test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const quote = await shroff.getQuote(0.5)
    await sleep(1)

    const revalidatedQuote = await shroff.validateQuote()
    expect(revalidatedQuote.getTargetAmount().toNumber()).toEqual(
      quote.getTargetAmount().toNumber(),
    )

    expect(quote.getSourceAmountPrettified()).toEqual("0.5")
  })

  //too long test. Unskip when needed
  it("shroff transfer test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    let ledgerICRC = new Icrc1Pair(targetLedger, undefined)
    let seconds = 0
    const balance = await ledgerICRC.getBalance(mockPrincipal)

    const quote = await shroff.getQuote(0.001)

    let mockId = Ed25519KeyIdentity.fromParsedJson(mock)

    const transactionBeforeSwap = await swapTransactionService.getTransactions(
      mockPrincipal,
    )

    const a: Promise<SwapTransaction> = shroff.swap(mockId)

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(
      SwapStage.TransferNFID,
    )

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferNFID &&
      seconds < 10
    ) {
      await sleep(1)
      seconds++
    }

    let trs = shroff.getSwapTransaction() as SwapTransactionImpl

    expect(trs?.getStage()).toEqual(SwapStage.TransferSwap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferSwap &&
      seconds < 10
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Deposit)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Deposit &&
      seconds < 30
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Swap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Swap &&
      seconds < 50
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Withdraw)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Withdraw &&
      seconds < 70
    ) {
      await sleep(1)
      seconds++
    }

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Completed)

    const balanceUpgraded = await ledgerICRC.getBalance(mockPrincipal)

    expect(balanceUpgraded).toBeGreaterThan(balance)

    const targetFee = (await ledgerICRC.getMetadata()).fee

    expect(Number(balanceUpgraded - balance)).toEqual(
      quote.getTargetAmount().minus(Number(targetFee)).toNumber(),
    )

    const transactionsAfterSwap = await swapTransactionService.getTransactions(
      mockPrincipal,
    )

    expect(transactionsAfterSwap.length).toBeGreaterThan(
      transactionBeforeSwap.length,
    )
  })
})

const sleep = async (seconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
