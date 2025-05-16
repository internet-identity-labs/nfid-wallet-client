import { SignIdentity } from "@dfinity/agent"
import { Redeem } from "packages/ui/src/organisms/send-receive/components/redeem"
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { useSWR } from "@nfid/swr"

import { fetchStakedToken } from "frontend/features/staking/utils"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

import { SendStatus } from "../types"
import { getIdentity } from "../utils"

export interface ITransferReceive {
  onClose: () => void
  stakeId: string | undefined
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const RedeemStake = ({
  onClose,
  setErrorMessage,
  setSuccessMessage,
  stakeId,
}: ITransferReceive) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [identity, setIdentity] = useState<SignIdentity>()
  const location = useLocation()
  const tokenSymbol = location.pathname.split("/")[3]

  const { data: stakedToken } = useSWR(
    tokenSymbol ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!, identity!),
    { revalidateOnFocus: false },
  )

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

  const stakeToRedeem = useMemo(() => {
    return stakedToken
      ?.getAvailable()
      .find((stake) => stake.getStakeIdFormatted() === stakeId)
  }, [stakedToken, stakeId])

  const redeem = () => {
    if (!identity || !stakeToRedeem) return
    setIsSuccessOpen(true)
    stakeToRedeem
      .redeem(identity)
      .then(() => {
        setSuccessMessage(`Staked ${stakeId} redeemed successful`)
        setStatus(SendStatus.COMPLETED)
      })
      .catch((e) => {
        console.error("Redeem error: ", e)
        setError((e as Error).message)
        setStatus(SendStatus.FAILED)
        setErrorMessage("Something went wrong")
      })
  }

  return (
    <Redeem
      onClose={onClose}
      redeem={redeem}
      stakeToRedeem={stakeToRedeem}
      isSuccessOpen={isSuccessOpen}
      status={status}
      error={error}
      isLoading={!identity || !stakeToRedeem}
    />
  )
}
