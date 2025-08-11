import { resetIntegrationCache } from "packages/integration/src/cache"
import { Redeem } from "packages/ui/src/organisms/send-receive/components/redeem"
import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { mutate, useSWR } from "@nfid/swr"

import { fetchStakedToken } from "frontend/features/staking/utils"
import { useIdentity } from "frontend/hooks/identity"

import { SendStatus } from "../types"

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
  const { identity, isLoading: identityLoading } = useIdentity()
  const location = useLocation()
  const tokenSymbol = location.pathname.split("/")[3]

  const { data: stakedToken, isLoading } = useSWR(
    tokenSymbol && identity ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!, identity!),
    { revalidateOnFocus: false },
  )

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
        resetIntegrationCache(["getStakedTokens"])
        mutate(["stakedToken", tokenSymbol])
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
      isLoading={isLoading || identityLoading}
    />
  )
}
