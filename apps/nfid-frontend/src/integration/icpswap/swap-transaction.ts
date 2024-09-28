import { SwapStage } from "src/integration/icpswap/types/enums"

export interface SwapTransaction {
  setCallback: (cb: (stage: SwapStage) => void) => void
  getStage(): SwapStage
}
