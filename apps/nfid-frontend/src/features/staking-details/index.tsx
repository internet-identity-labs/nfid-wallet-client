import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext } from "react"
import { useParams } from "react-router-dom"

import { useSWR } from "@nfid/swr"

import { ProfileContext } from "frontend/provider"

import { fetchStakedToken } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"

export interface IStakingDetails {
  stakingBalance: string
  staked: string
  rewards: string
  symbol: string
  name: string
  logo: string
}

const stakingDetails = {
  stakingBalance: "14127.15",
  staked: "13279.521",
  rewards: "847.629",
  symbol: "ICP",
  name: "Internet Computer",
  logo: "#",
}

export enum StakingType {
  Available = "Available",
  Unlocking = "Unlocking",
  Locked = "Locked",
}

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()

  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const { data: stakedToken, isLoading } = useSWR(
    tokenSymbol ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!),
  )

  const onRedeemOpen = () => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      stakingDetails={stakingDetails}
      isLoading={isLoading}
    />
  )
}

export default StakingDetailsPage
