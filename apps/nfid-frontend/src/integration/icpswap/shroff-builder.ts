import {Shroff} from "src/integration/icpswap/shroff"
import {icpSwapService} from "src/integration/icpswap/service/icpswap-service"

import {ICRC1TypeOracle,} from "@nfid/integration"
import {icrc1OracleService} from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import {PoolData} from "./idl/SwapFactory.d"
import {ShroffImpl} from "src/integration/icpswap/impl/shroff-impl";


export class ShroffBuilder {
  private source: string | undefined
  private target: string | undefined
  protected poolData: PoolData | undefined
  protected sourceOracle: ICRC1TypeOracle | undefined
  protected targetOracle: ICRC1TypeOracle | undefined
  protected zeroForOne: boolean | undefined

  public withSource(source: string): ShroffBuilder {
    this.source = source
    return this
  }

  public withTarget(target: string): ShroffBuilder {
    this.target = target
    return this
  }

  public async build(): Promise<Shroff> {
    if (!this.source) {
      throw new Error("Source is required")
    }

    if (!this.target) {
      throw new Error("Target is required")
    }

    const [poolData, icrc1canisters]: [PoolData, ICRC1TypeOracle[]] =
      await Promise.all([
        icpSwapService.getPoolFactory(this.source, this.target),
        icrc1OracleService.getICRC1Canisters(),
      ])

    this.poolData = poolData

    const st: ICRC1TypeOracle[] = icrc1canisters.filter(
      (icrc1) => icrc1.ledger === this.source || icrc1.ledger === this.target,
    )

    this.sourceOracle = st.find((icrc1) => icrc1.ledger === this.source)
    this.targetOracle = st.find((icrc1) => icrc1.ledger === this.target)

    if (!this.sourceOracle || !this.targetOracle) {
      throw new Error("ICRC1 not found")
    }

    this.zeroForOne = this.poolData.token0.address === this.source;

    return this.buildShroff()
  }

  protected buildShroff(): Shroff {
    return new ShroffImpl(this.poolData!, this.zeroForOne!, this.sourceOracle!, this.targetOracle!)

  }
}
