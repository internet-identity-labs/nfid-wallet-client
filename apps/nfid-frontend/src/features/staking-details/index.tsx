import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { ICP_ROOT_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR } from "@nfid/swr"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchStakedToken } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"
import { getIdentity } from "../transfer-modal/utils"

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()
  const [identity, setIdentity] = useState<SignIdentity>()
  const [identityLoading, setIdentityLoading] = useState(false)

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

  const onRedeemOpen = (id: string) => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send({ type: "ASSIGN_STAKE_ID", data: id })
    send("SHOW")
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      isLoading={isLoading || isValidating || identityLoading}
      identity={identity}
    />
  )
}

export default StakingDetailsPage
