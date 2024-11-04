import {DelegationChain, DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { ShroffBuilder } from "src/integration/icpswap/impl/shroff-impl"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { swapTransactionService } from "src/integration/icpswap/service/transaction-service"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { SwapStage } from "src/integration/icpswap/types/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import {authState} from "@nfid/integration";
const mock: JsonnableEd25519KeyIdentity  = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

const mockPrincipal =
  "535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe"

describe("shroff test", () => {
  jest.setTimeout(900000)

  it("shroff quote test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const quote = await shroff.getQuote(0.0011)
    await sleep(1)

    const revalidatedQuote = await shroff.validateQuote()
    expect(revalidatedQuote.getTargetAmount().toNumber()).toEqual(
      quote.getTargetAmount().toNumber(),
    )

    expect(quote.getSourceAmountPrettified()).toEqual("0.0011")
    quote.getWidgetFeeAmount()
    BigInt(quote.getAmountWithoutWidgetFee().toNumber())
  })

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

    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mock)
    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chainRoot,
    )

    authState.set({
      identity: delegationIdentity,
      delegationIdentity: delegationIdentity,
    })

    const transactionBeforeSwap = await swapTransactionService.getTransactions()

    const a: Promise<SwapTransaction> = shroff.swap(delegationIdentity)


    let trs = shroff.getSwapTransaction() as SwapTransactionImpl

    expect(trs?.getStage()).toEqual(SwapStage.TransferSwap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferSwap &&
      seconds < 30
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Deposit)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Deposit &&
      seconds < 50
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Swap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Swap &&
      seconds < 70
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Withdraw)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Withdraw &&
      seconds < 90
    ) {
      await sleep(1)
      seconds++
    }

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.TransferNFID)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferNFID &&
      seconds < 110
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

    const transactionsAfterSwap = await swapTransactionService.getTransactions()

    expect(transactionsAfterSwap.length).toBeGreaterThan(
      transactionBeforeSwap.length,
    )
  })
})

const sleep = async (seconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
