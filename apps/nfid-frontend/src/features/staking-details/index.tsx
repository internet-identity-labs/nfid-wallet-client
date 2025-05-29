import { SignIdentity } from "@dfinity/agent"
import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import { hexStringToUint8Array } from "@dfinity/utils"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { useSWR } from "@nfid/swr"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchDelegates, fetchStakedToken } from "../staking/utils"
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
    () => fetchStakedToken(tokenSymbol!, identity!),
    { revalidateOnFocus: false },
  )

  const { data: delegates } = useSWR(
    tokenSymbol && identity ? ["stakedTokenDelegates", tokenSymbol] : null,
    () =>
      fetchDelegates(identity, stakedToken?.getToken().getRootSnsCanister()),
    { revalidateOnFocus: false },
  )

  const updateDelegates = async (value: string, userNeuron?: NeuronId) => {
    const root = stakedToken?.getToken().getRootSnsCanister()

    if (!identity || !root || !userNeuron) return

    stakingService.reFollowNeurons(
      { id: hexStringToUint8Array(value) },
      identity,
      root,
      userNeuron,
    )
  }

  useEffect(() => {
    const getSignIdentity = async () => {
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

    getSignIdentity()
  }, [stakedToken])

  const onRedeemOpen = (id: string) => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send({ type: "ASSIGN_STAKE_ID", data: id })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      isLoading={isLoading || isValidating || !delegates}
      identity={identity}
      delegates={delegates}
      updateDelegates={updateDelegates}
    />
  )
}

export default StakingDetailsPage
