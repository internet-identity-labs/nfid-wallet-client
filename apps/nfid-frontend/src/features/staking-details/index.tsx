import { SignIdentity } from "@dfinity/agent"
import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import { hexStringToUint8Array } from "@dfinity/utils"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchTokens } from "../fungible-token/utils"
import { fetchDelegates, fetchStakedToken } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"
import { getIdentity } from "../transfer-modal/utils"

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()
  const [identity, setIdentity] = useState<SignIdentity>()
  const [identityLoading, setIdentityLoading] = useState(false)

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const token = useMemo(() => {
    return tokens.find((t) => t.getTokenSymbol() === tokenSymbol)
  }, [tokens, tokenSymbol])

  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const {
    data: stakedToken,
    isLoading,
    isValidating,
  } = useSWR(
    tokenSymbol && identity ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!, identity),
    { revalidateOnFocus: false },
  )

  const { data: delegates } = useSWR(
    stakedToken && tokenSymbol && identity
      ? ["stakedTokenDelegates", tokenSymbol]
      : null,
    () =>
      fetchDelegates(identity, stakedToken?.getToken().getRootSnsCanister()),
    { revalidateOnFocus: false },
  )

  const updateDelegates = async (value: string, userNeuron?: NeuronId) => {
    const root = stakedToken?.getToken().getRootSnsCanister()

    if (!identity || !root || !userNeuron) return

    await stakingService.reFollowNeurons(
      { id: hexStringToUint8Array(value) },
      identity,
      root,
      userNeuron,
    )
  }

  const updateICPDelegates = async (value: string, userNeuron?: bigint) => {
    if (!identity || !userNeuron) return

    await stakingService.reFollowICPNeurons(BigInt(value), identity, userNeuron)
  }

  const validateNeuron = (neuronId: string): Promise<true | string> => {
    const root = stakedToken?.getToken().getRootSnsCanister()
    return stakingService.validateNeuron(identity, root, {
      id: hexStringToUint8Array(neuronId),
    })
  }

  const validateICPNeuron = (neuronId: string): Promise<true | string> => {
    return stakingService.validateICPNeuron(identity, BigInt(neuronId))
  }

  useEffect(() => {
    const getSignIdentity = async () => {
      setIdentityLoading(true)
      if (!token) return
      const rootCanisterId = token.getRootSnsCanister()
      if (!rootCanisterId) return
      const canister_ids = await stakingService.getTargets(rootCanisterId)
      if (!canister_ids) return

      const identity = await getIdentity([
        canister_ids,
        token.getTokenAddress(),
      ])
      setIdentity(identity)
      setIdentityLoading(false)
    }

    getSignIdentity()
  }, [token])

  const onRedeemOpen = (id: string) => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send({ type: "ASSIGN_STAKE_ID", data: id })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      isLoading={isLoading || isValidating || identityLoading || !delegates}
      identity={identity}
      delegates={delegates}
      updateDelegates={updateDelegates}
      updateICPDelegates={updateICPDelegates}
      validateNeuron={
        token?.getTokenAddress() === ICP_CANISTER_ID
          ? validateICPNeuron
          : validateNeuron
      }
    />
  )
}

export default StakingDetailsPage
