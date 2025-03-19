import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { FT } from "frontend/integration/ft/ft"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

export const getStakingParams = async (ft: FT, identity: SignIdentity) => {
  return await stakingService.getStakingParams(ft, identity)
}

export const getTargets = async (rootCanisterId: Principal) => {
  return await stakingService.getTargets(rootCanisterId)
}
