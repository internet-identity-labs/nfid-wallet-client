import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { SlippageQuoteError } from "src/integration/swap/errors/types"
import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import { authState } from "@nfid/integration"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

const mockPrincipal =
  "535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe"

describe("shroff test", () => {
  jest.setTimeout(1500000)

  it("shroff quote test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"
    const shroff = await new IcpSwapShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const quote = await shroff.getQuote("0.01")
    await sleep(1)

    expect(quote.getSourceAmountPrettified()).toEqual("0.01")
    quote.getWidgetFeeAmount()
  })

  it.skip("shroff transfer test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const shroff = await new IcpSwapShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const ledgerICRC = new Icrc1Pair(targetLedger, undefined)
    let seconds = 0
    const balance = await ledgerICRC.getBalance(mockPrincipal)

    const quote = await shroff.getQuote("0.001")

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

    await authState.set({
      identity: delegationIdentity,
      delegationIdentity: delegationIdentity,
    })

    const transactionBeforeSwap = await swapTransactionService.getTransactions()

    const a: Promise<SwapTransaction> = shroff.swap(delegationIdentity)

    const trs = shroff.getSwapTransaction() as IcpSwapTransactionImpl

    expect(trs?.getStage()).toEqual(SwapStage.TransferSwap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferSwap &&
      seconds < 60
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Deposit)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Deposit &&
      seconds < 90
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Swap)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Swap &&
      seconds < 120
    ) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Withdraw)

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.Withdraw &&
      seconds < 150
    ) {
      await sleep(1)
      seconds++
    }

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(
      SwapStage.TransferNFID,
    )

    while (
      shroff.getSwapTransaction()?.getStage() === SwapStage.TransferNFID &&
      seconds < 180
    ) {
      await sleep(1)
      seconds++
    }

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Completed)
    expect(shroff.getSwapTransaction()?.getProvider()).toEqual(SwapName.ICPSwap)

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
