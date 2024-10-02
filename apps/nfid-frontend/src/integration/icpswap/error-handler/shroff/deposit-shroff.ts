import {ShroffImpl} from "src/integration/icpswap/impl/shroff-impl";
import {SignIdentity} from "@dfinity/agent";
import {SwapTransaction} from "src/integration/icpswap/swap-transaction";
import {hasOwnProperty, replaceActorIdentity} from "@nfid/integration";
import {SwapError} from "src/integration/icpswap/errors/swap-error";
import {WithdrawArgs} from "../../idl/SwapPool"

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
      //maybe not async
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError(`Swap error: ${e}`)
      }
      await this.restoreTransaction()
      //TODO @vitaly to change according to the new error handling logic
      throw new SwapError()
    }
  }


  protected async withdraw(): Promise<bigint> {
    const args: WithdrawArgs = {
      //TODO play with numbers somehow
      amount: BigInt(this.requestedQuote!.getAmountWithoutWidgetFee().toNumber() - Number(this.source.fee)),
      token: this.source.ledger,
      fee: this.source.fee,
    }
    return this.swapPoolActor.withdraw(args).then((result) => {
      if (hasOwnProperty(result, "ok")) {
        const id = result.ok as bigint
        this.swapTransaction!.setWithdraw(id)
        return id
      }
      throw new Error("Withdraw error: " + JSON.stringify(result.err))
    })
  }
}
