import { SignIdentity } from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { TransactionErrorHandlerAbstract } from "src/integration/swap/icpswap/error-handler/error-handler-abstract"
import { SourceInputCalculator } from "src/integration/swap/icpswap/impl/calculator"
import { IcpSwapQuoteImpl } from "src/integration/swap/icpswap/impl/icp-swap-quote-impl"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

export abstract class AbstractErrorHandler extends TransactionErrorHandlerAbstract {
  async completeTransaction(
    delegation: SignIdentity,
  ): Promise<SwapTransaction> {
    console.debug("Trying to complete transaction")
    let trs = this.getTransaction()
    const allOracle = await icrc1OracleService.getICRC1Canisters()
    const sourceLedger = allOracle.find((canister) => {
      return canister.ledger === trs.getSourceLedger()
    })
    const targetLedger = allOracle.find((canister) => {
      return canister.ledger === trs.getTargetLedger()
    })
    if (!sourceLedger || !targetLedger) {
      throw new Error("Ledger not found")
    }

    const userSourceInput = new BigNumber(trs.getSourceAmount().toString())
      .div(10 ** sourceLedger.decimals)
      .toFixed()

    console.debug("User transaction: ", trs)
    const preCalculation = new SourceInputCalculator(
      BigInt(Number(trs.getSourceAmount())),
      sourceLedger.fee,
    )

    const quote = new IcpSwapQuoteImpl(
      userSourceInput,
      preCalculation,
      BigInt(trs.getQuote()),
      sourceLedger,
      targetLedger,
      undefined,
      undefined,
    )

    const shroff = await this.buildShroff(trs)

    shroff.setQuote(quote)
    shroff.setTransaction(trs)

    return await shroff.swap(delegation)
  }

  protected abstract buildShroff(trs: SwapTransaction): Promise<Shroff>
}
