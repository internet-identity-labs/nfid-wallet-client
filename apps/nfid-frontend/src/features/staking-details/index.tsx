import { SignIdentity } from "@dfinity/agent"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { useSWR } from "@nfid/swr"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchStakedToken } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"
import { getIdentity } from "../transfer-modal/utils"

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()
  const [identity, setIdentity] = useState<SignIdentity>()

  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const {
    data: stakedToken,
    isLoading,
    isValidating,
  } = useSWR(
    tokenSymbol ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    const getParams = async () => {
      if (!stakedToken) return
      const token = stakedToken.getToken()
      const rootCanisterId = token.getRootSnsCanister()
      if (!rootCanisterId) return
      const canister_ids = await stakingService.getTargets(rootCanisterId)
      if (!canister_ids) return

      const identity = await getIdentity([
        canister_ids,
        token.getTokenAddress(),
      ])
      setIdentity(identity)
    }

    getParams()
  }, [stakedToken])

  const onRedeemOpen = () => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      isLoading={isLoading || isValidating}
      identity={identity}
    />
  )
}

export default StakingDetailsPage
