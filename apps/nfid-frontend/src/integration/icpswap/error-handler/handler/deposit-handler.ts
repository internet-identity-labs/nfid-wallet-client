import { SignIdentity } from "@dfinity/agent"
import { DepositErrorShroffBuilder } from "src/integration/icpswap/error-handler/buiilder/deposit-shroff-builder"
import { TransactionErrorHandlerAbstract } from "src/integration/icpswap/error-handler/error-handler-abstract"
import { QuoteImpl } from "src/integration/icpswap/impl/quote-impl"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

export class DepositHandler extends TransactionErrorHandlerAbstract {
  async finishTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
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
    const quote = new QuoteImpl(
      trs.getAmount(),
      BigInt(trs.getQuote()),
      sourceLedger,
      targetLedger,
      undefined,
      undefined,
    )

    const shroff = await new DepositErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()

    shroff.setQuote(quote)
    shroff.setTransaction(trs)

    return await shroff.swap(delegation)
  }

  getCompleteType(): CompleteType {
    return CompleteType.Rollback
  }
}
