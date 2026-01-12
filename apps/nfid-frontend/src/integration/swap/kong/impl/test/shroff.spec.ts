import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import { authState } from "@nfid/integration"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

describe("Shroff Kong test", () => {
  jest.setTimeout(1500000)

  it.skip("should swap 2 tokens icrc2", async () => {
    const identity = Ed25519KeyIdentity.fromParsedJson(mock)
    const kongShroff = await new KongShroffBuilder()
      .withSource("ryjl3-tyaaa-aaaaa-aaaba-cai")
      .withTarget("o7oak-iyaaa-aaaaq-aadzq-cai")
      .build()

    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      identity,
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

    await kongShroff.getQuote("0.001")

    const ledgerICRC = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", undefined)
    const blncBefore = await ledgerICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    const kongICRC = new Icrc1Pair("o7oak-iyaaa-aaaaq-aadzq-cai", undefined)
    const balanceKong = await kongICRC.getBalance(
      identity.getPrincipal().toText(),
    )

    const resp2 = await kongShroff.swap(identity)

    const balance = await ledgerICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    console.log("difference ICP", blncBefore - balance)
    const updatedBalanceKong = await kongICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    console.log("difference KONG", updatedBalanceKong - balanceKong)
    expect(updatedBalanceKong - balanceKong).toBeGreaterThan(0)
    expect(resp2.getStage()).toEqual(SwapStage.Completed)
    expect(resp2.getProvider()).toEqual(SwapName.Kongswap)

    const transactionsAfterSwap = (
      await swapTransactionService.getTransactions()
    ).find((t) => t.getStartTime() === resp2.getStartTime())

    expect(transactionsAfterSwap!.getProvider()).toEqual(SwapName.Kongswap)
  })

  it.skip("should swap 2 tokens icrc1", async () => {
    const identity = Ed25519KeyIdentity.fromParsedJson(mock)
    const kongShroff = await new KongShroffBuilder()
      .withSource("ryjl3-tyaaa-aaaaa-aaaba-cai")
      .withTarget("o7oak-iyaaa-aaaaq-aadzq-cai")
      .build()

    jest.spyOn(kongShroff as any, "icrc2supported").mockImplementation(() => {
      return Promise.resolve(false)
    })

    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      identity,
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

    await kongShroff.getQuote("0.001")

    const ledgerICRC = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", undefined)
    const blncBefore = await ledgerICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    const kongICRC = new Icrc1Pair("o7oak-iyaaa-aaaaq-aadzq-cai", undefined)
    const balanceKong = await kongICRC.getBalance(
      identity.getPrincipal().toText(),
    )

    const resp2 = await kongShroff.swap(identity)

    const balance = await ledgerICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    console.log("difference ICP", blncBefore - balance)
    const updatedBalanceKong = await kongICRC.getBalance(
      identity.getPrincipal().toText(),
    )
    console.log("difference KONG", updatedBalanceKong - balanceKong)
    expect(updatedBalanceKong - balanceKong).toBeGreaterThan(0)
    expect(resp2.getStage()).toEqual(SwapStage.Completed)
    expect(resp2.getProvider()).toEqual(SwapName.Kongswap)

    const transactionsAfterSwap = (
      await swapTransactionService.getTransactions()
    ).find((t) => t.getStartTime() === resp2.getStartTime())

    expect(transactionsAfterSwap!.getProvider()).toEqual(SwapName.Kongswap)
  })
})
