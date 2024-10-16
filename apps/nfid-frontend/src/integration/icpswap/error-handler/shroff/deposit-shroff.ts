import { SignIdentity } from "@dfinity/agent"
import {
  ShroffBuilder,
  ShroffImpl,
} from "src/integration/icpswap/impl/shroff-impl"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { hasOwnProperty, replaceActorIdentity } from "@nfid/integration"

import { WithdrawError, ExchangeError } from "../../errors"
import { WithdrawArgs } from "../../idl/SwapPool.d"

export class ShroffDepositErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      console.debug("Transaction restarted")
      await this.deposit()
      this.restoreTransaction()
      await this.withdraw()
      console.debug("Withdraw done")
      this.swapTransaction.setCompleted()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError((e as Error).message)
      }
      await this.restoreTransaction()
      throw e
    }
  }

  protected async withdraw(): Promise<bigint> {
    const args: WithdrawArgs = {
      //TODO play with numbers somehow
      amount: BigInt(
        this.requestedQuote!.getAmountWithoutWidgetFee().toNumber() -
          Number(this.source.fee),
      ),
      token: this.source.ledger,
      fee: this.source.fee,
    }
    try {
      return this.swapPoolActor.withdraw(args).then((result) => {
        if (hasOwnProperty(result, "ok")) {
          const id = result.ok as bigint
          this.swapTransaction!.setWithdraw(id)
          return id
        }

        console.error("Withdraw error: " + JSON.stringify(result.err))
        throw new WithdrawError()
      })
    } catch (e) {
      console.error("Withdraw error: " + e)
      throw new WithdrawError()
    }
  }
}

export class DepositErrorShroffBuilder extends ShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffDepositErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
