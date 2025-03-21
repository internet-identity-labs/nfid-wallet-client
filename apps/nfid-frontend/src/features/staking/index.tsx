import { Staking } from "packages/ui/src/organisms/staking"
import { useNavigate } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

import { fetchStakedTokens } from "./utils"

const StakingPage = () => {
  const navigate = useNavigate()

  const { data: stakedTokens = [], isLoading } = useSWRWithTimestamp(
    "stakedTokens",
    fetchStakedTokens,
    { revalidateOnFocus: false },
  )

  const totalBalances = stakingService.getTotalBalances(stakedTokens)

  return (
    <Staking
      isLoading={isLoading}
      stakedTokens={stakedTokens}
      links={ProfileConstants}
      navigate={navigate}
      totalBalances={totalBalances}
    />
  )
}

export default StakingPage
