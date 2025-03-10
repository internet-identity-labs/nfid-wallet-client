import { Staking } from "packages/ui/src/organisms/staking"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

const StakingPage = () => {
  return (
    <Staking isLoading={false} stakes={["stake 1"]} links={ProfileConstants} />
  )
}

export default StakingPage
