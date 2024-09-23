import { SwapStage } from "src/integration/icpswap/types/enums"

export interface SwapTransaction {
  getStage(): SwapStage
}
