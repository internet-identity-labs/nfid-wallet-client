import {actor, hasOwnProperty} from "@nfid/integration";
import {idlFactory as SwapFactoryIDL} from "./../idl/SwapFactory"
import {_SERVICE as SwapFactory, GetPoolArgs, PoolData} from "./../idl/SwapFactory.d"

class IcpSwapService {

  private poolActor: SwapFactory

  constructor() {
    this.poolActor = actor<SwapFactory>(
      "4mmnk-kiaaa-aaaag-qbllq-cai",
      SwapFactoryIDL,
    )
  }

  getPoolFactory(sourceCanister: string, targetCanister: string): Promise<PoolData> {
    const a: GetPoolArgs = {
      fee: BigInt(3000),
      token0: {address: sourceCanister, standard: "ICRC1"},
      token1: {address: targetCanister, standard: "ICRC1"},
    }
    return this.poolActor.getPool(a).then((pool) => {
      if (hasOwnProperty(pool, "ok")) {
        const data: PoolData = pool.ok as PoolData
        return data
      }
      throw new Error("TODO Error handling") //TODO
    })
  }
}

export const icpSwapService = new IcpSwapService()
