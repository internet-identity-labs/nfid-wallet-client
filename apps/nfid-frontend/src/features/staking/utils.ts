import { Principal } from "@dfinity/principal"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

export const getTargets = async (rootCanisterId: Principal) => {
  return await stakingService.getTargets(rootCanisterId)
}
