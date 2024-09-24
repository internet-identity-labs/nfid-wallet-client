import { Principal } from "@dfinity/principal"
import { idlFactory as SwapPoolIDL } from "src/integration/icpswap/idl/SwapPool"
import { _SERVICE as SwapPool } from "src/integration/icpswap/idl/SwapPool.d"

import { actor, hasOwnProperty } from "@nfid/integration"

import {
  INSUFFICIENT_FUNDS,
  SERVICE_UNAVAILABLE,
  UNSUPPORTED_TOKEN,
} from "../constants"
import {
  ServiceUnavailableError,
  InsufficientFundsError,
  UnsupportedTokenError,
} from "../errors"
import { idlFactory as SwapFactoryIDL } from "./../idl/SwapFactory"
import {
  _SERVICE as SwapFactory,
  GetPoolArgs,
  PoolData,
} from "./../idl/SwapFactory.d"

class IcpSwapService {
  private poolActor: SwapFactory

  constructor() {
    this.poolActor = actor<SwapFactory>(
      "4mmnk-kiaaa-aaaag-qbllq-cai",
      SwapFactoryIDL,
    )
  }

  getPoolFactory(
    sourceCanister: string,
    targetCanister: string,
  ): Promise<PoolData> {
    const a: GetPoolArgs = {
      fee: BigInt(3000),
      token0: { address: sourceCanister, standard: "ICRC1" },
      token1: { address: targetCanister, standard: "ICRC1" },
    }
    return this.poolActor.getPool(a).then((pool) => {
      if (hasOwnProperty(pool, "ok")) {
        const data: PoolData = pool.ok as PoolData
        return data
      }

      if (hasOwnProperty(pool, "InternalError")) {
        throw new ServiceUnavailableError(SERVICE_UNAVAILABLE)
      }
      if (hasOwnProperty(pool, "UnsupportedToken")) {
        throw new UnsupportedTokenError(UNSUPPORTED_TOKEN)
      }
      if (hasOwnProperty(pool, "InsufficientFunds")) {
        throw new InsufficientFundsError(INSUFFICIENT_FUNDS)
      }
      console.error("Not able to get pool for pair: " + pool.err)
      throw new ServiceUnavailableError(SERVICE_UNAVAILABLE)
    })
  }

  async getBalance(
    swapPoolCanister: string,
    principal: Principal,
  ): Promise<{
    balance1: bigint
    balance2: bigint
  }> {
    const swapPoolActor = actor<SwapPool>(swapPoolCanister, SwapPoolIDL)

    const result = await swapPoolActor.getUserUnusedBalance(principal)

    if (hasOwnProperty(result, "ok")) {
      return result.ok as {
        balance1: bigint
        balance2: bigint
      }
    }
    throw new Error("TODO Error handling")
  }
}

export const icpSwapService = new IcpSwapService()
