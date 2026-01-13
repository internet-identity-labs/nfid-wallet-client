import { SignIdentity } from "@dfinity/agent"

import { hasOwnProperty, replaceActorIdentity } from "@nfid/integration"

import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import {
  IcpSwapShroffBuilder,
  ShroffIcpSwapImpl,
} from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

import { WithdrawError } from "../../../errors/types"
import { WithdrawArgs } from "../../idl/SwapPool.d"

export class ShroffDepositErrorHandler extends ShroffIcpSwapImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      this.delegationIdentity = delegationIdentity
      const balance = await this.swapPoolActor.getUserUnusedBalance(
        this.delegationIdentity.getPrincipal(),
      )
      console.log(`Balance: ${JSON.stringify(balance)}`)
      console.log("Transaction restarted")
      if (this.swapTransaction.getErrors().length === 0) {
        console.debug("Deposit timeout error")
        return this.handleDepositTimeoutError()
      } else {
        try {
          await this.deposit()
        } catch (_e) {
          //it's possible that deposit already done but transaction progress was not stored properly
          //in this case we can optimistically try to withdraw
          console.log("Optimistic withdraw")
        }
        console.debug("Deposit done")
        this.restoreTransaction()
        await this.withdraw()
        console.debug("Withdraw done")
        this.swapTransaction.setCompleted()
        await this.restoreTransaction()
        console.debug("Transaction stored")
        return this.swapTransaction
      }
    } catch (e) {
      console.error("Deposit retry error:", e)
      this.swapTransaction.setError(`Deposit retry error: ${e}`)
      await this.restoreTransaction()
      throw e
    }
  }

  protected async withdraw(): Promise<bigint> {
    const args: WithdrawArgs = {
      amount: BigInt(this.requestedQuote!.getSourceSwapAmount().toNumber()),
      token: this.source.ledger,
      fee: this.source.fee,
    }

    const balance = await this.swapPoolActor.getUserUnusedBalance(
      this.delegationIdentity!.getPrincipal(),
    )
    console.debug(`Balance: ${JSON.stringify(balance)}`)
    console.debug(`Withdraw args: ${JSON.stringify(args)}`)
    try {
      return this.swapPoolActor.withdraw(args).then((result) => {
        if (hasOwnProperty(result, "ok")) {
          const id = result.ok as bigint
          ;(this.swapTransaction! as IcpSwapTransactionImpl).setWithdraw(id)
          return id
        }

        console.error(`Withdraw error: ${JSON.stringify(result.err)}`)
        throw new WithdrawError(JSON.stringify(result.err))
      })
    } catch (e) {
      console.error(`Withdraw error: ${e}`)
      throw new WithdrawError(e as Error)
    }
  }

  private async handleDepositTimeoutError(): Promise<SwapTransaction> {
    await this.withdraw()
    console.debug("Withdraw done")
    this.swapTransaction!.setCompleted()
    await this.restoreTransaction()
    console.debug("Transaction stored")
    return this.swapTransaction!
  }
}

export class DepositErrorShroffBuilder extends IcpSwapShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffDepositErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
