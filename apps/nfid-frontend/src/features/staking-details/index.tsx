import { NeuronId } from "@dfinity/sns/dist/candid/sns_governance"
import { hexStringToUint8Array } from "@dfinity/utils"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useMemo } from "react"
import { useParams } from "react-router-dom"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { useIdentity } from "frontend/hooks/identity"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchTokens } from "../fungible-token/utils"
import { fetchDelegates, fetchStakedTokens } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()
  const { identity } = useIdentity()

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const activeTokens = useMemo(() => {
    return tokens?.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const { initedTokens } = useTokensInit(activeTokens)

  const token = useMemo(() => {
    return tokens.find((t) => t.getTokenSymbol() === tokenSymbol)
  }, [tokens, tokenSymbol])

  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const { data: stakedTokens, isLoading } = useSWRWithTimestamp(
    initedTokens ? "stakedTokens" : null,
    () => fetchStakedTokens(initedTokens!, false),
    {
      revalidateOnFocus: false,
    },
  )

  const stakedToken = useMemo(() => {
    return stakedTokens?.find(
      (s) => s.getToken().getTokenSymbol() === tokenSymbol,
    )
  }, [stakedTokens, tokenSymbol])

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

  const onRedeemOpen = (id: string) => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send({ type: "ASSIGN_STAKE_ID", data: id })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      initedTokens={initedTokens}
      isLoading={isLoading}
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
