import { SignIdentity } from "@dfinity/agent"

import { hasOwnProperty, replaceActorIdentity } from "@nfid/integration"

import { WithdrawError } from "src/integration/swap/errors/types"
import {
  IcpSwapShroffBuilder,
  ShroffIcpSwapImpl,
} from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

import { WithdrawArgs } from "../../idl/SwapPool.d"

export class ShroffSwapErrorHandler extends ShroffIcpSwapImpl {
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
      console.debug(`Balance: ${JSON.stringify(balance)}`)

      console.debug("Transaction restarted")
      if (this.swapTransaction.getErrors().length === 0) {
        console.debug("Swap timeout error")
        return this.handleSwapTimeoutError()
      } else {
        try {
          await this.withdraw()
        } catch (e: any) {
          if (e.message.includes("InsufficientFunds")) {
            await super.withdraw()
          }
        }
        console.debug("Withdraw done")
        this.swapTransaction.setCompleted()
        await this.restoreTransaction()
        console.debug("Transaction stored")
        return this.swapTransaction
      }
    } catch (e) {
      console.error("Swap error:", e)
      this.swapTransaction.setError(`Swap retry error: ${e}`)
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
          this.swapTransaction!.setWithdraw(id)
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

  private async handleSwapTimeoutError(): Promise<SwapTransaction> {
    await super.withdraw()
    console.debug("Withdraw done")
    this.swapTransaction!.setCompleted()
    await this.restoreTransaction()
    console.debug("Transaction stored")
    return this.swapTransaction!
  }
}

export class SwapErrorShroffBuilder extends IcpSwapShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffSwapErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
