import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { useActor } from "@xstate/react"
import { Staking } from "packages/ui/src/organisms/staking"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ICP_ROOT_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"
import { getIdentity } from "../transfer-modal/utils"
import { fetchStakedTokens } from "./utils"

const StakingPage = () => {
  const navigate = useNavigate()
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [identity, setIdentity] = useState<SignIdentity>()
  const [identityLoading, setIdentityLoading] = useState(false)

  const onStakeClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send("SHOW")
  }

  const { data: stakedTokens = [], isLoading } = useSWRWithTimestamp(
    identity ? "stakedTokens" : null,
    () => fetchStakedTokens(identity),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    const getSignIdentity = async () => {
      setIdentityLoading(true)
      const rootCanisterId = Principal.fromText(ICP_ROOT_CANISTER_ID)
      if (!rootCanisterId) return
      const canister_ids = await stakingService.getTargets(rootCanisterId)
      if (!canister_ids) return

      const identity = await getIdentity([canister_ids])
      setIdentity(identity)
      setIdentityLoading(false)
    }

    getSignIdentity()
  }, [])

  const totalBalances = stakingService.getTotalBalances(stakedTokens)

  return (
    <Staking
      isLoading={isLoading || identityLoading}
      stakedTokens={stakedTokens}
      links={ProfileConstants}
      navigate={navigate}
      totalBalances={totalBalances}
      onStakeClick={onStakeClick}
    />
  )
}

export default StakingPage
